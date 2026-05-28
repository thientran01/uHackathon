import { useEffect, useRef } from 'react'
import type { FileEdit, ThreadMessage } from '../types'
import type { Pending } from '../store'
import { MessageApplied } from './messages/MessageApplied'
import { MessageClarify } from './messages/MessageClarify'
import { MessageOptionSet } from './messages/MessageOptionSet'
import { MessageTargetHandoff } from './messages/MessageTargetHandoff'
import { MessageThinking } from './messages/MessageThinking'
import { MessageUser } from './messages/MessageUser'

export function MuseThread({
  thread,
  pending,
  originals,
  loading,
  // clarify handlers
  answers,
  onSelectAnswer,
  onContinue,
  allAnswered,
  // option-set handlers
  onApprove,
}: {
  thread: ThreadMessage[]
  pending: Pending | null
  originals: Record<string, string>
  loading: boolean
  answers: Record<number, string>
  onSelectAnswer: (qi: number, label: string) => void
  onContinue: () => void
  allAnswered: boolean
  onApprove: (edits: FileEdit[]) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the bottom when new bubbles arrive or while Muse is
  // thinking (so the thinking bubble stays visible).
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [thread.length, loading])

  return (
    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
      {thread.map((m) => {
        switch (m.kind) {
          case 'user':
            return <MessageUser key={m.id} text={m.text} />
          case 'clarify':
            return (
              <MessageClarify
                key={m.id}
                questions={m.questions}
                answers={answers}
                onSelect={onSelectAnswer}
                onContinue={onContinue}
                loading={loading}
                allAnswered={allAnswered}
                active={pending?.kind === 'ask' && pending.toolUseId === m.toolUseId}
              />
            )
          case 'option-set':
            return (
              <MessageOptionSet
                key={m.id}
                edits={m.edits}
                originals={originals}
                rationale={m.rationale}
                loading={loading}
                onApprove={() => onApprove(m.edits)}
                active={pending?.kind === 'propose' && pending.toolUseId === m.toolUseId}
              />
            )
          case 'applied':
            return <MessageApplied key={m.id} fileCount={m.fileCount} rationale={m.rationale} />
          case 'target-handoff':
            return <MessageTargetHandoff key={m.id} target={m.target} />
          case 'error':
            return (
              <p key={m.id} className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/20">
                {m.text}
              </p>
            )
        }
      })}
      {loading && <MessageThinking />}
    </div>
  )
}
