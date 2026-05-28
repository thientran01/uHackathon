import { useCallback, useEffect, useRef, useState } from 'react'
import { getElementInfo, getSourceLocation, type ElementInfo } from './sourceLocation'
import type { SelectedElement } from './types'

export type Rect = { top: number; left: number; width: number; height: number }

function isMuseUI(el: Element | null): boolean {
  return !!el && !!el.closest('[data-muse-ui]')
}

function toSelected(el: Element): SelectedElement {
  const loc = getSourceLocation(el)
  const tag = el.tagName.toLowerCase()
  const fileName = loc?.fileName ?? ''
  const line = loc?.lineNumber ?? 0
  return {
    fileName,
    line,
    tag,
    classNames: el.getAttribute('class') ?? '',
    text: (el.textContent ?? '').trim().slice(0, 80),
    key: `${fileName}:${line}:${loc?.columnNumber ?? 0}:${tag}`,
    node: el,
  }
}

/**
 * Drives "select mode": hover highlights elements; a plain click selects one
 * (fast path), shift-click adds/removes elements to build a batch. Resolves
 * each element back to its source file/line. Ignores the Muse UI itself.
 */
export function useSelection() {
  const [active, setActive] = useState(false)
  const [hoverRect, setHoverRect] = useState<Rect | null>(null)
  const [hoverInfo, setHoverInfo] = useState<ElementInfo | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [selection, setSelection] = useState<SelectedElement[]>([])
  // Snapshot of the selection at the moment select-mode was entered, so Esc
  // can restore it (mid-conversation "swap target" flow: user re-enters select
  // mode to pick a different element, then Esc to bail without losing thread).
  const entrySelectionRef = useRef<SelectedElement[]>([])

  const clearSelection = useCallback(() => setSelection([]), [])

  useEffect(() => {
    if (!active) {
      setHoverRect(null)
      setHoverInfo(null)
      setCursor(null)
      return
    }

    // Capture what we had when entering select mode.
    entrySelectionRef.current = selection

    const onMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY })
      const el = e.target as Element | null
      if (!el || isMuseUI(el)) {
        setHoverRect(null)
        setHoverInfo(null)
        return
      }
      const r = el.getBoundingClientRect()
      setHoverRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      setHoverInfo(getElementInfo(el))
    }

    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el || isMuseUI(el)) return
      e.preventDefault()
      e.stopPropagation()
      const picked = toSelected(el)

      if (e.shiftKey) {
        // Build a batch — only add elements we can actually edit. Stay in select mode.
        if (!picked.fileName) return
        setSelection((prev) =>
          prev.some((p) => p.key === picked.key)
            ? prev.filter((p) => p.key !== picked.key) // toggle off
            : [...prev, picked],
        )
        return
      }

      // Plain click — single fast path. Commit immediately.
      setSelection([picked])
      setActive(false)
      setHoverRect(null)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActive(false)
        // Restore the pre-select-mode selection. If we entered with nothing
        // (the FAB flow), this restores empty. If we entered with a target
        // already selected (the swap flow), this preserves it.
        setSelection(entrySelectionRef.current)
      }
    }

    document.body.classList.add('muse-selecting')
    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.body.classList.remove('muse-selecting')
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [active])

  return {
    active,
    setActive,
    hoverRect,
    hoverInfo,
    cursor,
    selection,
    setSelection,
    clearSelection,
  }
}
