# Muse

An AI **design partner** that lives inside a real running app. A non-technical
user points at any element, Muse asks one or two clean visual clarifying
questions, and on approval **writes a real code change to the source file**.
The app hot-reloads and the user sees the diff.

Hackathon project — theme: dev tools.

## Stack

- Vite 5 + React 18 + TypeScript + Tailwind CSS v3
- Anthropic SDK (Muse engine, added later) — tool use: `ask_clarifying_questions` | `propose_edit`
- Element → source mapping via React 18 dev `_debugSource` (see `src/muse/sourceLocation.ts`)

## Run it

```bash
npm install
npm run dev
```

Then open the localhost URL it prints (default http://localhost:5173).

## Who owns what

| Folder | Owner | What |
|---|---|---|
| `src/demo/` | **Teammate** | The sample landing page Muse edits (nav, hero, features, pricing, CTA, footer). Self-contained. |
| `src/muse/` | **Thien** | The engine: overlay widget, click-to-source, Claude loop, file-write + HMR. |
| `server/` *(added later)* | **Thien** | Thin backend: Claude proxy + read/write-file endpoints. |
| root config | **Thien** | `vite.config`, `package.json`, `tailwind.config`, `App.tsx`. |

### Rules of the road (avoids merge pain + keeps Muse able to edit the demo)

- Work on your own branch; don't commit to `main`.
- **Demo app:** Tailwind utility classes **inline in `className` only** — no
  `.css` files, no styled-components, no `style={{}}`, no `clsx`/class
  variables. One section = one component file in `src/demo/`.
- Teammate edits **only** `src/demo/`. Don't touch root config or `App.tsx`.

## MVP (the demo)

Select an element → Muse asks **one** clarifying question with visual options →
produces **one real edit** → writes to source → app updates live → diff shown.

Full plan: `~/.claude/plans/i-m-doing-a-hackathon-proud-peach.md`
