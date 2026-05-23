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


