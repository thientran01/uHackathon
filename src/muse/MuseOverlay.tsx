import { useEffect, useRef, useState } from 'react'
import './muse.css'
import { museChat, museWrite } from './api'
import { MOCK } from './config'
import { useSelection } from './useSelection'
import { useHostTheme } from './hooks/useHostTheme'
import { museStore, nextThreadId, useMuseStore } from './store'
import { ActiveTargetStrip } from './components/ActiveTargetStrip'
import { Composer } from './components/Composer'
import { MuseFab } from './components/MuseFab'
import { MusePanel } from './components/MusePanel'
import { MuseThread } from './components/MuseThread'
import { RevertConfirmDialog } from './components/RevertConfirmDialog'
import { UndoRedoBar } from './components/UndoRedoBar'
import {
  HoverHighlight,
  SelectBanner,
  SelectionMarkers,
  SelectionTray,
} from './components/SelectionOverlay'
import type {
  AskInput,
  ChatMessage,
  ContentBlock,
  FileEdit,
  HistoryEntry,
  ProposeInput,
  SelectedElement,
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

  const {
    thread,
    draft,
    pending,
    originals,
    answers,
    loading,
    error,
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

  // When the SET of selected elements changes:
  //   - Empty selection → wipe conversation.
  //   - First-ever target this session → fresh thread (keep typed draft).
  //   - Shrink or grow of the same focus (one set is a subset of the other)
  //     → no handoff, keep the thread. This covers shift-click to add or
  //     remove batch elements without "switching focus."
  //   - Truly different selection (some elements swapped) → append handoff.
  const selectionKey = selection.map((s) => s.key).sort().join('|')
  useEffect(() => {
    const curKeys = selection.map((s) => s.key)
    const prevKeys = prevKeysRef.current

    if (curKeys.length === 0) {
      prevKeysRef.current = []
      museStore.resetConversation()
      return
    }
    if (prevKeys.length === 0) {
      prevKeysRef.current = curKeys
      museStore.resetConversation(true)
      return
    }
    // Pure shrink (cur ⊆ prev) OR pure grow (prev ⊆ cur) = no handoff.
    const curInPrev = curKeys.every((k) => prevKeys.includes(k))
    const prevInCur = prevKeys.every((k) => curKeys.includes(k))
    prevKeysRef.current = curKeys
    if (curInPrev || prevInCur) return

    const cur = selection[0]
    if (cur) {
      museStore.appendThread({ id: nextThreadId(), kind: 'target-handoff', target: cur })
    }
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
        const questions = (tu.input as AskInput).questions
        museStore.setState({
          answers: {},
          pending: { kind: 'ask', toolUseId: tu.id, questions },
        })
        museStore.appendThread({ id: nextThreadId(), kind: 'clarify', toolUseId: tu.id, questions })
      } else {
        const input = tu.input as ProposeInput
        const allowed = new Set(Object.keys(resp.originals ?? {}))
        const edits = (Array.isArray(input.edits) ? input.edits : [])
          .map((e) => ({ fileName: normPath(e.fileName ?? ''), newContent: e.newContent }))
          .filter((e) => typeof e.newContent === 'string' && allowed.has(e.fileName))
        if (edits.length === 0) {
          museStore.setState({ error: "Muse didn't return changes for the selected element(s). Try rephrasing." })
          return
        }
        const rationale = input.rationale ?? ''
        museStore.setState({
          pending: { kind: 'propose', toolUseId: tu.id, edits, rationale },
        })
        museStore.appendThread({ id: nextThreadId(), kind: 'option-set', toolUseId: tu.id, edits, rationale })
      }
    } catch (e) {
      museStore.setState({ error: (e as Error).message })
    } finally {
      museStore.setState({ loading: false })
    }
  }

  // Send the composer text as the next user message. Reads from store.getState()
  // so a rapid double-submit can't see a stale closed-over `pending` / `messages`.
  function sendDraft() {
    const text = draft.trim()
    if (!text) return
    const s = museStore.getState()
    museStore.setState({ draft: '' })
    museStore.appendThread({ id: nextThreadId(), kind: 'user', text })
    // If a clarify is currently pending and the user typed in the composer
    // instead of using the option buttons, freeze whatever partial selections
    // they had so the now-inactive clarify renders consistently.
    if (s.pending?.kind === 'ask') museStore.snapshotLastClarifyAnswers(s.answers)
    const next: ChatMessage = s.pending?.kind === 'ask'
      ? { role: 'user', content: [{ type: 'tool_result', tool_use_id: s.pending.toolUseId, content: text }] }
      : { role: 'user', content: text }
    runChat([...s.messages, next])
  }

  function submitAnswers() {
    const s = museStore.getState()
    if (!s.pending || s.pending.kind !== 'ask') return
    // Freeze the chosen answers into the clarify bubble before the live
    // `answers` map gets cleared for the next turn.
    museStore.snapshotLastClarifyAnswers(s.answers)
    // No user bubble — the inactive clarify summary covers it.
    const text = s.pending.questions
      .map((q, i) => `${q.question} → ${s.answers[i] ?? '(no preference)'}`)
      .join('\n')
    runChat([
      ...s.messages,
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: s.pending.toolUseId, content: text }] },
    ])
  }

  async function approve(edits: FileEdit[]) {
    const s = museStore.getState()
    if (!s.pending || s.pending.kind !== 'propose' || s.loading) return
    const rationale = s.pending.rationale
    museStore.setState({ loading: true, error: null })
    try {
      await museWrite(edits)
      const entry: HistoryEntry = {
        files: edits.map((e) => ({
          fileName: e.fileName,
          before: s.originals[e.fileName] ?? '',
          after: e.newContent,
        })),
        elements: selection,
        label: rationale.slice(0, 80),
      }
      museStore.setState((cur) => ({
        past: [...cur.past, entry],
        future: [],
        applied: true,
        pending: null,
      }))
      museStore.appendThread({
        id: nextThreadId(),
        kind: 'applied',
        fileCount: edits.length,
        rationale: '',
      })
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

  // Keyboard for both phases + click-outside while the panel is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active) {
        if (e.key === 'Enter' && selection.length >= 1) {
          e.preventDefault()
          setActive(false)
        }
        return
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
  }, [active, selection, closing, pending, allAnswered, loading])

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
            mock={MOCK}
            closing={closing}
            loading={loading || historyLoading}
            historyControls={hasHistory ? historyControls : undefined}
            onClose={requestClose}
          >
            <ActiveTargetStrip elements={selection} mock={MOCK} onRemove={removeChip} />
            {unmappable ? (
              <div className="flex-1 overflow-y-auto px-4 py-3.5">
                <p className="text-sm leading-relaxed text-amber-300/80">
                  Couldn't map this element to a source file. Try clicking page content — it works best
                  inside <code className="rounded bg-line/10 px-1 text-amber-200">src/demo/</code>.
                </p>
              </div>
            ) : (
              <>
                <MuseThread
                  thread={thread}
                  pending={pending}
                  originals={originals}
                  loading={loading}
                  answers={answers}
                  onSelectAnswer={(qi, label) =>
                    museStore.setState((s) => ({ answers: { ...s.answers, [qi]: label } }))
                  }
                  onContinue={submitAnswers}
                  allAnswered={allAnswered}
                  onApprove={approve}
                />
                {error && (
                  <div className="px-3 pb-2">
                    <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/20">
                      {error}
                    </p>
                  </div>
                )}
                <Composer
                  value={draft}
                  onChange={(v) => museStore.setState({ draft: v })}
                  onSubmit={sendDraft}
                  loading={loading}
                />
              </>
            )}
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
