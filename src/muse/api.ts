import { MOCK } from './config'
import { fxEdits, fxOriginals } from './fixtures'
import type { ChatMessage, ChatResponse, ClarifyingQuestion, FileEdit, SelectedElement } from './types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function museChat(
  targets: SelectedElement[],
  messages: ChatMessage[],
): Promise<ChatResponse> {
  if (MOCK) return mockChat(targets, messages)

  const res = await fetch('/api/muse/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      targets: targets.map((t) => ({
        fileName: t.fileName,
        tag: t.tag,
        classNames: t.classNames,
        text: t.text,
        line: t.line,
      })),
      messages,
    }),
  })
  return (await res.json()) as ChatResponse
}

export async function museWrite(files: FileEdit[]): Promise<void> {
  if (MOCK) {
    await delay(300) // pretend to write; no real disk change in mock mode
    return
  }

  const res = await fetch('/api/muse/write', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ files }),
  })
  const data = (await res.json()) as { ok?: boolean; error?: string }
  if (!data.ok) throw new Error(data.error ?? 'Write failed')
}

// =============================================================================
// Mock mode — credit-free dev iteration on the thread shell.
//
// What it does, in order:
//   1. Variable latency (400 / 800 / 1200ms) so the thinking bubble actually
//      lingers and the UI doesn't snap.
//   2. Classifies the latest user message into one of ~7 intent categories.
//   3. For most intents, proposes a confident edit (matching PR0's "almost
//      always: don't ask" rule). The diff is synthesized from the SELECTED
//      element's actual classNames + tag, so it looks like Muse really edited
//      your element.
//   4. Only for vague big asks ("redesign this hero", first turn only) does it
//      fire ask_clarifying_questions.
//   5. Each intent has 2–3 canned variations (different class mutations +
//      rationales), picked at random — so repeated tries don't loop.
//   6. After an apply, follow-up messages keep proposing variations instead of
//      bouncing back to ask.
//
// If a target has no fileName (unmappable), falls back to the original
// fxOriginals/fxEdits fixtures so the gallery and unmappable cases still work.
// =============================================================================

const MOCK_LATENCIES = [400, 800, 1200] as const
const pickOne = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomDelay = () => delay(pickOne(MOCK_LATENCIES))

type Intent =
  | 'pop'         // make it stronger, louder, stand out
  | 'premium'     // refined, elegant, luxurious
  | 'simplify'    // remove, reduce, clean up
  | 'soften'      // calmer, quieter, more subtle
  | 'tighter'     // denser, more compact
  | 'spacious'    // more breathing room, airier
  | 'redesign-big'// vague large-scope ask — the rare "ask" case
  | 'generic'     // fall-through

function classifyIntent(text: string): Intent {
  const t = text.toLowerCase()
  if (/\b(redesign|overhaul|rebuild|start over|from scratch)\b/.test(t)) return 'redesign-big'
  if (/\b(pop|punch|punchier|bold|confident|stronger|louder|stand out|wow)\b/.test(t)) return 'pop'
  if (/\b(premium|luxury|luxurious|refined|elegant|sophisticat|high.?end|editorial|apple|stripe)\b/.test(t)) return 'premium'
  if (/\b(simpl|clean|less|reduce|strip|remove)\b/.test(t)) return 'simplify'
  if (/\b(tight|denser|compact|condens|smaller)\b/.test(t)) return 'tighter'
  if (/\b(spaci|breathing|airy|airier|loose|roomy|bigger)\b/.test(t)) return 'spacious'
  if (/\b(soft|calmer|calm|quiet|subtle|muted|tone.?down)\b/.test(t)) return 'soften'
  if (/\bminimal\b/.test(t)) return 'simplify'
  return 'generic'
}

/** A mock preset — a deterministic className transform + a rationale to match. */
type Preset = {
  mutate: (cls: string, tag: string) => string
  rationale: string
}

