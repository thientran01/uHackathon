import { ArrowRight } from '@phosphor-icons/react'
import type { SelectedElement } from '../../types'

const fileOf = (e: SelectedElement) => (e.fileName ? e.fileName.split(/[\\/]/).pop() : null)

// Visual separator that appears in the thread when the user selects a
// different element mid-conversation. The thread is one continuous timeline;
// this just marks where the focus shifted.
export function MessageTargetHandoff({ target }: { target: SelectedElement }) {
  const file = fileOf(target)
  return (
    <div className="flex items-center gap-2 py-1 text-[11px] text-fg-faint">
      <div className="h-px flex-1 bg-line/10" />
      <ArrowRight size={11} weight="bold" className="shrink-0" />
      <span className="shrink-0">
        now looking at{' '}
        <span className="rounded bg-line/5 px-1 py-px font-mono text-fg-muted ring-1 ring-line/10">
          &lt;{target.tag}&gt;
        </span>
        {file && <span className="ml-1 font-mono">{file}:{target.line}</span>}
      </span>
      <div className="h-px flex-1 bg-line/10" />
    </div>
  )
}
