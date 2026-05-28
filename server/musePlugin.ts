// ============================================================
//  MUSE BACKEND  —  Vite plugin (Thien's piece)
// ------------------------------------------------------------
//  Adds two endpoints to the Vite dev server (same origin, no CORS,
//  one `npm run dev` process):
//
//    POST /api/muse/chat   -> Claude with two tools (ask_clarifying_questions |
//                             propose_edit). Accepts one OR many target elements
//                             (a batch), reads each element's source file, and
//                             returns edits across however many files change.
//    POST /api/muse/write  -> writes the approved files to disk (each sandboxed
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
const MAX_WRITE_BYTES = 200_000 // sanity cap per file on model-proposed content

const SYSTEM_PROMPT = `You are Muse — a design partner embedded in someone's live web app. A non-technical user (a founder, PM, or marketer) points at an element and tells you, in plain language, how they want it to feel. You handle the craft, and you have a point of view.

# Context you receive

The FULL source of every React + TypeScript file the selected elements live in, plus a list of which elements were selected and which file each lives in. The app is styled with Tailwind utility classes inline in className. When multiple elements are selected (a batch), apply the change consistently across all of them.

# Tools

You must use exactly one tool per turn.

- propose_edit — your DEFAULT. Return the COMPLETE updated contents of every file that changes (one entry per file, identified by the exact relative path shown in context). Change only what is needed for the selected elements; keep all other code byte-for-byte identical. Only include files that actually change. Style with Tailwind utility classes inline in className only — never add CSS files, style objects, or extracted class variables.

- ask_clarifying_questions — the EXCEPTION. Use ONLY when the answer would materially change what you'd ship. If a thoughtful designer would just pick a direction and run with it, do that instead and let the user redirect after seeing it. When you do ask, ask ONE question with 2–3 concrete visual options, written for a non-technical person.

# Voice

You're a designer collaborator, not an AI assistant. That means:

- **No preambles.** Never start with "Certainly!", "I'll help you with that", "Here's what I changed:". Start with the move or the observation.
- **Have a POV.** "Pushed the hierarchy — heavier title, tighter spacing, denser accent" beats "I've updated the styling." State the move, then the reason.
- **Notice what wasn't asked.** If you spotted something else worth fixing in the same area, mention it briefly: "Also tightened the gap to 16px — 32px felt heavy for this density."
- **Short and declarative.** A confident sentence beats a careful paragraph.
- **Occasional dry humor is fine; corporate enthusiasm is not.**

# Decisiveness rubric

Before calling ask_clarifying_questions, check: would a senior designer ship a confident first pass without asking this? If yes, use propose_edit and ship the first pass. If the user wants a different direction, they'll tell you and you'll iterate. Almost always: don't ask.

Examples of when NOT to ask (just propose):
- "make this pop" on a CTA → pick a confident treatment (stronger color, denser type, clearer shadow) and propose. Note in the rationale how to dial it back if too loud.
- "feel more premium" on a card → pick the move (more whitespace, refined type pairing, restrained color) and propose.
- "simplify this" → pick the simplification and propose.
- "match the rest of the app" on an element → look at the surrounding code, pick the consistent treatment, propose.

When TO ask:
- "redesign this hero" → scope is too big to ship blind. Ask one narrowing question with 2–3 concrete directions ("editorial-and-quiet", "punchy-and-loud", "playful-and-warm").
- The selected element is doing two unrelated jobs and the request is ambiguous about which one to address.

# Rationale rules (for propose_edit)

One or two short sentences for a non-technical user. Lead with the move, then the reason. Mention any opportunistic improvements you made along the way. Skip the diff narration — they can see the result.

You are a partner, not a tool. Make the call.`

// Used by /api/muse/observe in PR3 — a cheap, low-token call that fires when
// the user selects a new element, returning a one-line observation + 3
// starter chips for the opener of a fresh target context. Defined here so
// the voice rules live in one place; the endpoint lands next PR.
const OBSERVE_SYSTEM_PROMPT = `You are Muse — a design partner. The user just selected an element in their live app. Give them a quick read.

Use the observe tool to return:

- observation: ONE short sentence (max ~20 words) noting something specific and useful about the element's current visual state from its className list and surrounding code. Be specific — "the border-white/10 is reading as a flat plate, not a contained card" beats "this could be improved." Designer voice. No preamble. No "I notice...".
- chips: 3 starter prompts tailored to the element's tag and context, each 2–4 words, written as something the user would say to you ("Make it pop", "Tighten the spacing", "Try a different color"). Vary them — don't return three rephrasings of the same idea.

Ground observations in what's actually visible in the className list. Don't speculate about things you can't see.`

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

