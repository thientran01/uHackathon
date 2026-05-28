import { useEffect, useRef, useState } from 'react'
import './muse.css'
import { museChat, museWrite } from './api'
import { MOCK } from './config'
import { useSelection } from './useSelection'
import { useHostTheme } from './hooks/useHostTheme'
import { museStore, useMuseStore } from './store'
import { ClarifyingQuestions } from './components/ClarifyingQuestions'
import { IntentForm } from './components/IntentForm'
import { MuseFab } from './components/MuseFab'
import { MusePanel } from './components/MusePanel'
import { ProposedEdit } from './components/ProposedEdit'
import { RevertConfirmDialog } from './components/RevertConfirmDialog'
import { UndoRedoBar } from './components/UndoRedoBar'
import {
  HoverHighlight,
  SelectBanner,
  SelectionMarkers,
  SelectionTray,
} from './components/SelectionOverlay'
import { ErrorNote, UnmappableNote } from './components/StatusNote'
import type {
  AskInput,
  ChatMessage,
  ContentBlock,
  HistoryEntry,
  ProposeInput,
  ToolUseBlock,
} from './types'

const EXIT_MS = 170 // keep in sync with the muse-panel-out animation

// Normalize a file path the way the server keys `originals` (forward slashes, no ./).
const normPath = (p: string) => p.replace(/\\/g, '/').replace(/^\.\//, '')

export type HistoryControls = {
  canUndo: boolean
  canRedo: boolean
  loading: boolean
  onUndo: () => void
  onRedo: () => void
  onRevert: () => void
}

export function MuseOverlay() {
  const { active, setActive, hoverRect, hoverInfo, cursor, selection, setSelection, clearSelection } =
    useSelection()

  // Domain state lives in museStore; component-lifecycle state stays local.
  const {
    intent,
    messages,
    pending,
    originals,
    answers,
    loading,
    error,
    applied,
    past,
    future,
    historyLoading,
    showRevertConfirm,
  } = useMuseStore()

  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const prevKeysRef = useRef<string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  useHostTheme(rootRef)

  // Reset the conversation when the SET of selected elements changes. Keep the
  // typed intent when the user is only *removing* an element from the batch, so
  // editing the selection mid-flow doesn't force a retype.
  const selectionKey = selection.map((s) => s.key).sort().join('|')
  useEffect(() => {
    const keys = selection.map((s) => s.key)
    const prev = prevKeysRef.current
    const shrunk = keys.length < prev.length && keys.every((k) => prev.includes(k))
    prevKeysRef.current = keys
    museStore.resetConversation(shrunk)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey])

  function requestClose() {
    if (closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      clearSelection()
      setClosing(false)
    }, EXIT_MS)
  }

  function refineAgain() {
    museStore.resetConversation()
  }

  function removeChip(key: string) {
    if (selection.length <= 1) {
      requestClose()
      return
    }
    setSelection((prev) => prev.filter((p) => p.key !== key))
  }

  async function runChat(msgs: ChatMessage[]) {
    if (selection.length === 0) return
    museStore.setState({ loading: true, error: null })
    try {
      const resp = await museChat(selection, msgs)
      if (resp.error) {
        museStore.setState({ error: resp.error })
        return
      }
      const blocks: ContentBlock[] = resp.content ?? []
      if (resp.originals) museStore.setState({ originals: resp.originals })
      museStore.setState({ messages: [...msgs, { role: 'assistant', content: blocks }] })

      const tu = blocks.find((b) => b.type === 'tool_use') as ToolUseBlock | undefined
      if (!tu) {
        museStore.setState({ error: 'Muse did not return an action. Try rephrasing.' })
        return
      }
      if (tu.name === 'ask_clarifying_questions') {
        museStore.setState({
          answers: {},
          pending: { kind: 'ask', toolUseId: tu.id, questions: (tu.input as AskInput).questions },
        })
      } else {
        const input = tu.input as ProposeInput
        // Bound writes to the files Muse actually read this turn (the selected
        // elements' files) — never an arbitrary in-src file the model returns.
        const allowed = new Set(Object.keys(resp.originals ?? {}))
        const edits = (Array.isArray(input.edits) ? input.edits : [])
          .map((e) => ({ fileName: normPath(e.fileName ?? ''), newContent: e.newContent }))
          .filter((e) => typeof e.newContent === 'string' && allowed.has(e.fileName))
        if (edits.length === 0) {
          museStore.setState({ error: "Muse didn't return changes for the selected element(s). Try rephrasing." })
          return
        }
        museStore.setState({
          pending: { kind: 'propose', toolUseId: tu.id, edits, rationale: input.rationale ?? '' },
        })
      }
    } catch (e) {
      museStore.setState({ error: (e as Error).message })
    } finally {
      museStore.setState({ loading: false })
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
    if (!pending || pending.kind !== 'propose') return
    museStore.setState({ loading: true, error: null })
    try {
      await museWrite(pending.edits)
      // Record the whole batch as one history entry (before/after per file).
      // Strip live DOM node refs — they'll be stale after HMR reloads the component.
      const entry: HistoryEntry = {
        files: pending.edits.map((e) => ({
          fileName: e.fileName,
          before: originals[e.fileName] ?? '',
          after: e.newContent,
        })),
        elements: selection,
        label: pending.rationale.slice(0, 80),
      }
      museStore.setState((s) => ({ past: [...s.past, entry], future: [], applied: true }))
    } catch (e) {
      museStore.setState({ error: (e as Error).message })
    } finally {
      museStore.setState({ loading: false })
    }
  }

  async function undo() {
    if (past.length === 0) return
    const entry = past[past.length - 1]
    museStore.setState({ historyLoading: true, error: null })
    try {
      await museWrite(entry.files.map((f) => ({ fileName: f.fileName, newContent: f.before })))
      museStore.setState((s) => ({
        past: s.past.slice(0, -1),
        future: [entry, ...s.future],
        applied: false,
      }))
      setSelection(entry.elements)
    } catch (e) {
      museStore.setState({ error: (e as Error).message })
    } finally {
      museStore.setState({ historyLoading: false })
    }
  }

  async function redo() {
    if (future.length === 0) return
    const entry = future[0]
    museStore.setState({ historyLoading: true, error: null })
    try {
      await museWrite(entry.files.map((f) => ({ fileName: f.fileName, newContent: f.after })))
      museStore.setState((s) => ({
        future: s.future.slice(1),
        past: [...s.past, entry],
        applied: true,
      }))
      setSelection(entry.elements)
    } catch (e) {
      museStore.setState({ error: (e as Error).message })
    } finally {
      museStore.setState({ historyLoading: false })
    }
  }

  async function revertToOriginal() {
    if (past.length === 0) return
    museStore.setState({ historyLoading: true, error: null })
    try {
      // Earliest (pre-Muse) content for every file touched this session.
      const earliest = new Map<string, string>()
      for (const entry of past) {
        for (const f of entry.files) if (!earliest.has(f.fileName)) earliest.set(f.fileName, f.before)
      }
      await museWrite([...earliest].map(([fileName, before]) => ({ fileName, newContent: before })))
      museStore.setState({ past: [], future: [], applied: false, showRevertConfirm: false })
    } catch (e) {
      museStore.setState({ error: (e as Error).message, showRevertConfirm: false })
    } finally {
      museStore.setState({ historyLoading: false })
    }
  }

  const historyControls: HistoryControls = {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    loading: historyLoading,
    onUndo: undo,
    onRedo: redo,
    onRevert: () => museStore.setState({ showRevertConfirm: true }),
  }
  const hasHistory = past.length > 0 || future.length > 0

  const single = selection.length === 1 ? selection[0] : null
  const unmappable = !MOCK && !!single && !single.fileName
  const allAnswered =
    pending?.kind === 'ask' &&
    pending.questions.every((_, i) => (answers[i] ?? '').trim() !== '')
  const panelOpen = selection.length >= 1 && !active
  const showMarkers = selection.length >= 1
  const stepKey = unmappable
    ? 'unmappable'
    : messages.length === 0
      ? 'intent'
      : (pending?.kind ?? 'loading')

  // Keyboard for both phases + click-outside while the panel is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active) {
        if (e.key === 'Enter' && selection.length >= 1) {
          e.preventDefault()
          setActive(false) // commit the batch
        }
        return // Esc is handled in useSelection during select mode
      }
      if (selection.length === 0 || closing) return
      if (e.key === 'Escape') {
        e.preventDefault()
        requestClose()
        return
      }
      if (e.key === 'Enter') {
        const t = e.target as HTMLElement | null
        if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT')) return
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

    let onDocClick: ((e: MouseEvent) => void) | null = null
    if (!active && selection.length >= 1 && !closing) {
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
  }, [active, selection, closing, pending, allAnswered, applied, loading])

  return (
    <div ref={rootRef} data-muse-ui className="pointer-events-none fixed inset-0 z-[999999] font-sans">
      {active && hoverRect && <HoverHighlight rect={hoverRect} cursor={cursor} info={hoverInfo} />}
      {showMarkers && <SelectionMarkers elements={selection} />}

      {active && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <SelectBanner />
        </div>
      )}

      {selection.length === 0 && (
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
          <MuseFab active={active} loading={loading} onToggle={() => setActive((v) => !v)} />
        </div>
      )}

      {active && selection.length >= 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <SelectionTray count={selection.length} onDesign={() => setActive(false)} />
        </div>
      )}

      {panelOpen && (
        <div className="absolute bottom-6 right-6">
          <MusePanel
            elements={selection}
            mock={MOCK}
            stepKey={stepKey}
            closing={closing}
            loading={loading || historyLoading}
            historyControls={hasHistory ? historyControls : undefined}
            onClose={requestClose}
            onRemove={removeChip}
          >
            {unmappable ? (
              <UnmappableNote />
            ) : messages.length === 0 ? (
              <IntentForm
                value={intent}
                onChange={(v) => museStore.setState({ intent: v })}
                onSubmit={start}
                loading={loading}
              />
            ) : pending?.kind === 'ask' ? (
              <ClarifyingQuestions
                questions={pending.questions}
                answers={answers}
                onSelect={(qi, label) =>
                  museStore.setState((s) => ({ answers: { ...s.answers, [qi]: label } }))
                }
                onContinue={submitAnswers}
                loading={loading}
                allAnswered={allAnswered}
              />
            ) : pending?.kind === 'propose' ? (
              <ProposedEdit
                edits={pending.edits}
                originals={originals}
                rationale={pending.rationale}
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
          onCancel={() => museStore.setState({ showRevertConfirm: false })}
          loading={historyLoading}
        />
      )}
    </div>
  )
}
