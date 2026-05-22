import { useEffect, useRef, useState } from 'react'
import { museChat, museWrite } from './api'
import { MOCK } from './config'
import { useSelection } from './useSelection'
import { ClarifyingQuestions } from './components/ClarifyingQuestions'
import { IntentForm } from './components/IntentForm'
import { MuseFab } from './components/MuseFab'
import { MusePanel } from './components/MusePanel'
import { ProposedEdit } from './components/ProposedEdit'
import { HoverHighlight, SelectBanner } from './components/SelectionOverlay'
import { ErrorNote, UnmappableNote } from './components/StatusNote'
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

const EXIT_MS = 170 // keep in sync with the muse-panel-out animation

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
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)

  // Reset the conversation whenever a new element is selected.
  useEffect(() => {
    setIntent('')
    setMessages([])
    setPending(null)
    setAnswers({})
    setError(null)
    setApplied(false)
  }, [selected])

  // Play the exit animation, then actually unmount the panel.
  function requestClose() {
    if (closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      clearSelected()
      setSelected(null)
      setClosing(false)
    }, EXIT_MS)
  }

  // Return to the intent step on the same element — a continuous partner loop.
  function refineAgain() {
    setMessages([])
    setPending(null)
    setAnswers({})
    setError(null)
    setApplied(false)
    setIntent('')
  }

  async function runChat(msgs: ChatMessage[]) {
    if (!selected) return
    setLoading(true)
    setError(null)
    // Keep the current step on screen while we wait, so the panel never flashes empty.
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
        setAnswers({})
        setPending({ kind: 'ask', toolUseId: tu.id, questions: (tu.input as AskInput).questions })
      } else {
        setPending({ kind: 'propose', toolUseId: tu.id, ...(tu.input as ProposeInput) })
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
    runChat([
      ...messages,
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: pending.toolUseId, content: text }] },
    ])
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
  const unmappable = !!selected && !selected.fileName
  const stepKey = unmappable
    ? 'unmappable'
    : messages.length === 0
      ? 'intent'
      : (pending?.kind ?? 'loading')

  // Keyboard (Esc to dismiss, Enter to confirm the current step) + click-outside.
  useEffect(() => {
    if (!selected || closing) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        requestClose()
        return
      }
      if (e.key === 'Enter') {
        const t = e.target as HTMLElement | null
        if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT')) return // let the textarea handle it
        if (pending?.kind === 'ask' && allAnswered && !loading) {
          e.preventDefault()
          submitAnswers()
        } else if (pending?.kind === 'propose' && !applied && !loading) {
          e.preventDefault()
          approve()
        }
      }
    }
    document.addEventListener('keydown', onKey, true)

    // Click-outside dismiss — but not while picking a new target (select mode).
    let onDocClick: ((e: MouseEvent) => void) | null = null
    if (!active) {
      onDocClick = (e: MouseEvent) => {
        const t = e.target as Element | null
        if (t && !t.closest('[data-muse-ui]')) requestClose()
      }
      document.addEventListener('click', onDocClick, true)
    }

    return () => {
      document.removeEventListener('keydown', onKey, true)
      if (onDocClick) document.removeEventListener('click', onDocClick, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, closing, active, pending, allAnswered, applied, loading])

  return (
    <div data-muse-ui className="pointer-events-none fixed inset-0 z-[999999] font-sans">
      {active && hoverRect && <HoverHighlight rect={hoverRect} />}

      {active && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <SelectBanner />
        </div>
      )}

      {!selected && (
        <div className="absolute bottom-6 right-6">
          <MuseFab active={active} onToggle={() => setActive((v) => !v)} />
        </div>
      )}

      {selected && (
        <div className="absolute bottom-6 right-6">
          <MusePanel
            element={selected}
            mock={MOCK}
            stepKey={stepKey}
            closing={closing}
            onClose={requestClose}
          >
            {unmappable ? (
              <UnmappableNote />
            ) : messages.length === 0 ? (
              <IntentForm value={intent} onChange={setIntent} onSubmit={start} loading={loading} />
            ) : pending?.kind === 'ask' ? (
              <ClarifyingQuestions
                questions={pending.questions}
                answers={answers}
                onSelect={(qi, label) => setAnswers((a) => ({ ...a, [qi]: label }))}
                onContinue={submitAnswers}
                loading={loading}
                allAnswered={allAnswered}
              />
            ) : pending?.kind === 'propose' ? (
              <ProposedEdit
                rationale={pending.rationale}
                original={originalContent}
                newContent={pending.newContent}
                applied={applied}
                loading={loading}
                onApprove={approve}
                onRefine={refineAgain}
              />
            ) : null}

            {error && <ErrorNote message={error} />}
          </MusePanel>
        </div>
      )}
    </div>
  )
}
