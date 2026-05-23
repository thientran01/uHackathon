import { useState, type ReactNode } from 'react'
import {
  ArrowCounterClockwise,
  ArrowUUpLeft,
  ArrowUUpRight,
  CaretLeft,
  CaretRight,
  Check,
} from '@phosphor-icons/react'
import type { HistoryControls } from '../MuseOverlay'
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
  historyControls,
}: {
  edits: FileEdit[]
  originals: Record<string, string>
  rationale: string
  applied: boolean
  loading: boolean
  onApprove: () => void
  onRefine: () => void
  historyControls?: HistoryControls
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
                  <CaretLeft size={14} />
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
                  <CaretRight size={14} />
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
            <Check size={16} weight="bold" className="mt-0.5 shrink-0" />
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
          {historyControls && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <GhostBtn
                onClick={historyControls.onUndo}
                disabled={!historyControls.canUndo || historyControls.loading}
                icon={<ArrowUUpLeft size={14} />}
                label="Undo"
              />
              <GhostBtn
                onClick={historyControls.onRedo}
                disabled={!historyControls.canRedo || historyControls.loading}
                icon={<ArrowUUpRight size={14} />}
                label="Redo"
              />
              <div className="h-3.5 w-px bg-white/10" />
              <GhostBtn
                onClick={historyControls.onRevert}
                disabled={!historyControls.canUndo || historyControls.loading}
                icon={<ArrowCounterClockwise size={14} />}
                label="Revert to original"
                danger
              />
            </div>
          )}
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

function GhostBtn({
  onClick,
  disabled,
  icon,
  label,
  danger = false,
}: {
  onClick: () => void
  disabled: boolean
  icon: ReactNode
  label: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
