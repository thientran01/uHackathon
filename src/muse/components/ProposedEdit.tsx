import { DiffView } from './DiffView'
import { PrimaryButton } from './PrimaryButton'

export function ProposedEdit({
  rationale,
  original,
  newContent,
  applied,
  loading,
  onApprove,
}: {
  rationale: string
  original: string
  newContent: string
  applied: boolean
  loading: boolean
  onApprove: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-slate-700">{rationale}</p>
      <DiffView original={original} newContent={newContent} />
      {applied ? (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
          <span className="leading-5">✓</span>
          <span>Applied — your app updated, and the code change is real.</span>
        </div>
      ) : (
        <PrimaryButton
          testId="muse-approve"
          variant="emerald"
          onClick={onApprove}
          loading={loading}
          idle="Approve & apply"
          busy="Applying…"
        />
      )}
    </div>
  )
}
