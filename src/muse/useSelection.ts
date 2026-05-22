import { useCallback, useEffect, useState } from 'react'
import { getSourceLocation } from './sourceLocation'
import type { SelectedElement } from './types'

export type Rect = { top: number; left: number; width: number; height: number }

function isMuseUI(el: Element | null): boolean {
  return !!el && !!el.closest('[data-muse-ui]')
}

function describe(el: Element): Omit<SelectedElement, 'fileName' | 'line'> {
  return {
    tag: el.tagName.toLowerCase(),
    classNames: el.getAttribute('class') ?? '',
    text: (el.textContent ?? '').trim().slice(0, 80),
  }
}

/**
 * Drives "select mode": hover highlights elements, a click captures one and
 * resolves it back to its source file/line. Ignores the Muse UI itself.
 */
export function useSelection() {
  const [active, setActive] = useState(false)
  const [hoverRect, setHoverRect] = useState<Rect | null>(null)
  const [selected, setSelected] = useState<SelectedElement | null>(null)

  const clearSelected = useCallback(() => setSelected(null), [])

  useEffect(() => {
    if (!active) {
      setHoverRect(null)
      return
    }

    const onMove = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el || isMuseUI(el)) {
        setHoverRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setHoverRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el || isMuseUI(el)) return
      // Hijack this click for selection.
      e.preventDefault()
      e.stopPropagation()

      const loc = getSourceLocation(el)
      setSelected({
        fileName: loc?.fileName ?? '',
        line: loc?.lineNumber ?? 0,
        ...describe(el),
      })
      setActive(false)
      setHoverRect(null)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(false)
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

  return { active, setActive, hoverRect, selected, setSelected, clearSelected }
}
