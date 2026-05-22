import { useState } from 'react'
import type { FileEdit } from '../types'
import { DiffView } from './DiffView'
import { PrimaryButton } from './PrimaryButton'

const fileShort = (p: string) => p.split(/[\\/]/).pop() ?? p

export function ProposedEdit({
  edits,
  originals,
  rationale,
  applied,
  loading,
  onApprove,
  onRefine,
}: {
  edits: FileEdit[]
  originals: Record<string, string>
  rationale: string
  applied: boolean
  loading: boolean
  onApprove: () => void
  onRefine: () => void
}) {
  const [idx, setIdx] = useState(0)
  const safe = Math.min(idx, Math.max(0, edits.length - 1))
  const edit = edits[safe]
  const multi = edits.length > 1

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-300">{rationale}</p>

      {edit && (
        <div className="space-y-2">
          {/* File header + pager (one file at a time) */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-mono text-zinc-400">{fileShort(edit.fileName)}</span>
            {multi && (
              <div className="flex shrink-0 items-center gap-1.5 text-zinc-500">
                <button
                  data-testid="muse-diff-prev"
                  onClick={() => setIdx(Math.max(0, safe - 1))}
                  disabled={safe === 0}
                  className="rounded p-1 transition hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
                  aria-label="Previous file"
                >
                  ◄
                </button>
                <span className="tabular-nums">
                  {safe + 1} of {edits.length} files
                </span>
                <button
                  data-testid="muse-diff-next"
                  onClick={() => setIdx(Math.min(edits.length - 1, safe + 1))}
                  disabled={safe === edits.length - 1}
                  className="rounded p-1 transition hover:bg-white/5 hover:text-zinc-200 disabled:opacity-30"
                  aria-label="Next file"
                >
                  ►
                </button>
              </div>
            )}
          </div>
          <DiffView original={originals[edit.fileName] ?? ''} newContent={edit.newContent} />
        </div>
      )}

      {applied ? (
        <div className="space-y-2.5">
          <div className="flex animate-muse-rise items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/20 motion-reduce:animate-none">
            <span className="leading-5">✓</span>
            <span>
              Applied to {edits.length} file{edits.length === 1 ? '' : 's'} — your app updated, and the
              code change is real.
            </span>
          </div>
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
          idle={multi ? `Approve & apply (${edits.length} files)` : 'Approve & apply'}
          busy="Applying…"
        />
      )}
    </div>
  )
}
