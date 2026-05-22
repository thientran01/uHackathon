import type { ChatMessage, ChatResponse, SelectedElement } from './types'

export async function museChat(
  element: SelectedElement,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const res = await fetch('/api/muse/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      fileName: element.fileName,
      element: {
        tag: element.tag,
        classNames: element.classNames,
        text: element.text,
        line: element.line,
      },
      messages,
    }),
  })
  return (await res.json()) as ChatResponse
}

export async function museWrite(fileName: string, newContent: string): Promise<void> {
  const res = await fetch('/api/muse/write', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fileName, newContent }),
  })
  const data = (await res.json()) as { ok?: boolean; error?: string }
  if (!data.ok) throw new Error(data.error ?? 'Write failed')
}
