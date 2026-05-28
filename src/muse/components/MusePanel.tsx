import type { ReactNode } from 'react'
import {
  ArrowCounterClockwise,
  ArrowUUpLeft,
  ArrowUUpRight,
  X,
} from '@phosphor-icons/react'
import type { HistoryControls } from '../MuseOverlay'
import { UfoIcon } from './UfoIcon'

// Panel chrome: rounded card + header + a flexbox column slot below.
// Content (target strip + thread + composer) is composed in MuseOverlay
// and dropped into the children slot. MusePanel intentionally knows
// nothing about the thread or its state — it's just the surface.
export function MusePanel({
  mock = false,
  closing = false,
  loading = false,
  historyControls,
  onClose,
  children,
}: {
  mock?: boolean
  closing?: boolean
  loading?: boolean
  historyControls?: HistoryControls
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className={`pointer-events-auto flex max-h-[80vh] w-[380px] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-surface/95 text-fg shadow-2xl shadow-black/40 ring-1 ring-line/10 backdrop-blur-xl motion-reduce:animate-none ${
        closing ? 'animate-muse-panel-out' : 'animate-muse-panel'
      }`}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-fg">
          <UfoIcon size={16} loading={loading} className="text-accent" />
          Muse
          {mock && (
            <span className="ml-1 rounded border border-line/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-faint">
              mock
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {historyControls && (
            <>
              <HeaderIconBtn
                onClick={historyControls.onUndo}
                disabled={!historyControls.canUndo || historyControls.loading}
                label="Undo"
                icon={<ArrowUUpLeft size={15} />}
              />
              <HeaderIconBtn
                onClick={historyControls.onRedo}
                disabled={!historyControls.canRedo || historyControls.loading}
                label="Redo"
                icon={<ArrowUUpRight size={15} />}
              />
              <HeaderIconBtn
                onClick={historyControls.onRevert}
                disabled={!historyControls.canUndo || historyControls.loading}
                label="Revert to original"
                icon={<ArrowCounterClockwise size={15} />}
                danger
              />
              <div className="mx-1 h-3.5 w-px bg-line/10" />
            </>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-fg-faint transition hover:bg-line/5 hover:text-fg"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

function HeaderIconBtn({
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
      className={`rounded-md p-1.5 transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
          : 'text-fg-faint hover:bg-line/5 hover:text-fg'
      }`}
    >
      {icon}
    </button>
  )
}
