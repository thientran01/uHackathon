import { useEffect, useRef, useState } from 'react'
import { museChat, museWrite } from './api'
import { MOCK } from './config'
import { useSelection } from './useSelection'
import { ClarifyingQuestions } from './components/ClarifyingQuestions'
import { IntentForm } from './components/IntentForm'
import { MuseFab } from './components/MuseFab'
import { MusePanel } from './components/MusePanel'
import { ProposedEdit } from './components/ProposedEdit'
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
  ClarifyingQuestion,
  ContentBlock,
  FileEdit,
  ProposeInput,
  ToolUseBlock,
} from './types'

type Pending =
  | { kind: 'ask'; toolUseId: string; questions: ClarifyingQuestion[] }
  | { kind: 'propose'; toolUseId: string; edits: FileEdit[]; rationale: string }

const EXIT_MS = 170 // keep in sync with the muse-panel-out animation

export function MuseOverlay() {
  const { active, setActive, hoverRect, hoverInfo, cursor, selection, setSelection, clearSelection } =
    useSelection()

  const [intent, setIntent] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState<Pending | null>(null)
  const [originals, setOriginals] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)

  // Reset the conversation whenever the selection changes.
  useEffect(() => {
    setIntent('')
    setMessages([])
    setPending(null)
    setAnswers({})
    setError(null)
    setApplied(false)
  }, [selection])

  function requestClose() {
    if (closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      clearSelection()
      setClosing(false)
    }, EXIT_MS)
  }

  function refineAgain() {
    setMessages([])
    setPending(null)
    setAnswers({})
    setError(null)
    setApplied(false)
    setIntent('')
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
    setLoading(true)
    setError(null)
    try {
      const resp = await museChat(selection, msgs)
      if (resp.error) {
        setError(resp.error)
        return
      }
      const blocks: ContentBlock[] = resp.content ?? []
      if (resp.originals) setOriginals(resp.originals)
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
        const input = tu.input as ProposeInput
        setPending({ kind: 'propose', toolUseId: tu.id, edits: input.edits, rationale: input.rationale })
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
    if (!pending || pending.kind !== 'propose') return
    setLoading(true)
    setError(null)
    try {
      await museWrite(pending.edits)
      setApplied(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const single = selection.length === 1 ? selection[0] : null
  const unmappable = !!single && !single.fileName
  const allAnswered =
    pending?.kind === 'ask' &&
    pending.questions.every((_, i) => (answers[i] ?? '').trim() !== '')
  const panelOpen = selection.length >= 1 && !active
  const showMarkers = selection.length >= 1 && (active || selection.length > 1)
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
    <div data-muse-ui className="pointer-events-none fixed inset-0 z-[999999] font-sans">
      {active && hoverRect && <HoverHighlight rect={hoverRect} cursor={cursor} info={hoverInfo} />}
      {showMarkers && <SelectionMarkers elements={selection} />}

      {active && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <SelectBanner />
        </div>
      )}

      {selection.length === 0 && (
        <div className="absolute bottom-6 right-6">
          <MuseFab active={active} onToggle={() => setActive((v) => !v)} />
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
            onClose={requestClose}
            onRemove={removeChip}
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
                edits={pending.edits}
                originals={originals}
                rationale={pending.rationale}
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
