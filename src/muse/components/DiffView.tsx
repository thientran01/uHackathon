import { collapseContext, diffLines } from '../diff'

export function DiffView({ original, newContent }: { original: string; newContent: string }) {
  const lines = collapseContext(diffLines(original, newContent))
  return (
    <div className="overflow-x-auto rounded-xl bg-black/40 p-3 font-mono text-[11px] leading-relaxed ring-1 ring-white/10">
      {lines.map((l, i) => (
        <div
          key={i}
          className={
            l.type === 'add'
              ? '-mx-3 bg-emerald-500/10 px-3 text-emerald-300/90'
              : l.type === 'del'
                ? '-mx-3 bg-rose-500/10 px-3 text-rose-300/90'
                : 'text-zinc-600'
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
