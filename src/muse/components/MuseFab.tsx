import { UfoIcon } from './UfoIcon'

export function MuseFab({ active, loading = false, onToggle }: { active: boolean; loading?: boolean; onToggle: () => void }) {
  return (
    <button
      data-testid="muse-fab"
      onClick={onToggle}
      className={`pointer-events-auto flex items-center gap-2 rounded-full bg-surface-soft px-5 py-3 text-sm font-medium text-fg shadow-xl shadow-black/30 ring-1 transition active:scale-[0.97] motion-reduce:active:scale-100 ${
        active ? 'ring-accent/60 hover:bg-surface' : 'ring-line/10 hover:bg-surface-raised'
      }`}
    >
      <UfoIcon size={18} loading={loading} className={active ? 'text-fg-muted' : 'text-accent'} />
      {active ? 'Cancel' : 'Design with Muse'}
    </button>
  )
}
