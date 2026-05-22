// Shared types for the Muse overlay <-> backend.

export type SelectedElement = {
  fileName: string // absolute path from React _debugSource
  line: number
  tag: string
  classNames: string
  text: string
}

// --- Tool I/O (mirrors the schemas in server/musePlugin.ts) ---
export type QuestionOption = { label: string; description: string }
export type ClarifyingQuestion = { question: string; options: QuestionOption[] }
export type AskInput = { questions: ClarifyingQuestion[] }
export type ProposeInput = { newContent: string; rationale: string }

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
  originalContent?: string
  error?: string
}

export type HistoryEntry = {
  fileName: string
  before: string
  after: string
  label: string
}

// Anthropic message shape we send back and forth.
export type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'user'; content: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> }
  | { role: 'assistant'; content: ContentBlock[] }
