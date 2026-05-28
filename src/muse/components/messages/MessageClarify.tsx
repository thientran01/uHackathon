import { useState } from 'react'
import type { ClarifyingQuestion } from '../../types'
import { PrimaryButton } from '../PrimaryButton'

export function MessageClarify({
  questions,
  answers,
  onSelect,
  onContinue,
  loading,
  allAnswered,
  active,
  answeredWith,
}: {
  questions: ClarifyingQuestion[]
  answers: Record<number, string>
  onSelect: (qi: number, label: string) => void
  onContinue: () => void
  loading: boolean
  allAnswered: boolean
  /** Active = renders interactive option buttons. Inactive (a newer bubble
   *  has taken over) = collapsed read-only summary of what was asked/answered. */
  active: boolean
  /** Frozen answers snapshot for inactive rendering. The store clears the
   *  live `answers` map when a new clarify activates, so inactive bubbles
   *  must use their own snapshot to avoid flashing blank. */
  answeredWith?: Record<number, string>
}) {
  const [otherOpen, setOtherOpen] = useState<Record<number, boolean>>({})

  if (!active) {
    const frozen = answeredWith ?? {}
    return (
      <div className="space-y-1.5 text-sm">
        {questions.map((q, qi) => (
          <div key={qi} className="text-fg-muted">
            <span className="text-fg">{q.question}</span>
            {frozen[qi] && (
              <span className="text-fg-faint"> → {frozen[qi]}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const isOther = !!otherOpen[qi]
        return (
          <div key={qi} className="space-y-2">
            <p className="text-sm font-medium text-fg">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const chosen = !isOther && answers[qi] === opt.label
                return (
                  <button
                    key={opt.label}
                    data-testid="muse-option"
                    onClick={() => {
                      setOtherOpen((o) => ({ ...o, [qi]: false }))
                      onSelect(qi, opt.label)
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                      chosen
                        ? 'border-accent bg-accent/15 ring-1 ring-accent'
                        : 'border-line/10 bg-line/[0.03] hover:border-line/20 hover:bg-line/[0.06]'
                    }`}
                  >
                    <div className="text-sm font-medium text-fg">{opt.label}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-fg-faint">{opt.description}</div>
                  </button>
                )
              })}

              <button
                data-testid="muse-option-other"
                onClick={() => {
                  if (!isOther) {
                    setOtherOpen((o) => ({ ...o, [qi]: true }))
                    onSelect(qi, '')
                  }
                }}
                className={`w-full rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                  isOther
                    ? 'border-accent bg-accent/15 ring-1 ring-accent'
                    : 'border-line/10 bg-line/[0.03] hover:border-line/20 hover:bg-line/[0.06]'
                }`}
              >
                <div className="text-sm font-medium text-fg">Something else…</div>
                {!isOther && (
                  <div className="mt-0.5 text-xs leading-relaxed text-fg-faint">
                    Describe the change in your own words.
                  </div>
                )}
              </button>

              {isOther && (
                <input
                  data-testid="muse-other-input"
                  autoFocus
                  value={answers[qi] ?? ''}
                  onChange={(e) => onSelect(qi, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && allAnswered && !loading) onContinue()
                  }}
                  placeholder="e.g. give it a retro arcade feel"
                  className="w-full rounded-xl border border-line/10 bg-line/[0.04] p-3 text-sm text-fg outline-none transition placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
              )}
            </div>
          </div>
        )
      })}
      <PrimaryButton
        testId="muse-continue"
        onClick={onContinue}
        disabled={loading || !allAnswered}
        loading={loading}
        idle="Continue"
        busy="Designing…"
      />
    </div>
  )
}
