// ============================================================
//  MUSE ENGINE  —  element introspection via React fibers
// ------------------------------------------------------------
//  In dev mode, @vitejs/plugin-react injects JSX source info, so every
//  React fiber carries `_debugSource` (fileName/lineNumber) and `_debugOwner`
//  (the component that rendered it). We read both straight off the DOM node's
//  fiber — no extra plugin needed. (React 18 behavior; React 19 drops it, which
//  is why we pin React 18.)
// ============================================================

export type SourceLocation = {
  fileName: string
  lineNumber: number
  columnNumber: number
}

// Tag + text snippet + a short component breadcrumb (agentation-style label).
export type ElementInfo = {
  tag: string
  text: string
  crumbs: string[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function getFiber(el: Element): any {
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
  return key ? (el as any)[key] : null
}

// Resolve a fiber `type` to a readable component name (handles host tags,
// function/class components, and wrappers like forwardRef / memo).
function componentName(type: any): string | null {
  if (!type) return null
  if (typeof type === 'string') return type
  if (typeof type === 'function') return type.displayName || type.name || null
  if (typeof type === 'object') {
    return type.displayName || componentName(type.type) || componentName(type.render) || null
  }
  return null
}

export function getSourceLocation(el: Element | null): SourceLocation | null {
  if (!el) return null
  let fiber = getFiber(el)
  while (fiber) {
    if (fiber._debugSource) {
      const { fileName, lineNumber, columnNumber } = fiber._debugSource
      return { fileName, lineNumber, columnNumber: columnNumber ?? 0 }
    }
    fiber = fiber._debugOwner ?? fiber.return
  }
  return null
}

export function getElementInfo(el: Element | null): ElementInfo | null {
  if (!el) return null
  const tag = el.tagName.toLowerCase()
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 36)

  // Walk the owner chain for the components that rendered this element.
  const crumbs: string[] = []
  let owner = getFiber(el)?._debugOwner
  let guard = 0
  while (owner && crumbs.length < 2 && guard++ < 40) {
    const name = componentName(owner.type ?? owner.elementType)
    if (name && /^[A-Z]/.test(name)) crumbs.unshift(name) // keep component (capitalized) names
    owner = owner._debugOwner
  }

  return { tag, text, crumbs }
}
