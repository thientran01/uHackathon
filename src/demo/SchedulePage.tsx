import { useState } from 'react'
import { SCHEDULE, PLAYERS, Player, ScheduleItem } from './data'
import { TweakValues } from './TweaksPanel'
import { IconClock, IconPin, IconPlus, IconCheck } from './icons'
import { PlayerAvi } from './shared'

export default function SchedulePage({ t: _t, me: _me }: { t: TweakValues; me: Partial<Player> }) {
  const [rsvps, setRsvps] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {}
    SCHEDULE.forEach(s => { m[s.id] = s.rsvp.includes('p12') })
    return m
  })
  const toggle = (id: string) => setRsvps(r => ({ ...r, [id]: !r[id] }))

  return (
    <div className="px-10 py-8 max-w-[1100px] mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--c-on-bg)]/40 mb-1">/schedule</div>
          <h1 className="font-[var(--font-display)] text-4xl font-bold text-[color:var(--c-on-bg)] tracking-tight">When we play</h1>
          <p className="text-sm text-[color:var(--c-on-bg)]/60 mt-1">Recurring weekly slots, plus the occasional ladder night. Tap "I'm in" to lock your spot.</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
          const has = SCHEDULE.some(s => s.day === d)
          return (
            <div key={d} className={`px-3 py-3 rounded-xl text-center border ${has ? 'bg-[color:var(--c-rail-line)] border-[color:var(--c-rail-line)]' : 'border-[color:var(--c-rail-line)] opacity-40'}`}>
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--c-on-bg)]/50">{d}</div>
              <div className="font-mono text-base text-[color:var(--c-on-bg)] mt-0.5">{25 + i}</div>
              {has && <div className="mt-1 w-1.5 h-1.5 rounded-full mx-auto bg-[color:var(--c-energy)]" />}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col gap-3">
          {SCHEDULE.map(s => (
            <ScheduleCard key={s.id} s={s} isIn={rsvps[s.id]} onToggle={() => toggle(s.id)} />
          ))}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden">
            <div className="relative aspect-[4/3] bg-[#dbe5dd]">
              <svg viewBox="0 0 200 150" className="w-full h-full">
                <rect width="200" height="150" fill="#dbe5dd" />
                <path d="M0 50 Q 50 40 100 60 T 200 70" fill="none" stroke="#fff" strokeWidth="6" />
                <path d="M0 90 Q 60 100 120 85 T 200 95" fill="none" stroke="#fff" strokeWidth="4" />
                <path d="M30 0 L 50 150" stroke="#fff" strokeWidth="3" opacity={0.6} />
                <path d="M130 0 L 150 150" stroke="#fff" strokeWidth="3" opacity={0.6} />
                <rect x="60" y="55" width="22" height="16" fill="#9ec5a8" rx="2" />
                <rect x="100" y="35" width="30" height="20" fill="#9ec5a8" rx="2" />
                <rect x="70" y="95" width="40" height="25" fill="#9ec5a8" rx="2" />
                <circle cx="95" cy="75" r="8" fill="var(--c-pop)" stroke="#fff" strokeWidth="2.5" />
                <circle cx="95" cy="75" r="3" fill="#fff" />
              </svg>
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-[rgba(15,31,26,0.9)] text-[color:var(--c-energy)]">
                Highland Park
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs font-semibold flex items-center gap-1.5"><IconPin size={13} className="text-[color:var(--c-pop)]" /> 4 courts · open 7am–10pm</div>
              <div className="text-[11px] text-[color:var(--c-muted)] mt-1">2412 Highland Ave · 0.8 mi from downtown</div>
              <button className="mt-2 text-xs font-semibold underline underline-offset-2">Open in Maps →</button>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--c-rail-line)] p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--c-on-bg)]/40 mb-2">Weather watch</div>
            <div className="space-y-2">
              {SCHEDULE.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{s.weather.icon}</span>
                  <span className="font-medium text-[color:var(--c-on-bg)] flex-1 truncate">{s.day}</span>
                  <span className="font-mono text-xs text-[color:var(--c-on-bg)]/60">{s.weather.hi}° / {s.weather.lo}°</span>
                </div>
              ))}
            </div>
          </div>

          <button className="rounded-2xl p-4 text-left flex items-center gap-3 hover:bg-[color:var(--c-rail-line)] border border-dashed border-[color:var(--c-rail-line)]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[color:var(--c-energy)]">
              <IconPlus size={20} stroke={2.5} className="text-[#0f1f1a]" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-[color:var(--c-on-bg)]">Propose a session</div>
              <div className="text-[11px] text-[color:var(--c-on-bg)]/50">One-off meet, ladder night, tournament…</div>
            </div>
          </button>
        </aside>
      </div>

      <div className="h-10" />
    </div>
  )
}