// Tiny mutation helpers ---------------------------------------------------
const dropClass = (cls: string, re: RegExp) => cls.replace(re, '').replace(/\s+/g, ' ').trim()
const addClass = (cls: string, add: string) =>
  cls.split(/\s+/).filter(Boolean).concat(add.split(/\s+/).filter(Boolean)).join(' ')
const swapClass = (cls: string, re: RegExp, to: string) =>
  re.test(cls) ? cls.replace(re, to) : ensure(cls, to)
const ensure = (cls: string, token: string) =>
  cls.split(/\s+/).includes(token) ? cls : addClass(cls, token)

// Per-intent preset libraries --------------------------------------------
const POP: Preset[] = [
  {
    rationale: 'Pushed the type weight and tracking — denser shape, stronger anchor. Dial it back if it shouts.',
    mutate: (cls, tag) => {
      let c = cls
      c = swapClass(c, /\bfont-(thin|extralight|light|normal|medium)\b/, 'font-bold')
      c = ensure(c, 'font-bold')
      c = swapClass(c, /\btracking-(wide|wider|widest|normal)\b/, 'tracking-tight')
      c = ensure(c, 'tracking-tight')
      if (tag === 'h1') c = swapClass(c, /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b/, 'text-6xl')
      return c
    },
  },
  {
    rationale: 'Bigger, with a clearer ring around it — pulls the eye without changing the color story.',
    mutate: (cls) => {
      let c = ensure(cls, 'ring-2')
      c = ensure(c, 'ring-slate-900')
      c = ensure(c, 'shadow-md')
      return c
    },
  },
  {
    rationale: 'Filled accent with a denser type pairing — a touch more presence at the same scale.',
    mutate: (cls) => {
      let c = swapClass(cls, /\bbg-(white|slate|zinc|gray|stone)-(50|100|200)\b/, 'bg-slate-900')
      c = ensure(c, 'text-white')
      c = ensure(c, 'font-semibold')
      return c
    },
  },
]

const PREMIUM: Preset[] = [
  {
    rationale: 'Lighter weight, larger scale, tighter tracking — the Apple / Stripe register.',
    mutate: (cls, tag) => {
      let c = swapClass(cls, /\bfont-(bold|semibold|extrabold|black)\b/, 'font-light')
      c = ensure(c, 'tracking-tight')
      if (tag === 'h1' || tag === 'h2') c = swapClass(c, /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b/, 'text-6xl')
      c = ensure(c, 'leading-tight')
      return c
    },
  },
  {
    rationale: 'More padding, softer corners, restrained color — the kind of button you only see on really good marketing sites.',
    mutate: (cls) => {
      let c = swapClass(cls, /\brounded-(none|sm|md|lg|xl|2xl)\b/, 'rounded-full')
      c = swapClass(c, /\bpx-\d+(\.\d+)?\b/, 'px-8')
      c = swapClass(c, /\bpy-\d+(\.\d+)?\b/, 'py-3.5')
      c = ensure(c, 'tracking-tight')
      return c
    },
  },
]

const SIMPLIFY: Preset[] = [
  {
    rationale: 'Stripped the ornament — borders, shadows, ring all gone. Only the essential shape remains.',
    mutate: (cls) => {
      let c = dropClass(cls, /\bshadow(-\w+)?(\/\d+)?\b/g)
      c = dropClass(c, /\bring(-\d+)?(-\w+)?(-\d+)?(\/\d+)?\b/g)
      c = dropClass(c, /\bborder(-\d+)?(-\w+)?(-\d+)?(\/\d+)?\b/g)
      return c
    },
  },
  {
    rationale: 'Pulled the size and weight down — same intent, less voice.',
    mutate: (cls, tag) => {
      let c = swapClass(cls, /\bfont-(bold|extrabold|black)\b/, 'font-medium')
      if (tag === 'h1') c = swapClass(c, /\btext-(4xl|5xl|6xl|7xl|8xl)\b/, 'text-3xl')
      c = dropClass(c, /\btracking-(wide|widest|wider)\b/)
      return c
    },
  },
]

