import { Check } from '@phosphor-icons/react'

// The "I shipped your change" beat. Earned animation (muse-rise).
export function MessageApplied({ fileCount, rationale }: { fileCount: number; rationale: string }) {
  return (
    <div className="space-y-1.5">
      {rationale && <p className="text-sm leading-relaxed text-fg">{rationale}</p>}
      <div className="flex animate-muse-rise items-start gap-2 rounded-xl bg-diff-add/20 px-3 py-2.5 text-sm font-semibold text-diff-add-text ring-1 ring-diff-add/40 motion-reduce:animate-none">
        <Check size={16} weight="bold" className="mt-0.5 shrink-0" />
        <span>
          Applied to {fileCount} file{fileCount === 1 ? '' : 's'} — your app updated, and the code change is real.
        </span>
      </div>
    </div>
  )
}
