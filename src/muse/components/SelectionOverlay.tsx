import type { ElementInfo } from '../sourceLocation'
import type { Rect } from '../useSelection'

export function SelectBanner() {
  return (
    <div className="pointer-events-none rounded-full bg-ink/95 px-4 py-2 text-sm font-medium text-zinc-200 shadow-lg ring-1 ring-white/10 backdrop-blur">
      Click any element to redesign it <span className="text-zinc-500">· Esc to cancel</span>
    </div>
  )
}

export function HoverHighlight({ rect, info }: { rect: Rect; info?: ElementInfo | null }) {
  const move = 'transition-all duration-100 ease-in-out motion-reduce:transition-none'
  return (
    <>
      {/* The highlight ring — glides between elements (on-screen movement -> ease-in-out). */}
      <div
        className={`pointer-events-none absolute rounded-md bg-accent/10 ring-2 ring-accent ${move}`}
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      />
      {/* Devtools/agentation-style label: component breadcrumb + tag "text". */}
      {info && (
        <div
          className={`pointer-events-none absolute z-10 max-w-[260px] rounded-md bg-ink/95 px-2 py-1 font-mono text-[10.5px] leading-snug shadow-lg ring-1 ring-white/10 backdrop-blur ${move}`}
          style={{ top: rect.top + 4, left: rect.left + 4 }}
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
