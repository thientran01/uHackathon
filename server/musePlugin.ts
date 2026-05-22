// ============================================================
//  MUSE BACKEND  —  Vite plugin (Thien's piece)
// ------------------------------------------------------------
//  Adds two endpoints to the Vite dev server (same origin, no CORS,
//  one `npm run dev` process):
//
//    POST /api/muse/chat   -> talks to Claude with two tools
//                             (ask_clarifying_questions | propose_edit),
//                             injecting the clicked file's contents as context.
//    POST /api/muse/write  -> writes the approved file to disk (sandboxed
//                             to src/), which triggers Vite HMR -> live reload.
//
//  Requires ANTHROPIC_API_KEY (env or a .env / .env.local file at repo root).
//  Model is configurable via MUSE_MODEL (defaults below).
// ============================================================
import path from 'node:path'
import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { type Plugin, loadEnv } from 'vite'
import Anthropic from '@anthropic-ai/sdk'

const DEFAULT_MODEL = 'claude-sonnet-4-5'

const SYSTEM_PROMPT = `You are Muse — an AI design partner embedded in a live web app. A NON-TECHNICAL user (a founder, PM, or marketer — not an engineer) points at an element on their real running app and tells you, in plain language, how they want it to look or feel. You handle all the craft.

You are given the FULL source of the React + TypeScript file the clicked element lives in, plus a description of the element. The app is styled with Tailwind CSS utility classes written inline in className.

You have exactly two tools and must always use one of them:

1. ask_clarifying_questions — Use this FIRST when the request is open-ended or a real design decision is needed ("make it pop", "feel more premium"). Ask at most 1–2 short questions, each with 2–3 concrete, visual options written for a non-technical person (no jargon). This is the heart of the partner experience: make the user feel guided, not interrogated. Skip it when the request is already specific ("make this button blue").

2. propose_edit — Return the COMPLETE updated contents of the file with your change applied. Change ONLY what is needed; keep all other code byte-for-byte identical. Style with Tailwind utility classes inline in className only — never add CSS files, style objects, or class variables. Apply real design taste: good spacing, hierarchy, type, and color. Include a short plain-English rationale a non-technical user would understand.

Be decisive and tasteful. Prefer one well-judged question over many.`

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

const MAX_WRITE_BYTES = 200_000 // sanity cap on model-proposed file content

// Resolve a client-supplied path and confirm it truly lives inside <root>/src.
// Uses realpath + path.relative rather than a string startsWith, which guards
// against: prefix collisions (e.g. `src-evil/`), `..` traversal, symlink escapes,
// and Windows case-insensitivity. Returns the canonical absolute path, or null.
function resolveInSrc(root: string, fileName: unknown): string | null {
  if (typeof fileName !== 'string' || fileName.length === 0) return null
  const abs = path.resolve(fileName)
  if (!fs.existsSync(abs)) return null
  const srcDir = fs.realpathSync(path.resolve(root, 'src'))
  const real = fs.realpathSync(abs)
  const rel = path.relative(srcDir, real)
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null
  return real
}

