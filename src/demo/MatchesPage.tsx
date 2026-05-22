import { useState } from 'react'
import { MATCHES, PLAYERS, Match, Player, byId } from './data'
import { TweakValues } from './TweaksPanel'
import { IconPlus, IconArrowR, IconCheck, IconTrophy } from './icons'
import { PlayerAvi, FilterGroup, Backdrop } from './shared'

export default function MatchesPage({ t, logOpen, setLogOpen }: {
  t: TweakValues; logOpen: boolean; setLogOpen: (v: boolean) => void
}) {
  const [filter, setFilter] = useState('all')
  const [tag,    setTag]    = useState('all')

  const filtered = MATCHES.filter(m => {
    if (filter === 'singles' && m.format !== 'singles') return false
    if (filter === 'doubles' && m.format !== 'doubles') return false
    if (filter === 'mine'    && ![...m.teamA, ...m.teamB].includes('p12')) return false
    if (tag !== 'all' && m.tag !== tag) return false
    return true
  })

  return (
    <div className="px-10 py-8 max-w-[1100px] mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--c-on-bg)]/40 mb-1">/matches</div>
          <h1 className="font-[var(--font-display)] text-4xl font-bold text-[color:var(--c-on-bg)] tracking-tight">Match log</h1>
          <p className="text-sm text-[color:var(--c-on-bg)]/60 mt-1">Every dink, drive, and drop — recorded. ELO updates within seconds.</p>
        </div>
        <button onClick={() => setLogOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm whitespace-nowrap bg-[color:var(--c-energy)] text-[#0f1f1a]">
          <IconPlus size={16} stroke={2.5} /> Log a match
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterGroup value={filter} onChange={setFilter} options={[
          { v: 'all', l: 'All' }, { v: 'singles', l: 'Singles' },
          { v: 'doubles', l: 'Doubles' }, { v: 'mine', l: 'My matches' },
        ]} />
        <span className="w-px h-5 bg-[color:var(--c-rail-line)] mx-1" />
        <FilterGroup value={tag} onChange={setTag} options={[
          { v: 'all', l: 'Any' }, { v: 'organized', l: 'Organized' }, { v: 'drop-in', l: 'Drop-in' },
        ]} />
        <span className="ml-auto text-xs text-[color:var(--c-on-bg)]/40 font-mono">{filtered.length} matches</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map(m => <MatchCardFull key={m.id} m={m} variant={t.matchCard} />)}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[color:var(--c-on-bg)]/40 text-sm">Nothing here. Loosen up the filters.</div>
        )}
      </div>

      {logOpen && <LogMatchDialog onClose={() => setLogOpen(false)} />}
    </div>
  )
}

function MatchCardFull({ m, variant = 'standard' }: { m: Match; variant?: string }) {
  const aPlayers = m.teamA.map(id => byId(id)!)
  const bPlayers = m.teamB.map(id => byId(id)!)
  const aWon = m.result === 'A'

  return (
    <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden">
      <div className="p-4 flex items-stretch gap-3 min-w-0">
        <div className="w-[92px] shrink-0 flex flex-col border-r border-[color:var(--c-line)] pr-3">
          <div className={`inline-flex items-center text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full w-fit ${m.tag === 'organized' ? 'bg-[#0f1f1a] text-[color:var(--c-energy)]' : 'bg-[color:var(--c-pop)]/15 text-[color:var(--c-pop)]'}`}>
            {m.tag}
          </div>
          <div className="font-mono text-[11px] text-[color:var(--c-muted)] mt-2">{m.when}</div>
          <div className="font-[var(--font-display)] text-sm font-semibold mt-0.5 capitalize">{m.format}</div>
          <div className="text-[11px] text-[color:var(--c-muted)] mt-auto truncate">{m.court}</div>
        </div>
        <div className="flex-1 min-w-0 flex items-stretch gap-2">
          <TeamBlock players={aPlayers} won={aWon} deltas={m.eloDelta.slice(0, aPlayers.length)} />
          <div className="flex flex-col items-center justify-center px-1 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-[color:var(--c-muted)] font-bold">Final</div>
            <div className="font-mono font-bold text-base leading-tight whitespace-nowrap mt-0.5">{m.score}</div>
          </div>
          <TeamBlock players={bPlayers} won={!aWon} deltas={m.eloDelta.slice(aPlayers.length)} reverse />
        </div>
      </div>
    </div>
  )
}

