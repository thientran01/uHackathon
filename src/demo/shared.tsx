import { Player } from './data'
import { IconFire } from './icons'

// ── PlayerAvi ──────────────────────────────────────────────────────────────
const COLORS = ['#ff6b35','#d4ff3a','#1a2e26','#6b7670','#0f1f1a','#e8a87c','#4a7c59','#3b82f6']

export function PlayerAvi({ p, offset = false, size = 32 }: { p?: Player; offset?: boolean; size?: number }) {
  const idx = (p?.id || 'p').charCodeAt(1) % COLORS.length
  const bg = COLORS[idx]
  const hex = bg.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const lum = (r * 299 + g * 587 + b * 114) / 1000
  const fg = lum > 150 ? '#0f1f1a' : '#ffffff'
  return (
    <div className={`rounded-full flex items-center justify-center shrink-0 ${offset ? '-ml-2 ring-2 ring-[color:var(--c-card)]' : ''}`}
         style={{ width: size, height: size, background: bg }}>
      <span className="font-[var(--font-display)] font-bold text-xs" style={{ color: fg }}>{p?.name?.[0] || '?'}</span>
    </div>
  )
}

// ── LeaderRow ──────────────────────────────────────────────────────────────
export function LeaderRow({ rank, p, compact = false }: { rank: number; p: Player; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'px-3.5 py-2.5' : 'px-4 py-3'} ${rank !== 1 ? 'border-t border-[color:var(--c-line)]' : ''}`}>
      <div className="w-6 text-center font-mono text-sm font-semibold text-[color:var(--c-muted)]">{rank}</div>
      <PlayerAvi p={p} size={28} />
      <div className="flex-1 min-w-0 leading-tight">
        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
          {p.name}
          {p.isMe && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[color:var(--c-pop)] text-white">You</span>}
        </div>
        <div className="text-[11px] text-[color:var(--c-muted)] font-mono">{p.w}–{p.l}</div>
      </div>
      <div className="font-mono font-bold text-sm tabular-nums">{p.elo}</div>
    </div>
  )
}

// ── FilterGroup ────────────────────────────────────────────────────────────
export function FilterGroup({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { v: string; l: string }[]
}) {
  return (
    <div className="inline-flex p-0.5 rounded-full bg-[color:var(--c-rail-line)] border border-[color:var(--c-rail-line)]">
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${value === o.v ? 'bg-[color:var(--c-energy)] text-[#0f1f1a]' : 'text-[color:var(--c-on-bg-muted)] hover:text-[color:var(--c-on-bg)]'}`}>
          {o.l}
        </button>
      ))}
    </div>
  )
}

// ── Backdrop ───────────────────────────────────────────────────────────────
export function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

// ── PotwCard ───────────────────────────────────────────────────────────────
export function PotwCard({ p }: { p: Player }) {
  return (
    <div className="mt-3 rounded-[var(--r-card)] overflow-hidden relative bg-[color:var(--c-surface)]">
      <div className="absolute inset-0 bg-[image:var(--dotted-grid-bg)] bg-[size:18px_18px] opacity-40 pointer-events-none" />
      <div className="relative p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[color:var(--c-pop)]">
          <span className="font-[var(--font-display)] font-bold text-white text-lg">{p.name[0]}</span>
        </div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--c-energy)] flex items-center gap-1">
            <IconFire size={12} /> Player of the week
          </div>
          <div className="font-[var(--font-display)] text-base font-bold text-[color:var(--c-on-bg)] mt-0.5">{p.name}</div>
          <div className="text-[11px] text-[color:var(--c-on-bg)]/60 font-mono">+47 ELO · 6-0 this week</div>
        </div>
      </div>
    </div>
  )
}