export function musePlugin(): Plugin {
  let root = process.cwd()
  let apiKey = ''
  let model = DEFAULT_MODEL

  return {
    name: 'muse-backend',
    apply: 'serve', // dev server only
    configResolved(config) {
      root = config.root
      const env = loadEnv(config.mode, root, '')
      apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''
      model = env.MUSE_MODEL || process.env.MUSE_MODEL || DEFAULT_MODEL
    },
    configureServer(server) {
      // --- POST /api/muse/chat -------------------------------------------
      server.middlewares.use('/api/muse/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          if (!apiKey) {
            return sendJson(res, 500, {
              error:
                'ANTHROPIC_API_KEY is not set. Add it to a .env.local file at the repo root (ANTHROPIC_API_KEY=sk-ant-...) and restart `npm run dev`.',
            })
          }

          const { fileName, element, messages } = JSON.parse(await readBody(req))
          const abs = resolveInSrc(root, fileName)
          if (!abs) {
            return sendJson(res, 400, {
              error: `Refusing to read "${fileName}" — must be an existing file under src/.`,
            })
          }

          const fileContents = fs.readFileSync(abs, 'utf8')
          const rel = path.relative(root, abs).replace(/\\/g, '/')

          const context =
            `You are editing this file: ${rel}\n\n` +
            '```tsx\n' +
            fileContents +
            '\n```\n\n' +
            `The user clicked a <${element?.tag ?? '?'}> element` +
            (element?.classNames ? ` with classes "${element.classNames}"` : '') +
            (element?.text ? ` containing the text "${element.text}"` : '') +
            (element?.line ? ` (around line ${element.line})` : '') +
            '.'

          // Inject the file/element context into the first (user) message.
          const outMessages = (messages as Anthropic.MessageParam[]).map((m, i) => {
            if (i === 0 && m.role === 'user' && typeof m.content === 'string') {
              return {
                role: 'user' as const,
                content: `${context}\n\n## The user's request\n${m.content}`,
              }
            }
            return m
          })

          const client = new Anthropic({ apiKey })
          const resp = await client.messages.create({
            model,
            max_tokens: 8192,
            system: [
              { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
            ],
            tools: [ASK_TOOL, PROPOSE_TOOL],
            tool_choice: { type: 'any' },
            messages: outMessages,
          })

          return sendJson(res, 200, {
            content: resp.content,
            stop_reason: resp.stop_reason,
            originalContent: fileContents, // so the client can render a diff
          })
        } catch (err) {
          console.error('[muse] /chat error:', err)
          return sendJson(res, 500, { error: (err as Error).message ?? String(err) })
        }
      })

      // --- POST /api/muse/write ------------------------------------------
      server.middlewares.use('/api/muse/write', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          const { fileName, newContent } = JSON.parse(await readBody(req))
          const abs = resolveInSrc(root, fileName)
          if (!abs) {
            return sendJson(res, 400, {
              error: `Refusing to write "${fileName}" — must be an existing file under src/.`,
            })
          }
          if (typeof newContent !== 'string' || newContent.length === 0) {
            return sendJson(res, 400, { error: 'newContent must be a non-empty string.' })
          }
          if (newContent.length > MAX_WRITE_BYTES) {
            return sendJson(res, 400, {
              error: `Refusing to write — proposed content exceeds ${MAX_WRITE_BYTES} bytes.`,
            })
          }
          fs.writeFileSync(abs, newContent, 'utf8') // -> Vite HMR reloads
          return sendJson(res, 200, { ok: true })
        } catch (err) {
          console.error('[muse] /write error:', err)
          return sendJson(res, 500, { error: (err as Error).message ?? String(err) })
        }
      })
    },
  }
}

// --- Tool schemas -----------------------------------------------------------
const ASK_TOOL: Anthropic.Tool = {
  name: 'ask_clarifying_questions',
  description:
    'Ask the user 1–2 short clarifying questions, each with 2–3 concrete visual options written for a non-technical person. Use when the request is open-ended or needs a design decision.',
  input_schema: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        description: '1 or 2 questions.',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'The question, in plain language.' },
            options: {
              type: 'array',
              description: '2 or 3 options.',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', description: 'Short choice label (1–4 words).' },
                  description: {
                    type: 'string',
                    description: 'One plain-English sentence on what this option means.',
                  },
                },
                required: ['label', 'description'],
              },
            },
          },
          required: ['question', 'options'],
        },
      },
    },
    required: ['questions'],
  },
}

const PROPOSE_TOOL: Anthropic.Tool = {
  name: 'propose_edit',
  description:
    'Propose the change by returning the FULL updated file contents. Change only what is needed; keep the rest identical.',
  input_schema: {
    type: 'object',
    properties: {
      newContent: { type: 'string', description: 'The complete updated contents of the file.' },
      rationale: {
        type: 'string',
        description: 'One or two plain-English sentences explaining the change for a non-technical user.',
      },
    },
    required: ['newContent', 'rationale'],
  },
}
