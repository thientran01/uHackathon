/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "1" enables Muse mock mode — no Claude API calls, no file writes. */
  readonly VITE_MUSE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
