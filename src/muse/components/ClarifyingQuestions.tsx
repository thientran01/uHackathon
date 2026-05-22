import type { ClarifyingQuestion } from '../types'
import { PrimaryButton } from './PrimaryButton'

export function ClarifyingQuestions({
  questions,
  answers,
  onSelect,
  onContinue,
  loading,
  allAnswered,
}: {
  questions: ClarifyingQuestion[]
  answers: Record<number, string>
  onSelect: (qi: number, label: string) => void
  onContinue: () => void
  loading: boolean
  allAnswered: boolean
}) {
  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-sm font-medium text-zinc-200">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const chosen = answers[qi] === opt.label
              return (
                <button
                  key={opt.label}
                  data-testid="muse-option"
                  onClick={() => onSelect(qi, opt.label)}
                  className={`w-full rounded-xl border p-3 text-left transition active:scale-[0.99] ${
                    chosen
                      ? 'border-accent bg-accent/15 ring-1 ring-accent'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-sm font-medium text-zinc-100">{opt.label}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-zinc-500">{opt.description}</div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
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
