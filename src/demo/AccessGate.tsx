import { useState } from 'react'
import { Pball, IconArrowR } from './icons'
import { Player } from './data'

const ACCESS_CODE = 'RIKKLE'

function SignupField({ label, value, onChange, placeholder, type = 'text', col = 1, err, prefix }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; col?: number; err?: string; prefix?: string
}) {
  return (
    <div className={col === 2 ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--c-muted)] mb-1.5">
        {label}
      </label>
      <div className={`flex items-center rounded-xl border-2 bg-white/60 transition-colors ${err ? 'border-[color:var(--c-pop)]' : 'border-[color:var(--c-line)] focus-within:border-[color:var(--c-ink)]'}`}>
        {prefix && <span className="pl-3 text-[color:var(--c-muted)] font-mono">{prefix}</span>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 px-3 py-3 bg-transparent focus:outline-none placeholder:text-black/25" />
      </div>
      {err && <div className="text-[color:var(--c-pop)] text-[11px] mt-1">{err}</div>}
    </div>
  )
}

export default function AccessGate({ onEnter }: { onEnter: (profile: Partial<Player>) => void }) {
  const [step, setStep] = useState<'code' | 'signup'>('code')
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState('')
  const [shake, setShake] = useState(false)
  const [form, setForm] = useState({ name: '', handle: '', email: '', skill: '2.5', favHand: 'right' })
  const [formErr, setFormErr] = useState<Record<string, string>>({})

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim().toUpperCase() === ACCESS_CODE) {
      setCodeErr(''); setStep('signup')
    } else {
      setCodeErr("That's not it. Ask in the group chat for the code.")
      setShake(true); setTimeout(() => setShake(false), 500)
    }
  }

  const submitSignup = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim())   errs.name   = 'Required'
    if (!form.handle.trim()) errs.handle = 'Pick a handle'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Looks off'
    if (Object.keys(errs).length) { setFormErr(errs); return }
    onEnter({ ...form, id: 'p12', isMe: true })
  }

  return (
    <div className="min-h-screen w-full bg-[color:var(--c-bg)] flex items-center justify-center p-4 bg-[image:var(--court-lines-bg)] relative overflow-hidden">
      <div className="absolute -left-20 -top-24 opacity-10 pointer-events-none">
        <div className="w-[420px] h-[420px] rounded-full bg-[color:var(--c-energy)]" />
      </div>
      <div className="absolute -right-32 -bottom-32 opacity-10 pointer-events-none">
        <div className="w-[520px] h-[520px] rounded-full bg-[color:var(--c-pop)]" />
      </div>

      <div className="relative w-full max-w-[440px]">
        <div className="flex items-center gap-3 mb-8 text-[color:var(--c-on-bg)]">
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[color:var(--c-energy)] text-[#0f1f1a]">
            <Pball size={26} body="#0f1f1a" hole="#d4ff3a" />
          </div>
          <div>
            <div className="font-[var(--font-display)] text-3xl font-bold leading-none tracking-tight">Rikkleball</div>
            <div className="text-xs uppercase tracking-[0.18em] opacity-60 mt-1">Members club · est. 2024</div>
          </div>
        </div>

        {step === 'code' && (
          <div className={`bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] p-7 ${shake ? 'animate-pulse' : ''}`}>
            <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--c-muted)] mb-1">Step 1 of 2</div>
            <h1 className="font-[var(--font-display)] text-2xl font-bold leading-tight mb-1">Welcome to the dink den.</h1>
            <p className="text-sm text-[color:var(--c-muted)] mb-6">Drop the group access code to get past the net.</p>
            <form onSubmit={submitCode}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--c-muted)] mb-2">Access code</label>
              <input value={code} onChange={e => { setCode(e.target.value); setCodeErr('') }}
                placeholder="e.g. RIKKLE" autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[color:var(--c-line)] bg-white/60 font-mono text-lg tracking-[0.3em] uppercase placeholder:text-black/20 placeholder:tracking-normal focus:outline-none focus:border-[color:var(--c-ink)]" />
              {codeErr && <div className="text-[color:var(--c-pop)] text-sm mt-2 flex items-center gap-1.5"><span>✕</span>{codeErr}</div>}
              <button type="submit"
                className="mt-5 w-full py-3.5 rounded-2xl font-[var(--font-display)] font-semibold text-base flex items-center justify-center gap-2 transition-transform active:scale-[.98] bg-[color:var(--c-ink)] text-[color:var(--c-card)]">
                Continue <IconArrowR size={18} />
              </button>
            </form>
            <div className="mt-6 pt-5 border-t border-[color:var(--c-line)] flex items-center justify-between text-xs text-[color:var(--c-muted)]">
              <span>Don't have a code?</span>
              <button className="font-semibold underline underline-offset-2">Ask Riley</button>
            </div>
            <div className="mt-4 text-[11px] text-[color:var(--c-muted)] leading-relaxed">
              Heads up: we'll swap this for Discord sign-in soon, so this is the last time you'll type a password into Rikkleball.
            </div>
          </div>
        )}

        {step === 'signup' && (
          <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] p-7">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--c-muted)]">Step 2 of 2</div>
              <button onClick={() => setStep('code')} className="text-xs text-[color:var(--c-muted)] hover:underline">← Back</button>
            </div>
            <h1 className="font-[var(--font-display)] text-2xl font-bold leading-tight mb-1">Make a player card.</h1>
            <p className="text-sm text-[color:var(--c-muted)] mb-6">Just the basics — you can flesh out paddles + shoes from your profile later.</p>
            <form onSubmit={submitSignup} className="grid grid-cols-2 gap-3">
              <SignupField label="Name" col={2} err={formErr.name}
                value={form.name} onChange={v => setForm({ ...form, name: v })}
                placeholder="Casey Anderson" />
              <SignupField label="Handle" col={1} err={formErr.handle}
                value={form.handle} onChange={v => setForm({ ...form, handle: v.replace(/\s+/g, '') })}
                placeholder="@dinkmaster" prefix="@" />
              <SignupField label="Email" col={1} err={formErr.email}
                value={form.email} onChange={v => setForm({ ...form, email: v })}
                placeholder="you@court.club" type="email" />
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--c-muted)] mb-1.5">Self-rated DUPR</label>
                  <select value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border-2 border-[color:var(--c-line)] bg-white/60 font-medium focus:outline-none focus:border-[color:var(--c-ink)]">
                    {['2.0','2.5','3.0','3.5','4.0','4.5','5.0+'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--c-muted)] mb-1.5">Dominant hand</label>
                  <div className="flex rounded-xl border-2 border-[color:var(--c-line)] overflow-hidden bg-white/60">
                    {['left','right'].map(h => (
                      <button key={h} type="button" onClick={() => setForm({ ...form, favHand: h })}
                        className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${form.favHand === h ? 'bg-[color:var(--c-ink)] text-[color:var(--c-card)]' : 'text-[color:var(--c-muted)] hover:bg-black/5'}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit"
                className="col-span-2 mt-2 py-3.5 rounded-2xl font-[var(--font-display)] font-semibold text-base flex items-center justify-center gap-2 active:scale-[.98] transition-transform bg-[color:var(--c-energy)] text-[#0f1f1a]">
                Step onto the court <IconArrowR size={18} />
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center text-[11px] text-[color:var(--c-on-bg)]/40 tracking-wider uppercase">
          A small private club · 38 members
        </div>
      </div>
    </div>
  )
}
