import { PLAYERS, MATCHES, FEED, SCHEDULE, Match, Player, FeedItem } from './data'
import { byId } from './data'
import { TweakValues } from './TweaksPanel'
import { IconFire, IconSwords, IconTrophy, IconPlus, IconCalendar, Pball } from './icons'
import { PlayerAvi, LeaderRow, PotwCard } from './shared'

export default function HomePage({ me, t, onRoute, onLogMatch }: {
  me: Partial<Player>
  t: TweakValues
  onRoute: (r: string) => void
  onLogMatch: () => void
}) {
  const top    = [...PLAYERS].sort((a, b) => b.elo - a.elo).slice(0, 5)
  const next   = SCHEDULE[0]
  const potw   = PLAYERS[0]
  const streaks = PLAYERS.filter(p => p.streak >= 3).sort((a, b) => b.streak - a.streak).slice(0, 4)

  return (
    <div className="px-10 py-8 max-w-[1100px] mx-auto">
      <HomeHero me={me} next={next} onRoute={onRoute} onLogMatch={onLogMatch} />

      <section className="mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-[var(--font-display)] text-lg font-bold text-[color:var(--c-on-bg)] flex items-center gap-2">
            <IconFire size={18} className="text-[color:var(--c-pop)]" /> On fire
          </h2>
          <div className="text-[11px] uppercase tracking-wider text-[color:var(--c-on-bg)]/40">3+ wins in a row</div>
        </div>
        <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
          {streaks.map(p => <StreakChip key={p.id} p={p} />)}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-3 gap-5">
        <section className="col-span-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-[var(--font-display)] text-lg font-bold text-[color:var(--c-on-bg)] flex items-center gap-2">
              <IconSwords size={18} /> Recent matches
            </h2>
            <button onClick={() => onRoute('matches')} className="text-xs font-semibold text-[color:var(--c-on-bg)]/60 hover:text-[color:var(--c-on-bg)]">
              All matches →
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {MATCHES.slice(0, 4).map(m => <MatchRow key={m.id} m={m} variant={t.matchCard} />)}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-[var(--font-display)] text-lg font-bold text-[color:var(--c-on-bg)] flex items-center gap-2">
              <IconTrophy size={18} /> Leaderboard
            </h2>
            <button onClick={() => onRoute('leader')} className="text-xs font-semibold text-[color:var(--c-on-bg)]/60 hover:text-[color:var(--c-on-bg)]">
              Full →
            </button>
          </div>
          <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden">
            {top.map((p, i) => <LeaderRow key={p.id} rank={i + 1} p={p} compact />)}
          </div>
          <PotwCard p={potw} />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="font-[var(--font-display)] text-lg font-bold text-[color:var(--c-on-bg)] mb-3">Activity</h2>
        <div className="rounded-2xl border border-[color:var(--c-rail-line)] divide-y divide-[color:var(--c-rail-line)]">
          {FEED.map(f => <FeedRow key={f.id} f={f} />)}
        </div>
      </section>

      <div className="h-10" />
    </div>
  )
}

