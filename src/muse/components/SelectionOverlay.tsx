import type { ElementInfo } from '../sourceLocation'
import type { Rect } from '../useSelection'

export function SelectBanner() {
  return (
    <div className="pointer-events-none rounded-full bg-ink/95 px-4 py-2 text-sm font-medium text-zinc-200 shadow-lg ring-1 ring-white/10 backdrop-blur">
      Click any element to redesign it <span className="text-zinc-500">· Esc to cancel</span>
    </div>
  )
}

export function HoverHighlight({
  rect,
  cursor,
  info,
}: {
  rect: Rect
  cursor?: { x: number; y: number } | null
  info?: ElementInfo | null
}) {
  // Tooltip follows the cursor (to the right), like agentation — never covers the
  // element. Flip to the other side near the viewport edges.
  const OFFSET = 14
  const EST_W = 280
  const EST_H = 40
  let tipLeft = (cursor?.x ?? rect.left) + OFFSET
  let tipTop = (cursor?.y ?? rect.top) + OFFSET
  if (typeof window !== 'undefined' && cursor) {
    if (tipLeft + EST_W > window.innerWidth) tipLeft = cursor.x - OFFSET - EST_W
    if (tipTop + EST_H > window.innerHeight) tipTop = cursor.y - OFFSET - EST_H
    tipLeft = Math.max(4, tipLeft)
    tipTop = Math.max(4, tipTop)
  }

  return (
    <>
      {/* The highlight ring — glides between elements (on-screen movement -> ease-in-out). */}
      <div
        className="pointer-events-none absolute rounded-md bg-accent/10 ring-2 ring-accent transition-all duration-100 ease-in-out motion-reduce:transition-none"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      />
      {/* Devtools/agentation-style label, anchored to the cursor (no transition so it tracks crisply). */}
      {info && cursor && (
        <div
          className="pointer-events-none absolute z-10 max-w-[260px] rounded-md bg-ink/95 px-2 py-1 font-mono text-[10.5px] leading-snug shadow-lg ring-1 ring-white/10 backdrop-blur"
          style={{ top: tipTop, left: tipLeft }}
        >
          {info.crumbs.length > 0 && (
            <div className="text-zinc-500">{info.crumbs.map((c) => `<${c}>`).join(' ')}</div>
          )}
          <div className="truncate text-zinc-100">
            {info.tag}
            {info.text && <span className="text-zinc-500"> "{info.text}"</span>}
          </div>
        </div>
      )}
    </>
  )
}
