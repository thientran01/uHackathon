import { ReactNode } from 'react'
import { Player } from './data'
import { TweakValues } from './TweaksPanel'
import { IconHome, IconSwords, IconTrophy, IconCalendar, IconBag, IconLogout, Pball } from './icons'

type Route = 'home' | 'matches' | 'leader' | 'sched' | 'gear'

const NAV: { id: Route; label: string; Icon: (p: { size?: number; stroke?: number }) => JSX.Element }[] = [
  { id: 'home',    label: 'Home',        Icon: IconHome },
  { id: 'matches', label: 'Matches',     Icon: IconSwords },
  { id: 'leader',  label: 'Leaderboard', Icon: IconTrophy },
  { id: 'sched',   label: 'Schedule',    Icon: IconCalendar },
  { id: 'gear',    label: 'Equipment',   Icon: IconBag },
]

export default function AppShell({ me, route, onRoute, onSignOut, children }: {
  me: Partial<Player>; route: Route; onRoute: (r: Route) => void
  onSignOut: () => void; t: TweakValues; children: ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-[color:var(--c-bg)] flex">
      <aside className="w-[240px] shrink-0 border-r border-[color:var(--c-rail-line)] flex flex-col">
        <div className="px-6 pt-6 pb-4 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[color:var(--c-energy)]">
            <Pball size={22} body="#0f1f1a" hole="#d4ff3a" />
          </div>
          <div className="leading-tight">
            <div className="font-[var(--font-display)] text-xl font-bold text-[color:var(--c-on-bg)] tracking-tight">Rikkleball</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--c-on-bg-muted)]">Members club</div>
          </div>
        </div>

        <nav className="px-3 mt-2 flex flex-col gap-0.5">
          {NAV.map(({ id, label, Icon }) => {
            const active = route === id
            return (
              <button key={id} onClick={() => onRoute(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${active ? 'bg-[color:var(--c-energy)] text-[#0f1f1a]' : 'text-[color:var(--c-on-bg-muted)] hover:bg-[color:var(--c-rail-line)] hover:text-[color:var(--c-on-bg)]'}`}>
                <Icon size={18} stroke={active ? 2 : 1.75} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mx-4 mt-6 p-4 rounded-2xl border border-[color:var(--c-rail-line)] bg-[color:var(--c-rail-line)]">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--c-on-bg-muted)] mb-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-[color:var(--c-pop)]">
              <span className="w-2 h-2 rounded-full bg-[color:var(--c-pop)] animate-[pulsedot_1.6s_ease-in-out_infinite]" />
              Next session
            </span>
          </div>
          <div className="font-[var(--font-display)] text-base font-semibold text-[color:var(--c-on-bg)] leading-tight">Tuesday Drop-in</div>
          <div className="text-xs text-[color:var(--c-on-bg-muted)] mt-0.5">May 26 · 6:30 PM</div>
          <div className="text-xs text-[color:var(--c-on-bg-muted)]">Highland Park</div>
          <button onClick={() => onRoute('sched')}
            className="mt-3 w-full py-2 rounded-lg text-sm font-semibold hover:opacity-90 bg-[color:var(--c-ink)] text-[color:var(--c-card)]">
            I'm in →
          </button>
        </div>

        <div className="mt-auto p-4 border-t border-[color:var(--c-rail-line)]">
          <button onClick={onSignOut}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[color:var(--c-rail-line)] text-left">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 bg-[color:var(--c-pop)]">
              <span className="font-[var(--font-display)] font-bold text-white">{(me.name || 'Y')[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[color:var(--c-on-bg)] truncate">{me.name || 'You'}</div>
              <div className="text-[11px] text-[color:var(--c-on-bg-muted)] font-mono truncate">@{me.handle || 'you'} · 1565 ELO</div>
            </div>
            <IconLogout size={16} className="text-[color:var(--c-on-bg-muted)]" />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
        {children}
      </main>
    </div>
  )
}
