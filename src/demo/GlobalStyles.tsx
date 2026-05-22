import { useEffect } from 'react'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Schibsted+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --font-display: 'Bricolage Grotesque', system-ui;
    --font-body:    'Schibsted Grotesk', system-ui;
    --c-bg:         #0f1f1a;
    --c-surface:    #1a2e26;
    --c-card:       #f5f1e8;
    --c-ink:        #0f1f1a;
    --c-muted:      #6b7670;
    --c-line:       rgba(15,31,26,0.10);
    --c-energy:     #d4ff3a;
    --c-pop:        #ff6b35;
    --c-on-bg:      #f5f1e8;
    --c-on-bg-muted: rgba(245,241,232,0.55);
    --c-rail-line:  rgba(255,255,255,0.07);
    --r-card:       1.25rem;
    --r-chip:       999px;
    --pad:          1.25rem;
    --court-lines-bg:
      linear-gradient(180deg, transparent 0, transparent calc(50% - 1px), rgba(245,241,232,.08) calc(50% - 1px), rgba(245,241,232,.08) calc(50% + 1px), transparent calc(50% + 1px)),
      linear-gradient(90deg,  transparent 0, transparent calc(50% - 1px), rgba(245,241,232,.08) calc(50% - 1px), rgba(245,241,232,.08) calc(50% + 1px), transparent calc(50% + 1px));
    --dotted-grid-bg: radial-gradient(rgba(245,241,232,.08) 1px, transparent 1px);
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--c-bg);
    color: var(--c-card);
    font-family: var(--font-body);
    font-feature-settings: "ss01","ss02","cv11";
    -webkit-font-smoothing: antialiased;
  }

  .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 4px; }

  @keyframes ballspin { to { transform: rotate(360deg); } }
  @keyframes pulsedot { 0%,100%{opacity:.4} 50%{opacity:1} }

  [data-theme="light"] {
    --c-bg:          #f5f1e8;
    --c-surface:     #ffffff;
    --c-card:        #ffffff;
    --c-ink:         #0f1f1a;
    --c-muted:       #6b7670;
    --c-line:        rgba(15,31,26,0.10);
    --c-on-bg:       #0f1f1a;
    --c-on-bg-muted: rgba(15,31,26,0.55);
    --c-rail-line:   rgba(15,31,26,0.08);
    --court-lines-bg:
      linear-gradient(180deg, transparent 0, transparent calc(50% - 1px), rgba(15,31,26,.07) calc(50% - 1px), rgba(15,31,26,.07) calc(50% + 1px), transparent calc(50% + 1px)),
      linear-gradient(90deg,  transparent 0, transparent calc(50% - 1px), rgba(15,31,26,.07) calc(50% - 1px), rgba(15,31,26,.07) calc(50% + 1px), transparent calc(50% + 1px));
    --dotted-grid-bg: radial-gradient(rgba(15,31,26,.08) 1px, transparent 1px);
  }
  [data-theme="light"] body { color: var(--c-ink); }
`

export default function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement('style')
    el.setAttribute('data-rk-global', '')
    el.textContent = CSS
    document.head.appendChild(el)
    return () => el.remove()
  }, [])
  return null
}
