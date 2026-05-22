import { useEffect, useRef, useState } from 'react'
import { museChat, museWrite } from './api'
import { MOCK } from './config'
import { useSelection } from './useSelection'
import { ClarifyingQuestions } from './components/ClarifyingQuestions'
import { IntentForm } from './components/IntentForm'
import { MuseFab } from './components/MuseFab'
import { MusePanel } from './components/MusePanel'
import { ProposedEdit } from './components/ProposedEdit'
import { RevertConfirmDialog } from './components/RevertConfirmDialog'
import { UndoRedoBar } from './components/UndoRedoBar'
import { HoverHighlight, SelectBanner } from './components/SelectionOverlay'
import { ErrorNote, UnmappableNote } from './components/StatusNote'
import type {
  AskInput,
  ChatMessage,
  ClarifyingQuestion,
  ContentBlock,
  HistoryEntry,
  ProposeInput,
  ToolUseBlock,
} from './types'

type Pending =
  | { kind: 'ask'; toolUseId: string; questions: ClarifyingQuestion[] }
  | { kind: 'propose'; toolUseId: string; newContent: string; rationale: string }

const EXIT_MS = 170 // keep in sync with the muse-panel-out animation

export type HistoryControls = {
  canUndo: boolean
  canRedo: boolean
  loading: boolean
  onUndo: () => void
  onRedo: () => void
  onRevert: () => void
}

export function MuseOverlay() {
  const { active, setActive, hoverRect, hoverInfo, cursor, selected, setSelected, clearSelected } =
    useSelection()

  // Conversation state — reset on each new element selection.
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

  // History state — persists across element selections.
  const [past, setPast] = useState<HistoryEntry[]>([])
  const [future, setFuture] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showRevertConfirm, setShowRevertConfirm] = useState(false)

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
      const entry: HistoryEntry = {
        fileName: selected.fileName,
        before: originalContent,
        after: pending.newContent,
        label: pending.rationale.slice(0, 80),
      }
      setPast((p) => [...p, entry])
      setFuture([])
      setApplied(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function undo() {
    if (past.length === 0) return
    const entry = past[past.length - 1]
    setHistoryLoading(true)
    setError(null)
    try {
      await museWrite(entry.fileName, entry.before)
      setPast((p) => p.slice(0, -1))
      setFuture((f) => [entry, ...f])
      setApplied(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setHistoryLoading(false)
    }
  }

  async function redo() {
    if (future.length === 0) return
    const entry = future[0]
    setHistoryLoading(true)
    setError(null)
    try {
      await museWrite(entry.fileName, entry.after)
      setFuture((f) => f.slice(1))
      setPast((p) => [...p, entry])
      setApplied(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setHistoryLoading(false)
    }
  }

  async function revertToOriginal() {
    if (past.length === 0) return
    setHistoryLoading(true)
    setError(null)
    try {
      // Find the earliest (pre-Muse) content for each file touched this session.
      const originals = new Map<string, string>()
      for (const entry of past) {
        if (!originals.has(entry.fileName)) originals.set(entry.fileName, entry.before)
      }
      for (const [fileName, content] of originals) {
        await museWrite(fileName, content)
      }
      setPast([])
      setFuture([])
      setApplied(false)
      setShowRevertConfirm(false)
    } catch (e) {
      setError((e as Error).message)
      setShowRevertConfirm(false)
    } finally {
      setHistoryLoading(false)
    }
  }

  const historyControls: HistoryControls = {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    loading: historyLoading,
    onUndo: undo,
    onRedo: redo,
    onRevert: () => setShowRevertConfirm(true),
  }

  const allAnswered =
    pending?.kind === 'ask' &&
    pending.questions.every((_, i) => (answers[i] ?? '').trim() !== '')
  const unmappable = !!selected && !selected.fileName
  const stepKey = unmappable
    ? 'unmappable'
    : messages.length === 0
      ? 'intent'
      : (pending?.kind ?? 'loading')

  const hasHistory = past.length > 0 || future.length > 0

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
      {active && hoverRect && <HoverHighlight rect={hoverRect} cursor={cursor} info={hoverInfo} />}

      {active && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <SelectBanner />
        </div>
      )}

      {!selected && (
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
          {hasHistory && (
            <UndoRedoBar
              canUndo={historyControls.canUndo}
              canRedo={historyControls.canRedo}
              loading={historyControls.loading}
              onUndo={historyControls.onUndo}
              onRedo={historyControls.onRedo}
              onRevert={historyControls.onRevert}
            />
          )}
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
            historyControls={hasHistory ? historyControls : undefined}
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
                historyControls={applied ? historyControls : undefined}
              />
            ) : null}

            {error && <ErrorNote message={error} />}
          </MusePanel>
        </div>
      )}

      {showRevertConfirm && (
        <RevertConfirmDialog
          onConfirm={revertToOriginal}
          onCancel={() => setShowRevertConfirm(false)}
          loading={historyLoading}
        />
      )}
    </div>
  )
}
