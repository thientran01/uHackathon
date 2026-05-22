import type { Rect } from '../useSelection'

export function SelectBanner() {
  return (
    <div className="pointer-events-none rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur">
      Click any element to redesign it <span className="opacity-50">· Esc to cancel</span>
    </div>
  )
}

export function HoverHighlight({ rect }: { rect: Rect }) {
  return (
    <div
      className="pointer-events-none absolute rounded-md bg-violet-500/10 ring-2 ring-violet-500 transition-all duration-75"
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    />
  )
}
