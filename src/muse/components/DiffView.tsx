import { collapseContext, diffLines } from '../diff'

export function DiffView({ original, newContent }: { original: string; newContent: string }) {
  const lines = collapseContext(diffLines(original, newContent))
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-soft p-3 font-mono text-[11px] leading-relaxed ring-1 ring-line/10">
      {lines.map((l, i) => (
        <div
          key={i}
          className={
            l.type === 'add'
              ? '-mx-3 bg-diff-add/15 px-3 text-diff-add-text'
              : l.type === 'del'
                ? '-mx-3 bg-diff-del/15 px-3 text-diff-del-text'
                : 'text-fg-faint'
          }
        >
          <span className="select-none opacity-50">
            {l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  '}
          </span>
          {l.text}
        </div>
      ))}
    </div>
  )
}
