import { useState, useEffect } from 'react'
import { Player } from './data'
import GlobalStyles from './GlobalStyles'
import AccessGate from './AccessGate'
import AppShell from './AppShell'
import HomePage from './HomePage'
import MatchesPage from './MatchesPage'
import LeaderboardPage from './LeaderboardPage'
import SchedulePage from './SchedulePage'
import EquipmentPage from './EquipmentPage'
import {
  useTweaks, TweaksPanel, TweakSection,
  TweakColor, TweakRadio, TweakSelect, TweakButton,
  TweakValues,
} from './TweaksPanel'

// ── Palette / font definitions ──────────────────────────────────────────────

const TWEAK_DEFAULTS: TweakValues = {
  palette:      ['#0f1f1a', '#d4ff3a', '#ff6b35', '#f5f1e8'],
  theme:        'dark',
  density:      'cozy',
  radius:       'rounded',
  matchCard:    'standard',
  leaderLayout: 'table',
  fontPair:     'bricolage',
}

const PALETTES: Record<string, { bg: string; surface: string; card: string; ink: string; energy: string; pop: string; name: string }> = {
  '0f1f1a,d4ff3a,ff6b35,f5f1e8': { bg:'#0f1f1a', surface:'#1a2e26', card:'#f5f1e8', ink:'#0f1f1a', energy:'#d4ff3a', pop:'#ff6b35', name:'Court green' },
  '1a1d29,3b82f6,fbbf24,f8fafc':  { bg:'#1a1d29', surface:'#252938', card:'#f8fafc', ink:'#1a1d29', energy:'#3b82f6', pop:'#fbbf24', name:'Night sky' },
  '291507,e8a87c,d4ff3a,faf6ee':  { bg:'#291507', surface:'#3a200e', card:'#faf6ee', ink:'#291507', energy:'#e8a87c', pop:'#d4ff3a', name:'Clay court' },
  '0a0a0a,dfff1f,ff4d2e,fafafa':  { bg:'#0a0a0a', surface:'#1a1a1a', card:'#fafafa', ink:'#0a0a0a', energy:'#dfff1f', pop:'#ff4d2e', name:'Pure black' },
}
const paletteKey = (arr: string[]) => arr.map(c => c.replace('#','').toLowerCase()).join(',')

const FONT_PAIRS: Record<string, { display: string; body: string; label: string }> = {
  bricolage: { display: "'Bricolage Grotesque'", body: "'Schibsted Grotesk'", label: 'Bricolage + Schibsted' },
  fraunces:  { display: "'Fraunces'",            body: "'DM Sans'",           label: 'Fraunces + DM Sans' },
  space:     { display: "'Space Grotesk'",       body: "'Space Grotesk'",     label: 'Space Grotesk' },
}

type Route = 'home' | 'matches' | 'leader' | 'sched' | 'gear'

// ── DemoApp ──────────────────────────────────────────────────────────────────

