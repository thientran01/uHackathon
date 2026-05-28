import { useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { FileEdit } from '../../types'
import { DiffView } from '../DiffView'
import { PrimaryButton } from '../PrimaryButton'

const fileShort = (p: string) => p.split(/[\\/]/).pop() ?? p

export function MessageOptionSet({
  edits,
  originals,
  rationale,
  loading,
  onApprove,
  active,
}: {
  edits: FileEdit[]
  originals: Record<string, string>
  rationale: string
  loading: boolean
  onApprove: () => void
  /** Active = renders the approve button. Inactive (a newer bubble took
   *  over before this one was approved) = read-only diff. */
  active: boolean
}) {
  const [idx, setIdx] = useState(0)
  const safe = Math.min(idx, Math.max(0, edits.length - 1))
  const edit = edits[safe]
  const multi = edits.length > 1

  return (
    <div className="space-y-3">
      {rationale && <p className="text-sm leading-relaxed text-fg">{rationale}</p>}

      {edit && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-mono text-fg-muted">{fileShort(edit.fileName)}</span>
            {multi && (
              <div className="flex shrink-0 items-center gap-1.5 text-fg-faint">
                <button
                  data-testid="muse-diff-prev"
                  onClick={() => setIdx(Math.max(0, safe - 1))}
                  disabled={safe === 0}
                  className="rounded p-1 transition hover:bg-line/5 hover:text-fg disabled:opacity-30"
                  aria-label="Previous file"
                >
                  <CaretLeft size={14} />
                </button>
                <span className="tabular-nums">
                  {safe + 1} of {edits.length} files
                </span>
                <button
                  data-testid="muse-diff-next"
                  onClick={() => setIdx(Math.min(edits.length - 1, safe + 1))}
                  disabled={safe === edits.length - 1}
                  className="rounded p-1 transition hover:bg-line/5 hover:text-fg disabled:opacity-30"
                  aria-label="Next file"
                >
                  <CaretRight size={14} />
                </button>
              </div>
            )}
          </div>
          <DiffView original={originals[edit.fileName] ?? ''} newContent={edit.newContent} />
        </div>
      )}

      {active && (
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