function TeamBlock({ players, won, deltas, reverse = false }: { players: Player[]; won: boolean; deltas: number[]; reverse?: boolean }) {
  return (
    <div className={`flex-1 min-w-0 rounded-xl px-2.5 py-2 ${won ? 'bg-[color:var(--c-energy)]/15' : 'bg-black/[0.02]'} flex items-center gap-2.5 ${reverse ? 'flex-row-reverse text-right' : ''}`}>
      <div className={`flex ${reverse ? '-space-x-2 flex-row-reverse' : '-space-x-2'} shrink-0`}>
        {players.map(p => <PlayerAvi key={p.id} p={p} size={32} />)}
      </div>
      <div className="leading-tight flex-1 min-w-0">
        {players.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-1.5 text-sm font-semibold mb-0.5 last:mb-0 min-w-0 ${reverse ? 'justify-end' : ''}`}>
            <span className="truncate">{p.name}</span>
            <span className={`font-mono text-[11px] shrink-0 ${deltas[i] > 0 ? 'text-emerald-700' : 'text-[color:var(--c-pop)]'}`}>
              {deltas[i] > 0 ? '+' : ''}{deltas[i]}
            </span>
          </div>
        ))}
        {won && (
          <div className={`text-[10px] uppercase tracking-wider font-bold text-[#0f1f1a] mt-0.5 inline-flex items-center gap-1 ${reverse ? 'justify-end w-full' : ''}`}>
            <IconTrophy size={11} /> Winner
          </div>
        )}
      </div>
    </div>
  )
}

function LogMatchDialog({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState('doubles')
  const [a1, setA1] = useState('p12')
  const [a2, setA2] = useState('p06')
  const [b1, setB1] = useState('p07')
  const [b2, setB2] = useState('p10')
  const [scoreA, setScoreA] = useState('11')
  const [scoreB, setScoreB] = useState('7')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <Backdrop onClose={onClose}>
        <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] p-8 max-w-[440px] w-full text-center">
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-[color:var(--c-energy)]">
            <IconCheck size={32} stroke={2.5} className="text-[#0f1f1a]" />
          </div>
          <h3 className="font-[var(--font-display)] text-2xl font-bold mt-4">Match logged!</h3>
          <p className="text-sm text-[color:var(--c-muted)] mt-1">ELO will sync to the ladder in a few seconds.</p>
          <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-full font-semibold text-sm bg-[color:var(--c-ink)] text-[color:var(--c-card)]">Done</button>
        </div>
      </Backdrop>
    )
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] p-7 max-w-[520px] w-full">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-[var(--font-display)] text-2xl font-bold">Log a match</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/10 text-[color:var(--c-muted)]">✕</button>
        </div>
        <p className="text-sm text-[color:var(--c-muted)] mb-5">Final score only — best of 3, first to 11, win by 2.</p>
        <div className="flex rounded-full bg-black/5 p-1 mb-5">
          {['singles','doubles'].map(f => (
            <button key={f} onClick={() => setFormat(f)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${format === f ? 'bg-[color:var(--c-ink)] text-[color:var(--c-card)]' : 'text-[color:var(--c-muted)]'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[color:var(--c-muted)]">Team A</label>
            <PlayerSelect value={a1} onChange={setA1} />
            {format === 'doubles' && <PlayerSelect value={a2} onChange={setA2} />}
            <ScoreBox value={scoreA} onChange={setScoreA} />
          </div>
          <div className="pt-7 text-[color:var(--c-muted)] font-[var(--font-display)] font-bold text-2xl text-center">vs</div>
          <div>
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[color:var(--c-muted)]">Team B</label>
            <PlayerSelect value={b1} onChange={setB1} />
            {format === 'doubles' && <PlayerSelect value={b2} onChange={setB2} />}
            <ScoreBox value={scoreB} onChange={setScoreB} />
          </div>
        </div>
        <button onClick={() => setSubmitted(true)}
          className="mt-5 w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 bg-[color:var(--c-energy)] text-[#0f1f1a]">
          Save match <IconArrowR size={16} />
        </button>
      </div>
    </Backdrop>
  )
}

function PlayerSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-[color:var(--c-line)] bg-white/60 font-medium text-sm focus:outline-none focus:border-[color:var(--c-ink)]">
      {PLAYERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  )
}

function ScoreBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 2))}
      className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[color:var(--c-line)] bg-white/60 font-mono font-bold text-center text-xl focus:outline-none focus:border-[color:var(--c-ink)]"
      placeholder="11" />
  )
}
