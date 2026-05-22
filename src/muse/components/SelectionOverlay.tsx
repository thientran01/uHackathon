import type { Rect } from '../useSelection'

export function SelectBanner() {
  return (
    <div className="pointer-events-none rounded-full bg-ink/95 px-4 py-2 text-sm font-medium text-zinc-200 shadow-lg ring-1 ring-white/10 backdrop-blur">
      Click any element to redesign it <span className="text-zinc-500">· Esc to cancel</span>
    </div>
  )
}

export function HoverHighlight({ rect }: { rect: Rect }) {
  return (
    <div
      // On-screen movement between elements -> ease-in-out, fast. Instant for
      // reduced-motion (it tracks the cursor, so no continuity is lost).
      className="pointer-events-none absolute rounded-md bg-accent/10 ring-2 ring-accent transition-all duration-100 ease-in-out motion-reduce:transition-none"
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    />
  )
}