const SOFTEN: Preset[] = [
  {
    rationale: 'Dropped the contrast — same shape, quieter voice. Reads as supporting, not headline.',
    mutate: (cls) => {
      let c = swapClass(cls, /\btext-(slate|zinc|gray|stone)-(900|800|700)\b/, 'text-slate-500')
      c = swapClass(c, /\btext-black\b/, 'text-slate-500')
      c = swapClass(c, /\bfont-(bold|semibold)\b/, 'font-normal')
      return c
    },
  },
]

const TIGHTER: Preset[] = [
  {
    rationale: 'Compacted the padding + tracking. Same hierarchy, denser footprint.',
    mutate: (cls) => {
      let c = swapClass(cls, /\bpx-\d+(\.\d+)?\b/, 'px-3')
      c = swapClass(c, /\bpy-\d+(\.\d+)?\b/, 'py-1.5')
      c = swapClass(c, /\btracking-(wide|wider|widest|normal)\b/, 'tracking-tight')
      c = ensure(c, 'tracking-tight')
      return c
    },
  },
]

const SPACIOUS: Preset[] = [
  {
    rationale: 'Opened up the spacing — more breathing room around the type. Reads as more confident, less crammed.',
    mutate: (cls) => {
      let c = swapClass(cls, /\bpx-\d+(\.\d+)?\b/, 'px-8')
      c = swapClass(c, /\bpy-\d+(\.\d+)?\b/, 'py-5')
      c = ensure(c, 'leading-relaxed')
      return c
    },
  },
]

const GENERIC: Preset[] = [
  {
    rationale: 'Refined the proportions a touch — slightly tighter tracking, more honest weight. Subtle.',
    mutate: (cls) => {
      let c = ensure(cls, 'tracking-tight')
      c = swapClass(c, /\bfont-bold\b/, 'font-semibold')
      return c
    },
  },
  {
    rationale: 'Tightened the padding ratio and unified the rounding. Minor adjustment — should read more considered.',
    mutate: (cls) => {
      let c = swapClass(cls, /\brounded-(sm|md)\b/, 'rounded-lg')
      c = swapClass(c, /\bpy-\d+\b/, 'py-3')
      return c
    },
  },
]

const INTENT_PRESETS: Record<Exclude<Intent, 'redesign-big'>, Preset[]> = {
  pop: POP,
  premium: PREMIUM,
  simplify: SIMPLIFY,
  soften: SOFTEN,
  tighter: TIGHTER,
  spacious: SPACIOUS,
  generic: GENERIC,
}

// Clarifying questions for the rare ASK path -----------------------------
const REDESIGN_QUESTION: ClarifyingQuestion = {
  question: "Big scope. Which direction should it take?",
  options: [
    {
      label: 'Editorial & quiet',
      description: 'Lots of breathing room, restrained color, serif feel. The Stripe / Linear register.',
    },
    {
      label: 'Punchy & loud',
      description: 'High contrast, dense type, confident accents. Vercel / Cursor energy.',
    },
    {
      label: 'Playful & warm',
      description: 'Rounded shapes, warmer palette, looser proportions. Notion / Linear-y.',
    },
  ],
}

// Snippet synthesis ------------------------------------------------------
// Build a minimal "before" snippet around the user's actual selected element
// so the diff reads as though Muse edited THEIR element, not a fixture.
function snippetFor(target: SelectedElement, classNames: string): string {
  const text = (target.text || '...').slice(0, 60)
  const indent = '      '
  return `${indent}<${target.tag} className="${classNames}">\n${indent}  ${text}\n${indent}</${target.tag}>`
}