function ScheduleCard({ s, isIn, onToggle }: { s: ScheduleItem; isIn: boolean; onToggle: () => void }) {
  const goers = s.rsvp.map(id => PLAYERS.find(p => p.id === id)).filter(Boolean) as Player[]
  const visibleGoers = goers.slice(0, 5)
  const filled = goers.length / s.cap

  return (
    <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden">
      <div className="flex min-w-0">
        <div className="w-[88px] shrink-0 p-4 flex flex-col items-center justify-center text-center bg-[color:var(--c-ink)] text-[color:var(--c-card)]">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">{s.day}</div>
          <div className="font-[var(--font-display)] text-4xl font-extrabold leading-none mt-1">{s.date.split(' ')[1]}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-60 mt-1">{s.date.split(' ')[0]}</div>
          {s.recurring && <div className="mt-2 text-[9px] uppercase tracking-wider opacity-50">↻ weekly</div>}
        </div>

        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-[var(--font-display)] text-lg font-bold leading-tight">{s.title}</h3>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${s.tag === 'organized' ? 'bg-[color:var(--c-ink)] text-[color:var(--c-energy)]' : 'bg-[color:var(--c-pop)]/15 text-[color:var(--c-pop)]'}`}>
              {s.tag}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-[color:var(--c-muted)] flex-wrap">
            <span className="flex items-center gap-1 shrink-0"><IconClock size={13} />{s.time}</span>
            <span className="flex items-center gap-1 min-w-0"><IconPin size={13} className="shrink-0" /><span className="truncate">{s.loc}</span></span>
            <span className="flex items-center gap-1 shrink-0">{s.weather.icon} {s.weather.hi}°</span>
          </div>

          <div className="mt-3 flex items-center gap-3 min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {visibleGoers.map(p => <PlayerAvi key={p.id} p={p} size={26} offset />)}
              {goers.length > visibleGoers.length && (
                <div className="w-[26px] h-[26px] rounded-full border-2 border-[color:var(--c-card)] text-[10px] font-bold flex items-center justify-center -ml-2 bg-[color:var(--c-ink)] text-[color:var(--c-card)]">
                  +{goers.length - visibleGoers.length}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-[color:var(--c-muted)] truncate">
                <span className="font-semibold text-[color:var(--c-ink)]">{goers.length}</span> / {s.cap} in
              </div>
              <div className="mt-1 h-1 rounded-full bg-black/10 max-w-[140px] overflow-hidden">
                <div className={`h-full ${filled > 0.85 ? 'bg-[color:var(--c-pop)]' : 'bg-[color:var(--c-energy)]'}`}
                     style={{ width: `${Math.round(filled * 100)}%` }} />
              </div>
            </div>
            <button onClick={onToggle}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${isIn ? 'bg-[#0f1f1a] text-[color:var(--c-energy)]' : 'bg-[color:var(--c-energy)] text-[#0f1f1a]'}`}>
              {isIn ? <><IconCheck size={14} stroke={2.5} /> In</> : <>I'm in</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
