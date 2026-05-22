import { MOCK } from './config'
import { fxEdits, fxOriginals, fxQuestions, fxRationale } from './fixtures'
import type { ChatMessage, ChatResponse, FileEdit, SelectedElement } from './types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function museChat(
  targets: SelectedElement[],
  messages: ChatMessage[],
): Promise<ChatResponse> {
  if (MOCK) return mockChat(messages)

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

// --- Mock mode -------------------------------------------------------------
// First turn -> a clarifying question. After the user answers -> a multi-file
// proposed edit. Lets the whole batch UI be exercised with zero API cost.
async function mockChat(messages: ChatMessage[]): Promise<ChatResponse> {
  await delay(600)
  const answered = messages.some(
    (m) =>
      Array.isArray(m.content) &&
      m.content.some((c) => (c as { type?: string }).type === 'tool_result'),
  )
  if (!answered) {
    return {
      content: [
        { type: 'tool_use', id: 'mock-ask', name: 'ask_clarifying_questions', input: { questions: fxQuestions } },
      ],
      originals: fxOriginals,
    }
  }
  return {
    content: [
      { type: 'tool_use', id: 'mock-edit', name: 'propose_edit', input: { edits: fxEdits, rationale: fxRationale } },
    ],
    originals: fxOriginals,
  }
}
