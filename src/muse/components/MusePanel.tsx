import type { ReactNode } from 'react'
import type { SelectedElement } from '../types'

export function MusePanel({
  element,
  mock = false,
  onClose,
  children,
}: {
  element: SelectedElement
  mock?: boolean
  onClose: () => void
  children: ReactNode
}) {
  const file = element.fileName ? element.fileName.split(/[\\/]/).pop() : null
  return (
    <div className="pointer-events-auto flex max-h-[80vh] w-[380px] flex-col overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-slate-900">
          <span className="text-violet-600">✦</span> Muse
          {mock && (
            <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              mock
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>
      </header>

      <div className="flex items-center gap-2 border-y border-slate-100 bg-slate-50/70 px-4 py-2 text-xs text-slate-500">
        <span className="rounded bg-white px-1.5 py-0.5 font-mono text-slate-700 ring-1 ring-slate-200">
          &lt;{element.tag}&gt;
        </span>
        {file ? (
          <span className="truncate font-mono">
            {file}:{element.line}
          </span>
        ) : (
          <span className="text-amber-600">source not found</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5">{children}</div>
    </div>
  )
}
