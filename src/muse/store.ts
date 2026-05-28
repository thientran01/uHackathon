import { useSyncExternalStore } from 'react'
import type { ChatMessage, ClarifyingQuestion, FileEdit, HistoryEntry } from './types'

// In-memory only. State resets on full page refresh, or on HMR of THIS file.
// HMR of other Muse files (components) does not reset state — the store
// module stays loaded as long as `store.ts` itself isn't edited.

export type Pending =
  | { kind: 'ask'; toolUseId: string; questions: ClarifyingQuestion[] }
  | { kind: 'propose'; toolUseId: string; edits: FileEdit[]; rationale: string }

export type MuseState = {
  // Per-conversation slice — reset by resetConversation().
  intent: string
  messages: ChatMessage[]
  pending: Pending | null
  originals: Record<string, string>
  answers: Record<number, string>
  loading: boolean
  error: string | null
  applied: boolean
  // Cross-conversation slice — persists across selections.
  past: HistoryEntry[]
  future: HistoryEntry[]
  historyLoading: boolean
  showRevertConfirm: boolean
}

const initialState: MuseState = {
  intent: '',
  messages: [],
  pending: null,
  originals: {},
  answers: {},
  loading: false,
  error: null,
  applied: false,
  past: [],
  future: [],
  historyLoading: false,
  showRevertConfirm: false,
}

let state: MuseState = initialState
const subscribers = new Set<() => void>()

function notify() {
  subscribers.forEach((fn) => fn())
}

export const museStore = {
  getState: (): MuseState => state,
  subscribe: (fn: () => void): (() => void) => {
    subscribers.add(fn)
    return () => {
      subscribers.delete(fn)
    }
  },
  /** Merge a partial state patch and notify. */
  setState(patch: Partial<MuseState> | ((s: MuseState) => Partial<MuseState>)) {
    const next = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...next }
    notify()
  },
  /**
   * Reset the conversation slice (messages, pending, answers, error, applied).
   * History is preserved. `keepIntent` is for the "shrinking a batch" case
   * where the user removed an element from a multi-select and we don't want
   * to wipe their typed intent.
   */
  resetConversation(keepIntent = false) {
    state = {
      ...state,
      messages: [],
      pending: null,
      answers: {},
      error: null,
      applied: false,
      intent: keepIntent ? state.intent : '',
    }
    notify()
  },
}

/** Subscribe a component to the entire store. Re-renders on any state change. */
export function useMuseStore(): MuseState {
  return useSyncExternalStore(museStore.subscribe, museStore.getState)
}
