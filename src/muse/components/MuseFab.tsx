export function MuseFab({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      data-testid="muse-fab"
      onClick={onToggle}
      className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl ring-1 transition active:scale-[0.97] motion-reduce:active:scale-100 ${
        active
          ? 'bg-slate-900 text-white ring-black/10'
          : 'bg-violet-600 text-white ring-violet-700/30 hover:bg-violet-500'
      }`}
    >
      <span className="text-base leading-none">✦</span>
      {active ? 'Cancel' : 'Design with Muse'}
    </button>
  )
}