export default function DemoApp() {
  const [me, setMe] = useState<Partial<Player> | null>(() => {
    try {
      const raw = sessionStorage.getItem('rk_me')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })
  const [route, setRoute] = useState<Route>('home')
  const [logOpen, setLogOpen] = useState(false)
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)

  // Apply palette + theme CSS variables to :root every render
  useEffect(() => {
    const r = document.documentElement
    const pal = PALETTES[paletteKey(t.palette)] || PALETTES[paletteKey(TWEAK_DEFAULTS.palette)]
    const light = t.theme === 'light'

    const vars: Record<string, string> = light ? {
      '--c-bg':           pal.card,
      '--c-surface':      '#ffffff',
      '--c-card':         '#ffffff',
      '--c-ink':          pal.ink,
      '--c-energy':       pal.energy,
      '--c-pop':          pal.pop,
      '--c-on-bg':        pal.ink,
      '--c-on-bg-muted':  'rgba(15,31,26,0.55)',
      '--c-rail-line':    'rgba(15,31,26,0.08)',
      '--c-line':         'rgba(15,31,26,0.10)',
      '--c-muted':        '#6b7670',
    } : {
      '--c-bg':           pal.bg,
      '--c-surface':      pal.surface,
      '--c-card':         pal.card,
      '--c-ink':          pal.ink,
      '--c-energy':       pal.energy,
      '--c-pop':          pal.pop,
      '--c-on-bg':        pal.card,
      '--c-on-bg-muted':  'rgba(245,241,232,0.55)',
      '--c-rail-line':    'rgba(255,255,255,0.07)',
      '--c-line':         'rgba(15,31,26,0.10)',
      '--c-muted':        '#6b7670',
    }
    for (const k in vars) r.style.setProperty(k, vars[k])
    r.dataset.theme = t.theme

    const radii: Record<string, string> = { sharp: '0.25rem', rounded: '1.25rem', pill: '2rem' }
    r.style.setProperty('--r-card', radii[t.radius] || radii.rounded)
    r.style.setProperty('--r-chip', t.radius === 'sharp' ? '0.25rem' : '999px')
    r.style.setProperty('--pad',    t.density === 'compact' ? '0.75rem' : '1.25rem')

    const fp = FONT_PAIRS[t.fontPair] || FONT_PAIRS.bricolage
    r.style.setProperty('--font-display', fp.display)
    r.style.setProperty('--font-body',    fp.body)
  }, [t])

  const handleEnter = (profile: Partial<Player>) => {
    setMe(profile)
    sessionStorage.setItem('rk_me', JSON.stringify(profile))
  }
  const signOut = () => { sessionStorage.removeItem('rk_me'); setMe(null); setRoute('home') }

  const TweaksUI = () => (
    <TweaksPanel title="Rikkleball tweaks">
      <TweakSection label="Look" />
      <TweakColor label="Palette" value={t.palette}
        options={Object.values(PALETTES).map(p => [p.bg, p.energy, p.pop, p.card])}
        onChange={v => setTweak('palette', v)} />
      <TweakRadio label="Theme"   value={t.theme}   options={['dark','light']}             onChange={v => setTweak('theme',   v)} />
      <TweakRadio label="Density" value={t.density} options={['cozy','compact']}           onChange={v => setTweak('density', v)} />
      <TweakRadio label="Card radius" value={t.radius} options={['sharp','rounded','pill']} onChange={v => setTweak('radius',  v)} />
      <TweakSection label="Components" />
      <TweakSelect label="Match card style" value={t.matchCard}
        options={[{ value:'standard',label:'Standard' },{ value:'minimal',label:'Minimal row' },{ value:'split',label:'Split block' }]}
        onChange={v => setTweak('matchCard', v)} />
      <TweakRadio label="Leaderboard" value={t.leaderLayout}
        options={[{ value:'table',label:'Table' },{ value:'podium',label:'Podium' },{ value:'cards',label:'Cards' }]}
        onChange={v => setTweak('leaderLayout', v)} />
      <TweakSection label="Type" />
      <TweakSelect label="Font pairing" value={t.fontPair}
        options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.label }))}
        onChange={v => setTweak('fontPair', v)} />
      <TweakSection label="Auth" />
      <TweakButton label="Sign out / reset" secondary onClick={() => { sessionStorage.removeItem('rk_me'); location.reload() }} />
    </TweaksPanel>
  )

  if (!me) {
    return (
      <>
        <GlobalStyles />
        <AccessGate onEnter={handleEnter} />
        <TweaksUI />
      </>
    )
  }

  const page = (() => {
    switch (route) {
      case 'matches': return <MatchesPage t={t} logOpen={logOpen} setLogOpen={setLogOpen} />
      case 'leader':  return <LeaderboardPage t={t} />
      case 'sched':   return <SchedulePage t={t} me={me} />
      case 'gear':    return <EquipmentPage t={t} me={me} />
      default:        return <HomePage me={me} t={t} onRoute={r => setRoute(r as Route)} onLogMatch={() => { setRoute('matches'); setLogOpen(true) }} />
    }
  })()

  return (
    <>
      <GlobalStyles />
      <AppShell me={me} route={route} onRoute={r => setRoute(r)} onSignOut={signOut} t={t}>
        {page}
      </AppShell>
      <TweaksUI />
    </>
  )
}
