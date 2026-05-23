import type { ReactNode } from 'react'
import { ArrowCounterClockwise, ArrowUUpLeft, ArrowUUpRight } from '@phosphor-icons/react'

type Props = {
  canUndo: boolean
  canRedo: boolean
  loading: boolean
  onUndo: () => void
  onRedo: () => void
  onRevert: () => void
}

export function UndoRedoBar({ canUndo, canRedo, loading, onUndo, onRedo, onRevert }: Props) {
  return (
    <div className="pointer-events-auto flex items-center gap-0.5 rounded-2xl bg-ink/95 px-1.5 py-1.5 shadow-xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl">
      <HistoryBtn onClick={onUndo} disabled={!canUndo || loading} label="Undo" icon={<ArrowUUpLeft size={15} />} />
      <HistoryBtn onClick={onRedo} disabled={!canRedo || loading} label="Redo" icon={<ArrowUUpRight size={15} />} />
      {canUndo && (
        <>
          <div className="mx-1.5 h-3.5 w-px bg-white/10" />
          <HistoryBtn
            onClick={onRevert}
            disabled={loading}
            label="Revert to original"
            icon={<ArrowCounterClockwise size={15} />}
            danger
          />
        </>
      )}
    </div>
  )
}

function HistoryBtn({
  onClick,
  disabled,
  label,
  icon,
  danger = false,
}: {
  onClick: () => void
  disabled: boolean
  label: string
  icon: ReactNode
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
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