function HomeHero({ me, next, onRoute, onLogMatch }: {
  me: Partial<Player>; next: typeof SCHEDULE[0]
  onRoute: (r: string) => void; onLogMatch: () => void
}) {
  return (
    <div className="rounded-[var(--r-card)] overflow-hidden relative bg-[color:var(--c-energy)]">
      <div className="absolute inset-0 bg-[image:var(--court-lines-bg)] opacity-30 pointer-events-none" />
      <div className="absolute -right-10 -top-10 opacity-90 pointer-events-none">
        <Pball size={260} body="#0f1f1a" hole="#d4ff3a" spin />
      </div>
      <div className="relative p-8 pr-[280px]">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#0f1f1a]/60 mb-2">Good evening, {(me.name || 'player').split(' ')[0]}</div>
        <h1 className="font-[var(--font-display)] text-[56px] leading-[0.95] font-extrabold text-[#0f1f1a] tracking-tight">
          Rikkleball.
        </h1>
        <div className="mt-2 font-[var(--font-display)] text-xl font-medium text-[#0f1f1a]/80">
          38 paddles · 4 courts · one ladder.
        </div>
        <div className="mt-5 flex gap-2.5 flex-wrap">
          <button onClick={onLogMatch}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#0f1f1a] text-[color:var(--c-energy)] font-semibold text-sm hover:bg-black transition-colors">
            <IconPlus size={16} stroke={2.5} /> Log a match
          </button>
          <button onClick={() => onRoute('sched')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#0f1f1a]/10 hover:bg-[#0f1f1a]/15 text-[#0f1f1a] font-semibold text-sm">
            <IconCalendar size={16} /> {next.day} · {next.time.split('–')[0]}
          </button>
        </div>
      </div>
    </div>
  )
}

function StreakChip({ p }: { p: Player }) {
  return (
    <div className="shrink-0 px-3 py-2.5 rounded-2xl bg-[color:var(--c-rail-line)] border border-[color:var(--c-rail-line)] flex items-center gap-2.5 min-w-[180px]">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 bg-[color:var(--c-pop)]">
        <span className="font-[var(--font-display)] font-bold text-white text-sm">{p.name[0]}</span>
      </div>
      <div className="leading-tight min-w-0 flex-1">
        <div className="text-sm font-semibold text-[color:var(--c-on-bg)] truncate">{p.name}</div>
        <div className="text-[11px] text-[color:var(--c-on-bg)]/50 font-mono">+{p.streak} wins</div>
      </div>
      <IconFire size={16} className="text-[color:var(--c-pop)]" />
    </div>
  )
}

export function MatchRow({ m, variant = 'standard' }: { m: Match; variant?: string }) {
  const aPlayers = m.teamA.map(id => byId(id)!)
  const bPlayers = m.teamB.map(id => byId(id)!)
  const aWon = m.result === 'A'

  if (variant === 'minimal') {
    return (
      <div className="px-4 py-3 bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] flex items-center gap-4 text-sm">
        <span className="text-[11px] uppercase tracking-wider text-[color:var(--c-muted)] font-mono w-16 shrink-0">{m.when}</span>
        <span className={`font-medium flex-1 truncate ${aWon ? '' : 'text-[color:var(--c-muted)]'}`}>{aPlayers.map(p => p.name).join(' & ')}</span>
        <span className="text-[color:var(--c-muted)] font-mono text-xs shrink-0">vs</span>
        <span className={`font-medium flex-1 truncate text-right ${!aWon ? '' : 'text-[color:var(--c-muted)]'}`}>{bPlayers.map(p => p.name).join(' & ')}</span>
        <span className="font-mono font-semibold shrink-0 ml-3">{m.score.split(',')[0]}</span>
      </div>
    )
  }

  if (variant === 'split') {
    return (
      <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden flex items-stretch">
        <SideBlock players={aPlayers} won={aWon} align="left" />
        <div className="w-px bg-[color:var(--c-line)]" />
        <SideBlock players={bPlayers} won={!aWon} align="right" />
        <div className="px-5 flex flex-col items-end justify-center bg-black/5">
          <div className="text-[10px] uppercase tracking-wider text-[color:var(--c-muted)]">{m.format} · {m.when}</div>
          <div className="font-mono font-bold text-lg leading-tight mt-0.5">{m.score}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] p-4 flex items-center gap-4">
      <div className="flex items-center gap-2 w-[180px] shrink-0">
        <PlayerAvi p={aPlayers[0]} />
        {aPlayers[1] && <PlayerAvi p={aPlayers[1]} offset />}
        <div className="leading-tight ml-1 min-w-0">
          <div className="text-sm font-semibold truncate">{aPlayers.map(p => p.name.split(' ')[0]).join(' & ')}</div>
          <div className="text-[11px] text-[color:var(--c-muted)]">{aWon && <span className="text-[color:var(--c-pop)] font-semibold">WON</span>}</div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="font-mono font-bold text-base">{m.score}</span>
      </div>
      <div className="flex items-center gap-2 w-[180px] shrink-0 justify-end">
        <div className="leading-tight mr-1 text-right min-w-0">
          <div className="text-sm font-semibold truncate">{bPlayers.map(p => p.name.split(' ')[0]).join(' & ')}</div>
          <div className="text-[11px] text-[color:var(--c-muted)]">{!aWon && <span className="text-[color:var(--c-pop)] font-semibold">WON</span>}</div>
        </div>
        <PlayerAvi p={bPlayers[0]} />
        {bPlayers[1] && <PlayerAvi p={bPlayers[1]} offset />}
      </div>
      <div className="text-right shrink-0 w-[90px] border-l border-[color:var(--c-line)] pl-4 leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-[color:var(--c-muted)]">{m.format}</div>
        <div className="text-[11px] text-[color:var(--c-muted)]">{m.when}</div>
      </div>
    </div>
  )
}

function SideBlock({ players, won, align }: { players: Player[]; won: boolean; align: 'left' | 'right' }) {
  return (
    <div className={`flex-1 p-4 flex items-center gap-3 ${align === 'right' ? 'justify-end' : ''} ${won ? '' : 'opacity-55'}`}>
      <div className={`flex items-center ${align === 'right' ? 'order-2 -space-x-2' : '-space-x-2'}`}>
        {players.map(p => <PlayerAvi key={p.id} p={p} />)}
      </div>
      <div className={`leading-tight ${align === 'right' ? 'text-right' : ''}`}>
        <div className="text-sm font-semibold">{players.map(p => p.name.split(' ')[0]).join(' & ')}</div>
        {won && <div className="text-[10px] uppercase tracking-wider text-[color:var(--c-pop)] font-bold">Winner</div>}
      </div>
    </div>
  )
}

function FeedRow({ f }: { f: FeedItem }) {
  const p = PLAYERS.find(x => x.id === f.who)
  return (
    <div className="px-4 py-3 flex items-center gap-3 hover:bg-[color:var(--c-rail-line)]">
      <PlayerAvi p={p} size={28} />
      <div className="flex-1 text-sm text-[color:var(--c-on-bg)]/85">
        <span className="font-semibold">{p?.name}</span>{' '}
        <span className="text-[color:var(--c-on-bg)]/60">{f.body}</span>
      </div>
      <div className="text-[11px] text-[color:var(--c-on-bg)]/40 font-mono uppercase">{f.when}</div>
    </div>
  )
}
