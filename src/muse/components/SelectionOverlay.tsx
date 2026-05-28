import { useEffect, useReducer } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import type { ElementInfo } from '../sourceLocation'
import type { SelectedElement } from '../types'
import type { Rect } from '../useSelection'

export function SelectBanner() {
  return (
    <div className="pointer-events-none rounded-full bg-surface/95 px-4 py-2 text-sm font-medium text-fg shadow-lg ring-1 ring-line/10 backdrop-blur">
      Click to select{' '}
      <span className="text-fg-faint">· ⇧ Shift-click to add several · Esc to cancel</span>
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
      <div
        className="pointer-events-none absolute rounded-md bg-accent/10 ring-2 ring-accent transition-all duration-100 ease-in-out motion-reduce:transition-none"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      />
      {info && cursor && (
        <div
          className="pointer-events-none absolute z-10 max-w-[260px] rounded-md bg-surface/95 px-2 py-1 font-mono text-[10.5px] leading-snug shadow-lg ring-1 ring-line/10 backdrop-blur"
          style={{ top: tipTop, left: tipLeft }}
        >
          {info.crumbs.length > 0 && (
            <div className="text-fg-faint">{info.crumbs.map((c) => `<${c}>`).join(' ')}</div>
          )}
          <div className="truncate text-fg">
            {info.tag}
            {info.text && <span className="text-fg-faint"> "{info.text}"</span>}
          </div>
        </div>
      )}
    </>
  )
}

// Persistent outline + numbered badge on each selected element. Re-measures on
// scroll/resize so the markers track the live layout.
export function SelectionMarkers({ elements }: { elements: SelectedElement[] }) {
  const [, force] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    const on = () => force()
    window.addEventListener('scroll', on, true)
    window.addEventListener('resize', on)

    // Re-measure whenever a selected element changes size (e.g. after HMR applies an edit).
    const ro = new ResizeObserver(() => force())
    elements.forEach((el) => { if (el.node?.isConnected) ro.observe(el.node) })

    return () => {
      window.removeEventListener('scroll', on, true)
      window.removeEventListener('resize', on)
      ro.disconnect()
    }
  }, [elements])

  return (
    <>
      {elements.map((el, i) => {
        if (!el.node || !el.node.isConnected) return null // skip detached nodes (e.g. after HMR)
        const r = el.node.getBoundingClientRect()
        return (
          <div key={el.key} className="pointer-events-none">
            <div
              className="absolute rounded-md ring-2 ring-accent"
              style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
            />
            <div
              className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white shadow-md ring-2 ring-surface"
              style={{ top: r.top - 9, left: r.left - 9 }}
            >
              {i + 1}
            </div>
          </div>
        )
      })}
    </>
  )
}

// Floating tray shown while building a batch — commit with the button or Enter.
export function SelectionTray({ count, onDesign }: { count: number; onDesign: () => void }) {
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-surface/95 py-2 pl-4 pr-2 text-sm shadow-xl ring-1 ring-line/10 backdrop-blur">
      <span className="text-fg">
        {count} element{count === 1 ? '' : 's'} selected
      </span>
      <button
        data-testid="muse-design-batch"
        onClick={onDesign}
        className="inline-flex items-center gap-1 rounded-full bg-fg px-4 py-1.5 font-semibold text-surface transition hover:bg-fg/90 active:scale-[0.97] motion-reduce:active:scale-100"
      >
        Design <ArrowRight size={14} weight="bold" />
      </button>
    </div>
  )
}
