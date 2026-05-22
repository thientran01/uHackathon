import { useState } from 'react'
import { PLAYERS, Player } from './data'
import { TweakValues } from './TweaksPanel'
import { IconFire } from './icons'
import { PlayerAvi, LeaderRow, FilterGroup } from './shared'

export default function LeaderboardPage({ t }: { t: TweakValues }) {
  const ranked = [...PLAYERS].sort((a, b) => b.elo - a.elo)
  const [season, setSeason] = useState('all')
  const [fmt,    setFmt]    = useState('combined')

  return (
    <div className="px-10 py-8 max-w-[1100px] mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--c-on-bg)]/40 mb-1">/leaderboard</div>
          <h1 className="font-[var(--font-display)] text-4xl font-bold text-[color:var(--c-on-bg)] tracking-tight">The Ladder</h1>
          <p className="text-sm text-[color:var(--c-on-bg)]/60 mt-1">ELO updates after every match. Top 3 get bragging rights at Saturday brunch.</p>
        </div>
        <FilterGroup value={season} onChange={setSeason} options={[
          { v: 'all', l: 'All-time' }, { v: 'month', l: 'Month' }, { v: 'week', l: 'Week' },
        ]} />
      </div>

      <div className="flex gap-2 mb-6">
        <FilterGroup value={fmt} onChange={setFmt} options={[
          { v: 'combined', l: 'Combined' }, { v: 'singles', l: 'Singles' }, { v: 'doubles', l: 'Doubles' },
        ]} />
      </div>

      {t.leaderLayout === 'podium' && <PodiumLayout ranked={ranked} />}
      {t.leaderLayout === 'cards'  && <CardLayout  ranked={ranked} />}
      {t.leaderLayout === 'table'  && <TableLayout  ranked={ranked} />}
      {!['podium','cards','table'].includes(t.leaderLayout) && <TableLayout ranked={ranked} />}

      <div className="h-10" />
    </div>
  )
}

function PodiumLayout({ ranked }: { ranked: Player[] }) {
  const [p1, p2, p3, ...rest] = ranked
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6 h-[360px]">
        <PodiumStep p={p2} rank={2} stepH={180} />
        <PodiumStep p={p1} rank={1} stepH={260} big />
        <PodiumStep p={p3} rank={3} stepH={140} />
      </div>
      <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden">
        {rest.map((p, i) => <LeaderRow key={p.id} rank={i + 4} p={p} />)}
      </div>
    </>
  )
}

function PodiumStep({ p, rank, stepH, big = false }: { p: Player; rank: number; stepH: number; big?: boolean }) {
  const MEDAL: Record<number, string> = { 1: 'var(--c-energy)', 2: '#e8e2d3', 3: '#e8a87c' }
  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex-1 flex flex-col items-center justify-end pb-3 min-h-0">
        <PlayerAvi p={p} size={big ? 64 : 52} />
        <div className="mt-2 text-center leading-tight px-1">
          <div className={`font-[var(--font-display)] font-bold ${big ? 'text-lg' : 'text-sm'} text-[color:var(--c-on-bg)] truncate max-w-[180px]`}>{p.name}</div>
          <div className="text-[11px] text-[color:var(--c-on-bg)]/50 font-mono">{p.elo} · {p.w}–{p.l}</div>
        </div>
      </div>
      <div className="w-full rounded-t-2xl flex items-start justify-center pt-3 relative overflow-hidden shrink-0"
           style={{ background: MEDAL[rank], height: stepH }}>
        <div className="absolute inset-0 bg-[image:var(--court-lines-bg)] opacity-20" />
        <div className={`font-[var(--font-display)] font-black ${big ? 'text-7xl' : 'text-5xl'} text-[#0f1f1a] relative leading-none`}>{rank}</div>
      </div>
    </div>
  )
}

function CardLayout({ ranked }: { ranked: Player[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ranked.map((p, i) => (
        <div key={p.id} className={`bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] p-4 ${i < 3 ? 'ring-2 ring-[color:var(--c-energy)]' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="font-mono text-[11px] text-[color:var(--c-muted)] font-semibold">#{i + 1}</div>
            <div className="font-mono font-bold text-2xl tabular-nums">{p.elo}</div>
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <PlayerAvi p={p} size={40} />
            <div className="leading-tight min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-[11px] text-[color:var(--c-muted)] font-mono">{p.w}W · {p.l}L</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-black/5 overflow-hidden">
            <div className="h-full bg-[color:var(--c-pop)]" style={{ width: `${Math.round(p.w / (p.w + p.l) * 100)}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-[color:var(--c-muted)] font-semibold">
            <span>{Math.round(p.w / (p.w + p.l) * 100)}% win rate</span>
            {p.streak >= 3 && <span className="text-[color:var(--c-pop)] flex items-center gap-0.5"><IconFire size={11} />×{p.streak}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function TableLayout({ ranked }: { ranked: Player[] }) {
  return (
    <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[color:var(--c-line)] grid grid-cols-[40px_1fr_70px_70px_70px_60px] gap-3 text-[10px] uppercase tracking-wider text-[color:var(--c-muted)] font-bold">
        <div className="text-center">#</div>
        <div>Player</div>
        <div className="text-right">W</div>
        <div className="text-right">L</div>
        <div className="text-right">Win%</div>
        <div className="text-right">ELO</div>
      </div>
      {ranked.map((p, i) => (
        <div key={p.id}
          className={`px-4 py-3 grid grid-cols-[40px_1fr_70px_70px_70px_60px] gap-3 items-center border-t border-[color:var(--c-line)] first:border-t-0 ${p.isMe ? 'bg-[color:var(--c-energy)]/20' : ''}`}>
          <div className="text-center font-mono font-semibold text-sm">
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
          </div>
          <div className="flex items-center gap-2.5 min-w-0">
            <PlayerAvi p={p} size={32} />
            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                {p.name}
                {p.isMe && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[color:var(--c-pop)] text-white">You</span>}
                {p.streak >= 3 && <IconFire size={12} className="text-[color:var(--c-pop)]" />}
              </div>
              <div className="text-[11px] text-[color:var(--c-muted)] font-mono">@{p.handle}</div>
            </div>
          </div>
          <div className="text-right font-mono text-sm">{p.w}</div>
          <div className="text-right font-mono text-sm text-[color:var(--c-muted)]">{p.l}</div>
          <div className="text-right font-mono text-sm">{Math.round(p.w / (p.w + p.l) * 100)}%</div>
          <div className="text-right font-mono font-bold tabular-nums">{p.elo}</div>
        </div>
      ))}
    </div>
  )
}
