// MOCK mode: when on, the overlay runs the whole flow on fixtures —
// no Claude API calls, no file writes — so the UI can be polished for free.
// Toggle with VITE_MUSE_MOCK=1 in .env.local, then restart `npm run dev`.
export const MOCK = import.meta.env.VITE_MUSE_MOCK === '1'
