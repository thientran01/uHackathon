// Shared types for the Muse overlay <-> backend.

export type SelectedElement = {
  fileName: string // absolute path from React _debugSource
  line: number
  tag: string
  classNames: string
  text: string
  key: string // stable id for dedupe / badges (fileName:line:col:tag)
  node?: Element // client-only: live DOM node for drawing outlines/badges (never sent to backend)
}

// --- Tool I/O (mirrors the schemas in server/musePlugin.ts) ---
export type QuestionOption = { label: string; description: string }
export type ClarifyingQuestion = { question: string; options: QuestionOption[] }
export type AskInput = { questions: ClarifyingQuestion[] }

export type FileEdit = { fileName: string; newContent: string }
export type ProposeInput = { edits: FileEdit[]; rationale: string }

// --- Anthropic content blocks (the subset we care about) ---
export type TextBlock = { type: 'text'; text: string }
export type ToolUseBlock = {
  type: 'tool_use'
  id: string
  name: 'ask_clarifying_questions' | 'propose_edit'
  input: unknown
}
export type ContentBlock = TextBlock | ToolUseBlock | { type: string; [k: string]: unknown }

export type ChatResponse = {
  content?: ContentBlock[]
  stop_reason?: string
  originals?: Record<string, string> // fileName -> original contents, for diffing
  error?: string
}

// One applied batch — covers every file changed in a single apply, so undo/redo
// restores the whole multi-file change as a unit.
export type HistoryEntry = {
  files: Array<{ fileName: string; before: string; after: string }>
  // Elements selected when the edit was applied — restored on undo/redo so the
  // panel reopens ready for follow-up edits.
  elements: SelectedElement[]
  label: string
}

// Anthropic message shape we send back and forth.
export type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'user'; content: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> }
  | { role: 'assistant'; content: ContentBlock[] }
