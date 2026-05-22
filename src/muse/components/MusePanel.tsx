import type { ReactNode } from 'react'
import type { SelectedElement } from '../types'

export function MusePanel({
  element,
  mock = false,
  stepKey,
  onClose,
  children,
}: {
  element: SelectedElement
  mock?: boolean
  /** Changes per flow step so the body re-mounts and plays the step animation. */
  stepKey?: string
  onClose: () => void
  children: ReactNode
}) {
  const file = element.fileName ? element.fileName.split(/[\\/]/).pop() : null
  return (
    // Near-black tool surface. Entrance grows out of the bottom-right (the FAB).
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
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
        >
          ✕
        </button>
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