// Resolve a client-supplied path and confirm it truly lives inside <root>/src.
// Uses realpath + path.relative rather than a string startsWith, which guards
// against prefix collisions (`src-evil/`), `..` traversal, symlink escapes, and
// Windows case-insensitivity. Returns the canonical absolute path, or null.
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

const relOf = (root: string, abs: string) => path.relative(root, abs).replace(/\\/g, '/')

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

          const { targets, messages } = JSON.parse(await readBody(req))
          if (!Array.isArray(targets) || targets.length === 0) {
            return sendJson(res, 400, { error: 'No target elements provided.' })
          }

          // Resolve + read each unique source file. Skip anything outside src/.
          const files = new Map<string, string>() // rel -> contents
          const elementLines: string[] = []
          for (let i = 0; i < targets.length; i++) {
            const t = targets[i]
            const abs = resolveInSrc(root, t?.fileName)
            if (!abs) continue
            const rel = relOf(root, abs)
            if (!files.has(rel)) files.set(rel, fs.readFileSync(abs, 'utf8'))
            elementLines.push(
              `  ${i + 1}. <${t.tag ?? '?'}> in ${rel}` +
                (t.text ? ` — "${t.text}"` : '') +
                (t.classNames ? ` (classes: "${t.classNames}")` : ''),
            )
          }
          if (files.size === 0) {
            return sendJson(res, 400, {
              error: 'None of the selected elements map to an editable file under src/.',
            })
          }

          const filesBlock = [...files.entries()]
            .map(([rel, content]) => `// ${rel}\n\`\`\`tsx\n${content}\n\`\`\``)
            .join('\n\n')
          const context =
            `The user selected ${elementLines.length} element(s):\n${elementLines.join('\n')}\n\n` +
            `Relevant files:\n\n${filesBlock}`

          // Inject the context into the first (user) message.
          const outMessages = (messages as Anthropic.MessageParam[]).map((m, i) => {
            if (i === 0 && m.role === 'user' && typeof m.content === 'string') {
              return { role: 'user' as const, content: `${context}\n\n## The user's request\n${m.content}` }
            }
            return m
          })

          const client = new Anthropic({ apiKey })
          const resp = await client.messages.create({
            model,
            max_tokens: 8192,
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            tools: [ASK_TOOL, PROPOSE_TOOL],
            tool_choice: { type: 'any' },
            messages: outMessages,
          })

          return sendJson(res, 200, {
            content: resp.content,
            stop_reason: resp.stop_reason,
            originals: Object.fromEntries(files), // rel -> original content, for diffing
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
          const { files } = JSON.parse(await readBody(req))
          if (!Array.isArray(files) || files.length === 0) {
            return sendJson(res, 400, { error: 'No files to write.' })
          }

          // Validate everything BEFORE writing anything (all-or-nothing).
          const resolved: Array<{ abs: string; content: string }> = []
          for (const f of files) {
            const abs = resolveInSrc(root, f?.fileName)
            if (!abs) {
              return sendJson(res, 400, {
                error: `Refusing to write "${f?.fileName}" — must be an existing file under src/.`,
              })
            }
            if (typeof f.newContent !== 'string' || f.newContent.length === 0) {
              return sendJson(res, 400, { error: `Empty content for "${f.fileName}".` })
            }
            if (f.newContent.length > MAX_WRITE_BYTES) {
              return sendJson(res, 400, { error: `"${f.fileName}" exceeds ${MAX_WRITE_BYTES} bytes.` })
            }
            resolved.push({ abs, content: f.newContent })
          }
          for (const r of resolved) fs.writeFileSync(r.abs, r.content, 'utf8') // -> Vite HMR
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
    'Ask ONE short clarifying question with 2–3 concrete visual options. Use ONLY when the answer would materially change what you ship — if a thoughtful designer would just pick a direction and run with it, use propose_edit instead (that is the default). Almost always: don\'t ask.',
  input_schema: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        description: 'Exactly ONE question, in almost every case. Two only if genuinely needed.',
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
    'Propose the change as an array of file edits. Include one entry per file that needs to change, with its FULL updated contents. Change only what is needed; keep the rest identical.',
  input_schema: {
    type: 'object',
    properties: {
      edits: {
        type: 'array',
        description: 'One entry per changed file.',
        items: {
          type: 'object',
          properties: {
            fileName: {
              type: 'string',
              description: 'The exact relative path of the file (as shown in the context).',
            },
            newContent: { type: 'string', description: 'The complete updated contents of the file.' },
          },
          required: ['fileName', 'newContent'],
        },
      },
      rationale: {
        type: 'string',
        description:
          'One or two plain-English sentences explaining the change for a non-technical user, covering the whole batch.',
      },
    },
    required: ['edits', 'rationale'],
  },
}
