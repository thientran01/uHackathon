import { useState } from 'react'
import { EQUIPMENT, Gear, Player } from './data'
import { TweakValues } from './TweaksPanel'
import { Backdrop } from './shared'

export default function EquipmentPage({ me: _me, t: _t }: { me: Partial<Player>; t: TweakValues }) {
  const initial = EQUIPMENT['p12']
  const [kit, setKit] = useState(initial)
  const [editing, setEditing] = useState<'paddle' | 'shoes' | 'balls' | null>(null)

  return (
    <div className="px-10 py-8 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--c-on-bg)]/40 mb-1">/my-kit</div>
        <h1 className="font-[var(--font-display)] text-4xl font-bold text-[color:var(--c-on-bg)] tracking-tight">Your kit</h1>
        <p className="text-sm text-[color:var(--c-on-bg)]/60 mt-1">Keep this current — Saturday round-robin pairs people up by paddle weight class.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <GearCard label="Paddle" icon="🏓" tintClass="bg-[color:var(--c-energy)]" gear={kit.paddle}
          fields={[
            { k: 'brand', l: 'Brand' }, { k: 'model', l: 'Model' },
            { k: 'weight', l: 'Weight' }, { k: 'grip', l: 'Grip size' },
            { k: 'since', l: 'Using since' },
          ]}
          onEdit={() => setEditing('paddle')} />
        <GearCard label="Shoes" icon="👟" tintClass="bg-[color:var(--c-pop)]" gear={kit.shoes}
          fields={[
            { k: 'brand', l: 'Brand' }, { k: 'model', l: 'Model' },
            { k: 'size', l: 'Size' }, { k: 'since', l: 'Using since' },
          ]}
          onEdit={() => setEditing('shoes')} />
        <GearCard label="Balls" icon="🟡" tintClass="bg-[#e8a87c]" gear={kit.balls}
          fields={[
            { k: 'brand', l: 'Brand' }, { k: 'model', l: 'Model' },
            { k: 'color', l: 'Color' }, { k: 'qty', l: 'On hand', suffix: ' in bag' },
          ]}
          onEdit={() => setEditing('balls')} />
      </div>

      <section className="mt-8 grid grid-cols-3 gap-5">
        <div className="col-span-2 rounded-2xl border border-[color:var(--c-rail-line)] p-5">
          <h2 className="font-[var(--font-display)] text-lg font-bold text-[color:var(--c-on-bg)] mb-3">Recent kit changes</h2>
          <div className="space-y-3">
            {[
              { d: 'Mar 14', txt: 'Switched to Selkirk Vanguard Power Air (from CRBN-1)', pos: true },
              { d: 'Jan 04', txt: 'New K-Swiss Express Light — court shoes only', pos: true },
              { d: 'Dec 12', txt: 'Re-gripped paddle with Tourna overgrip', pos: false },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="font-mono text-xs text-[color:var(--c-on-bg)]/40 w-16 shrink-0">{e.d}</div>
                <div className={`w-1.5 h-1.5 rounded-full ${e.pos ? 'bg-[color:var(--c-energy)]' : 'bg-[color:var(--c-pop)]'}`} />
                <div className="text-[color:var(--c-on-bg)]/85">{e.txt}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-5 bg-[color:var(--c-energy)] text-[#0f1f1a]">
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-70">Group tip</div>
          <div className="font-[var(--font-display)] text-lg font-bold mt-1 leading-tight">Indoor balls live in the locker by Court 1.</div>
          <div className="text-xs mt-2 opacity-75">Take what you need. Bring 'em back. The honor system stays alive.</div>
        </div>
      </section>

      {editing && (
        <Backdrop onClose={() => setEditing(null)}>
          <EditGearDialog
            label={editing}
            data={kit[editing]}
            onSave={d => { setKit({ ...kit, [editing]: d }); setEditing(null) }}
            onClose={() => setEditing(null)}
          />
        </Backdrop>
      )}

      <div className="h-10" />
    </div>
  )
}

function GearCard({ label, icon, tintClass, gear, fields, onEdit }: {
  label: string; icon: string; tintClass: string; gear: Gear
  fields: { k: string; l: string; suffix?: string }[]
  onEdit: () => void
}) {
  return (
    <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] overflow-hidden">
      <div className="relative px-5 pt-5 pb-3 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-[color:var(--c-muted)]">{label}</div>
          <div className="font-[var(--font-display)] text-xl font-bold mt-1 leading-tight">{gear.model}</div>
          <div className="text-xs text-[color:var(--c-muted)]">{gear.brand}</div>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${tintClass}`}>{icon}</div>
      </div>
      <div className="px-5 pb-3 grid grid-cols-2 gap-y-2 gap-x-3">
        {fields.map(f => (
          <div key={f.k}>
            <div className="text-[10px] uppercase tracking-wider text-[color:var(--c-muted)] font-semibold">{f.l}</div>
            <div className="font-mono text-sm font-medium mt-0.5">{gear[f.k]}{f.suffix || ''}</div>
          </div>
        ))}
      </div>
      <button onClick={onEdit}
        className="block w-full px-5 py-3 border-t border-[color:var(--c-line)] text-xs font-semibold text-left hover:bg-black/[0.04] text-[color:var(--c-ink)]">
        Edit {label.toLowerCase()} →
      </button>
    </div>
  )
}

function EditGearDialog({ label, data, onSave, onClose }: {
  label: string; data: Gear; onSave: (d: Gear) => void; onClose: () => void
}) {
  const [draft, setDraft] = useState<Gear>({ ...data })
  return (
    <div className="bg-[color:var(--c-card)] text-[color:var(--c-ink)] rounded-[var(--r-card)] p-7 max-w-[480px] w-full">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-[var(--font-display)] text-2xl font-bold capitalize">Edit {label}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/10 text-[color:var(--c-muted)]">✕</button>
      </div>
      <p className="text-sm text-[color:var(--c-muted)] mb-5">Group sees the model + brand. The rest is for your own records.</p>
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(data).map(k => (
          <div key={k} className={k === 'model' ? 'col-span-2' : ''}>
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[color:var(--c-muted)]">{k}</label>
            <input value={String(draft[k])} onChange={e => setDraft({ ...draft, [k]: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[color:var(--c-line)] bg-white/60 font-medium text-sm focus:outline-none focus:border-[color:var(--c-ink)]" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black/5">Cancel</button>
        <button onClick={() => onSave(draft)} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[color:var(--c-energy)] text-[#0f1f1a]">Save</button>
      </div>
    </div>
  )
}