// Pick a file key the way the runChat allowlist will accept — must match the
// originals key exactly (server sends relative forward-slashed paths).
function fileKeyFor(target: SelectedElement): string | null {
  if (!target.fileName) return null
  return target.fileName.replace(/\\/g, '/').replace(/^\.\//, '')
}

function mockPropose(targets: SelectedElement[], preset: Preset): ChatResponse {
  const usable = targets.filter((t) => fileKeyFor(t))
  if (usable.length === 0) {
    // Fall back to the canned fixtures (gallery / unmappable scenarios).
    return {
      content: [
        {
          type: 'tool_use',
          id: 'mock-edit-' + Math.random().toString(36).slice(2, 8),
          name: 'propose_edit',
          input: { edits: fxEdits, rationale: preset.rationale },
        },
      ],
      originals: fxOriginals,
    }
  }

  const originals: Record<string, string> = {}
  const edits: FileEdit[] = []
  // Group by file so we only emit one edit per file even on a batch.
  const byFile = new Map<string, SelectedElement>()
  for (const t of usable) {
    const key = fileKeyFor(t)!
    if (!byFile.has(key)) byFile.set(key, t)
  }

  for (const [key, t] of byFile) {
    const before = snippetFor(t, t.classNames || '')
    const newClass = preset.mutate(t.classNames || '', t.tag)
    const after = snippetFor(t, newClass)
    originals[key] = before
    edits.push({ fileName: key, newContent: after })
  }

  return {
    content: [
      {
        type: 'tool_use',
        id: 'mock-edit-' + Math.random().toString(36).slice(2, 8),
        name: 'propose_edit',
        input: { edits, rationale: preset.rationale },
      },
    ],
    originals,
  }
}

function mockAsk(): ChatResponse {
  return {
    content: [
      {
        type: 'tool_use',
        id: 'mock-ask-' + Math.random().toString(36).slice(2, 8),
        name: 'ask_clarifying_questions',
        input: { questions: [REDESIGN_QUESTION] },
      },
    ],
    // For the ask path we don't have an edit yet, but runChat expects an
    // originals map — use the canned fixtures as a placeholder. The follow-up
    // propose call (after answering) will replace them.
    originals: fxOriginals,
  }
}

// Pull out the most recent user-authored text for intent classification.
// Handles both plain-string messages and tool_result wrappers.
function latestUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    if (typeof m.content === 'string') return m.content
    if (Array.isArray(m.content)) {
      for (const c of m.content) {
        const block = c as { type?: string; content?: unknown }
        if (block.type === 'tool_result' && typeof block.content === 'string') {
          return block.content
        }
      }
    }
  }
  return ''
}

// Has any prior assistant turn already proposed an edit? If yes, follow-ups
// keep proposing — don't bounce back to clarifying questions.
function alreadyProposedOnce(messages: ChatMessage[]): boolean {
  for (const m of messages) {
    if (m.role !== 'assistant') continue
    if (Array.isArray(m.content)) {
      for (const c of m.content) {
        const block = c as { type?: string; name?: string }
        if (block.type === 'tool_use' && block.name === 'propose_edit') return true
      }
    }
  }
  return false
}

async function mockChat(targets: SelectedElement[], messages: ChatMessage[]): Promise<ChatResponse> {
  await randomDelay()

  const text = latestUserText(messages)
  const intent = classifyIntent(text)

  // The one "ask" case: a vague big-scope ask on the very first turn. Once
  // we've already proposed at least once, even a vague follow-up should keep
  // proposing variations rather than asking again — matches PR0 voice rules.
  if (intent === 'redesign-big' && !alreadyProposedOnce(messages)) {
    return mockAsk()
  }

  // Pick a preset for the intent (or fall through to generic).
  const intentForPresets: Exclude<Intent, 'redesign-big'> =
    intent === 'redesign-big' ? 'generic' : intent
  const presets = INTENT_PRESETS[intentForPresets]
  const preset = pickOne(presets)
  return mockPropose(targets, preset)
}

