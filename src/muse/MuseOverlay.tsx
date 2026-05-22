import { useEffect, useState } from 'react'
import { museChat, museWrite } from './api'
import { collapseContext, diffLines } from './diff'
import { useSelection } from './useSelection'
import type {
  AskInput,
  ChatMessage,
  ClarifyingQuestion,
  ContentBlock,
  ProposeInput,
  ToolUseBlock,
} from './types'

type Pending =
  | { kind: 'ask'; toolUseId: string; questions: ClarifyingQuestion[] }
  | { kind: 'propose'; toolUseId: string; newContent: string; rationale: string }

export function MuseOverlay() {
  const { active, setActive, hoverRect, selected, setSelected, clearSelected } = useSelection()

  const [intent, setIntent] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState<Pending | null>(null)
  const [originalContent, setOriginalContent] = useState('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  // Reset the conversation whenever a new element is selected.
  useEffect(() => {
    setIntent('')
    setMessages([])
    setPending(null)
    setAnswers({})
    setError(null)
    setApplied(false)
  }, [selected])

  async function runChat(msgs: ChatMessage[]) {
    if (!selected) return
    setLoading(true)
    setError(null)
    setPending(null)
    setAnswers({})
    try {
      const resp = await museChat(selected, msgs)
      if (resp.error) {
        setError(resp.error)
        return
      }
      const blocks: ContentBlock[] = resp.content ?? []
      if (resp.originalContent) setOriginalContent(resp.originalContent)
      setMessages([...msgs, { role: 'assistant', content: blocks }])

      const tu = blocks.find((b) => b.type === 'tool_use') as ToolUseBlock | undefined
      if (!tu) {
        setError('Muse did not return an action. Try rephrasing.')
        return
      }
      if (tu.name === 'ask_clarifying_questions') {
        setPending({ kind: 'ask', toolUseId: tu.id, questions: (tu.input as AskInput).questions })
      } else {
        const input = tu.input as ProposeInput
        setPending({ kind: 'propose', toolUseId: tu.id, ...input })
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function start() {
    if (!intent.trim()) return
    runChat([{ role: 'user', content: intent.trim() }])
  }

  function submitAnswers() {
    if (!pending || pending.kind !== 'ask') return
    const text = pending.questions
      .map((q, i) => `${q.question} → ${answers[i] ?? '(no preference)'}`)
      .join('\n')
    const next: ChatMessage[] = [
      ...messages,
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: pending.toolUseId, content: text }] },
    ]
    runChat(next)
  }

  async function approve() {
    if (!pending || pending.kind !== 'propose' || !selected) return
    setLoading(true)
    setError(null)
    try {
      await museWrite(selected.fileName, pending.newContent)
      setApplied(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const allAnswered =
    pending?.kind === 'ask' && pending.questions.every((_, i) => answers[i] !== undefined)
  const unmappable = selected && !selected.fileName

  return (
    <div data-muse-ui className="fixed inset-0 z-[999999] pointer-events-none font-sans">
      {/* Hover highlight while in select mode */}
      {active && hoverRect && (
        <div
          className="absolute rounded ring-2 ring-violet-500 bg-violet-500/10 transition-all duration-75"
          style={{
            top: hoverRect.top,
            left: hoverRect.left,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        />
      )}

      {/* Select-mode banner */}
      {active && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          Click any element to design it · Esc to cancel
        </div>
      )}

      {/* Floating action button */}
      {!selected && (
        <button
          onClick={() => setActive((v) => !v)}
          className={`pointer-events-auto absolute bottom-6 right-6 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl transition ${
            active ? 'bg-slate-900 text-white' : 'bg-violet-600 text-white hover:bg-violet-500'
          }`}
        >
          <span className="text-base">✦</span>
          {active ? 'Cancel' : 'Design with Muse'}
        </button>
      )}

      {/* Conversation panel */}
      {selected && (
        <div className="pointer-events-auto absolute bottom-6 right-6 flex max-h-[80vh] w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="text-violet-600">✦</span> Muse
            </div>
            <button
              onClick={() => {
                clearSelected()
                setSelected(null)
              }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Selected element chip */}
          <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">
              &lt;{selected.tag}&gt;
            </span>{' '}
            {selected.fileName ? (
              <span className="font-mono">
                {selected.fileName.split(/[\\/]/).pop()}:{selected.line}
              </span>
            ) : (
              <span className="text-amber-600">source not found</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {unmappable && (
              <p className="text-sm text-amber-600">
                Couldn't map this element to a source file. Pick another element (works best on
                content inside <code>src/demo/</code>).
              </p>
            )}

            {/* Intent input (before first turn) */}
            {!unmappable && messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  What would you like to change about this?
                </p>
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) start()
                  }}
                  rows={3}
                  placeholder="e.g. make this feel more premium"
                  className="w-full resize-none rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-violet-400"
                />
                <button
                  onClick={start}
                  disabled={loading || !intent.trim()}
                  className="w-full rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
                >
                  {loading ? 'Thinking…' : 'Ask Muse'}
                </button>
              </div>
            )}

            {/* Clarifying questions */}
            {pending?.kind === 'ask' && (
              <div className="space-y-4">
                {pending.questions.map((q, qi) => (
                  <div key={qi} className="space-y-2">
                    <p className="text-sm font-medium text-slate-800">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const chosen = answers[qi] === opt.label
                        return (
                          <button
                            key={opt.label}
                            onClick={() => setAnswers((a) => ({ ...a, [qi]: opt.label }))}
                            className={`w-full rounded-lg border p-2.5 text-left transition ${
                              chosen
                                ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="text-sm font-medium text-slate-900">{opt.label}</div>
                            <div className="text-xs text-slate-500">{opt.description}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <button
                  onClick={submitAnswers}
                  disabled={loading || !allAnswered}
                  className="w-full rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
                >
                  {loading ? 'Designing…' : 'Continue'}
                </button>
              </div>
            )}

            {/* Proposed edit + diff */}
            {pending?.kind === 'propose' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">{pending.rationale}</p>

                <div className="overflow-x-auto rounded-lg bg-slate-900 p-2 font-mono text-[11px] leading-relaxed">
                  {collapseContext(diffLines(originalContent, pending.newContent)).map((l, i) => (
                    <div
                      key={i}
                      className={
                        l.type === 'add'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : l.type === 'del'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'text-slate-400'
                      }
                    >
                      <span className="select-none opacity-60">
                        {l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  '}
                      </span>
                      {l.text}
                    </div>
                  ))}
                </div>

                {applied ? (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    ✓ Applied — your app just updated, and the code change is real.
                  </div>
                ) : (
                  <button
                    onClick={approve}
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
                  >
                    {loading ? 'Applying…' : 'Approve & apply'}
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
