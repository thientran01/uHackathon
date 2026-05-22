import { DiffView } from './DiffView'
import { PrimaryButton } from './PrimaryButton'

export function ProposedEdit({
  rationale,
  original,
  newContent,
  applied,
  loading,
  onApprove,
  onRefine,
}: {
  rationale: string
  original: string
  newContent: string
  applied: boolean
  loading: boolean
  onApprove: () => void
  onRefine: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-300">{rationale}</p>
      <DiffView original={original} newContent={newContent} />
      {applied ? (
        <div className="space-y-2.5">
          <div className="flex animate-muse-rise items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/20 motion-reduce:animate-none">
            <span className="leading-5">✓</span>
            <span>Applied — your app updated, and the code change is real.</span>
          </div>
          {/* Keep the conversation going on the same element — partner, not one-shot. */}
          <button
            data-testid="muse-refine"
            onClick={onRefine}
            className="w-full rounded-xl border border-white/15 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 active:scale-[0.97] motion-reduce:active:scale-100"
          >
            Make another change
          </button>
        </div>
      ) : (
        <PrimaryButton
          testId="muse-approve"
          onClick={onApprove}
          loading={loading}
          idle="Approve & apply"
          busy="Applying…"
        />
      )}
    </div>
  )
}
