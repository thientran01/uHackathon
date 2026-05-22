import type { ReactNode } from 'react'
import type { SelectedElement } from '../types'
import type { HistoryControls } from '../MuseOverlay'

export function MusePanel({
  element,
  mock = false,
  stepKey,
  historyControls,
  onClose,
  children,
}: {
  element: SelectedElement
  mock?: boolean
  /** Changes per flow step so the body re-mounts and plays the step animation. */
  stepKey?: string
  historyControls?: HistoryControls
  onClose: () => void
  children: ReactNode
}) {
  const file = element.fileName ? element.fileName.split(/[\\/]/).pop() : null
  return (
    <div className="pointer-events-auto flex max-h-[80vh] w-[380px] origin-bottom-right animate-muse-panel flex-col overflow-hidden rounded-2xl bg-ink/95 text-zinc-100 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl motion-reduce:animate-none">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-zinc-100">
          <span className="text-accent">✦</span> Muse
          {mock && (
            <span className="ml-1 rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
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
                icon="↩"
              />
              <HeaderIconBtn
                onClick={historyControls.onRedo}
                disabled={!historyControls.canRedo || historyControls.loading}
                label="Redo"
                icon="↪"
              />
              {historyControls.canUndo && (
                <HeaderIconBtn
                  onClick={historyControls.onRevert}
                  disabled={historyControls.loading}
                  label="Revert to original"
                  icon="⟲"
                  danger
                />
              )}
              <div className="mx-1 h-3.5 w-px bg-white/10" />
            </>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 border-y border-white/[0.07] bg-white/[0.02] px-4 py-2 text-xs text-zinc-500">
        <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-zinc-300 ring-1 ring-white/10">
          &lt;{element.tag}&gt;
        </span>
        {file ? (
          <span className="truncate font-mono">
            {file}:{element.line}
          </span>
        ) : (
          <span className="text-amber-300/80">source not found</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5">
        {/* Keyed so each step swap replays the subtle blur-rise transition. */}
        <div key={stepKey} className="animate-muse-step motion-reduce:animate-none">
          {children}
        </div>
      </div>
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
  icon: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-md p-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
      }`}
    >
      {icon}
    </button>
  )
}
