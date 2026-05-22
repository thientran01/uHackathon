export function MuseFab({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      data-testid="muse-fab"
      onClick={onToggle}
      className={`pointer-events-auto flex items-center gap-2 rounded-full bg-ink-soft px-5 py-3 text-sm font-medium text-zinc-100 shadow-xl shadow-black/30 ring-1 transition active:scale-[0.97] motion-reduce:active:scale-100 ${
        active ? 'ring-accent/60 hover:bg-ink' : 'ring-white/10 hover:bg-[#1f1f24]'
      }`}
    >
      <span className={`text-base leading-none ${active ? 'text-zinc-400' : 'text-accent'}`}>✦</span>
      {active ? 'Cancel' : 'Design with Muse'}
    </button>
  )
}
