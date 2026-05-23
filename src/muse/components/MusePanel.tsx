import type { ReactNode } from 'react'
import type { SelectedElement } from '../types'
import type { HistoryControls } from '../MuseOverlay'

const fileOf = (e: SelectedElement) => (e.fileName ? e.fileName.split(/[\\/]/).pop() : null)

export function MusePanel({
  elements,
  mock = false,
  stepKey,
  closing = false,
  historyControls,
  onClose,
  onRemove,
  children,
}: {
  elements: SelectedElement[]
  mock?: boolean
  stepKey?: string
  closing?: boolean
  historyControls?: HistoryControls
  onClose: () => void
  onRemove?: (key: string) => void
  children: ReactNode
}) {
  const single = elements.length === 1 ? elements[0] : null

  return (
    // Near-black tool surface. Grows out of the bottom-right (the FAB); reverses on close.
    <div
      className={`pointer-events-auto flex max-h-[80vh] w-[380px] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-ink/95 text-zinc-100 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl motion-reduce:animate-none ${
        closing ? 'animate-muse-panel-out' : 'animate-muse-panel'
      }`}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-zinc-100">
          <span className="text-accent">✦</span> Muse
          {mock && (
            <span className="ml-1 rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
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

      {/* Target(s) */}
      <div className="border-y border-white/[0.07] bg-white/[0.02] px-4 py-2 text-xs text-zinc-500">
        {single ? (
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-zinc-300 ring-1 ring-white/10">
              &lt;{single.tag}&gt;
            </span>
            {fileOf(single) ? (
              <span className="truncate font-mono">
                {fileOf(single)}:{single.line}
              </span>
            ) : (
              <span className="text-amber-300/80">source not found</span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="font-medium text-zinc-400">Editing {elements.length} elements</div>
            <div className="flex flex-wrap gap-1.5">
              {elements.map((el) => (
                <span
                  key={el.key}
                  title={`${fileOf(el)}:${el.line}`}
                  className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-zinc-300 ring-1 ring-white/10"
                >
                  &lt;{el.tag}&gt;
                  {onRemove && (
                    <button
                      onClick={() => onRemove(el.key)}
                      aria-label={`Remove ${el.tag}`}
                      className="text-zinc-500 transition hover:text-zinc-200"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
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
