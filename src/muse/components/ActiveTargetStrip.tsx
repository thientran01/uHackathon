import { X } from '@phosphor-icons/react'
import type { SelectedElement } from '../types'

const fileOf = (e: SelectedElement) => (e.fileName ? e.fileName.split(/[\\/]/).pop() : null)

// The thin strip above the thread that tells you which element(s) Muse is
// currently pointed at. Without target tabs, this is the only persistent
// indicator of focus — keep it readable.
export function ActiveTargetStrip({
  elements,
  mock,
  onRemove,
}: {
  elements: SelectedElement[]
  mock: boolean
  onRemove?: (key: string) => void
}) {
  const single = elements.length === 1 ? elements[0] : null

  return (
    <div className="border-y border-line/[0.07] bg-line/[0.02] px-4 py-2 text-xs text-fg-faint">
      {single ? (
        <div className="flex items-center gap-2">
          <span className="rounded bg-line/5 px-1.5 py-0.5 font-mono text-fg ring-1 ring-line/10">
            &lt;{single.tag}&gt;
          </span>
          {fileOf(single) ? (
            <span className="truncate font-mono">
              {fileOf(single)}:{single.line}
            </span>
          ) : !mock ? (
            <span className="text-amber-300/80">source not found</span>
          ) : null}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="font-medium text-fg-muted">Editing {elements.length} elements</div>
          <div className="flex flex-wrap gap-1.5">
            {elements.map((el) => (
              <span
                key={el.key}
                title={`${fileOf(el)}:${el.line}`}
                className="inline-flex items-center gap-1 rounded bg-line/5 px-1.5 py-0.5 font-mono text-fg ring-1 ring-line/10"
              >
                &lt;{el.tag}&gt;
                {onRemove && (
                  <button
                    onClick={() => onRemove(el.key)}
                    aria-label={`Remove ${el.tag}`}
                    className="inline-flex text-fg-faint transition hover:text-fg"
                  >
                    <X size={11} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
