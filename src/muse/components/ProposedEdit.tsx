import type { HistoryControls } from '../MuseOverlay'
import { DiffView } from './DiffView'
import { PrimaryButton } from './PrimaryButton'

export function ProposedEdit({
  rationale,
  original,
  newContent,
  applied,
  loading,
  onApprove,
  historyControls,
}: {
  rationale: string
  original: string
  newContent: string
  applied: boolean
  loading: boolean
  onApprove: () => void
  historyControls?: HistoryControls
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-300">{rationale}</p>
      <DiffView original={original} newContent={newContent} />
      {applied ? (
        <div className="space-y-2">
          <div className="flex animate-muse-rise items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/20 motion-reduce:animate-none">
            <span className="leading-5">✓</span>
            <span>Applied — your app updated, and the code change is real.</span>
          </div>
          {historyControls && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <GhostBtn
                onClick={historyControls.onUndo}
                disabled={!historyControls.canUndo || historyControls.loading}
                icon="↩"
                label="Undo"
              />
              <GhostBtn
                onClick={historyControls.onRedo}
                disabled={!historyControls.canRedo || historyControls.loading}
                icon="↪"
                label="Redo"
              />
              {historyControls.canUndo && (
                <>
                  <div className="h-3.5 w-px bg-white/10" />
                  <GhostBtn
                    onClick={historyControls.onRevert}
                    disabled={historyControls.loading}
                    icon="⟲"
                    label="Revert to original"
                    danger
                  />
                </>
              )}
            </div>
          )}
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

function GhostBtn({
  onClick,
  disabled,
  icon,
  label,
  danger = false,
}: {
  onClick: () => void
  disabled: boolean
  icon: string
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
      <span aria-hidden className="text-[13px] leading-none">
        {icon}
      </span>
      {label}
    </button>
  )
}
