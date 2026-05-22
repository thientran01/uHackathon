// ============================================================
//  MUSE ENGINE  —  Thien's piece
// ------------------------------------------------------------
//  Element -> source-file mapping (the "hard bit" from the plan).
//
//  In dev mode, @vitejs/plugin-react injects JSX source info, so every
//  React fiber carries `_debugSource` = { fileName, lineNumber,
//  columnNumber }. We read it straight off the clicked DOM node's fiber
//  — no extra plugin needed. (This is React 18 behavior; we pin React 18
//  specifically so this stays available. React 19 drops it.)
//
//  Fallback if this ever proves flaky: hand-tag the ~6 demo-critical
//  elements with data-source="relative/path.tsx:line" and read that attr.
// ============================================================

export type SourceLocation = {
  fileName: string
  lineNumber: number
  columnNumber: number
}

export function getSourceLocation(el: Element | null): SourceLocation | null {
  if (!el) return null

  // React stores the fiber under a key like "__reactFiber$<random>".
  const fiberKey = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
  if (!fiberKey) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fiber: any = (el as any)[fiberKey]

  // Walk up the fiber tree until we find one with debug source info.
  while (fiber) {
    if (fiber._debugSource) {
      const { fileName, lineNumber, columnNumber } = fiber._debugSource
      return { fileName, lineNumber, columnNumber: columnNumber ?? 0 }
    }
    fiber = fiber._debugOwner ?? fiber.return
  }

  return null
}
