import { useSyncExternalStore } from 'react'
import type { ChatMessage, ClarifyingQuestion, FileEdit, HistoryEntry, ThreadMessage } from './types'

// In-memory only. State resets on full page refresh, or on HMR of THIS file.
// HMR of other Muse files (components) does not reset state — the store
// module stays loaded as long as `store.ts` itself isn't edited.

export type Pending =
  | { kind: 'ask'; toolUseId: string; questions: ClarifyingQuestion[] }
  | { kind: 'propose'; toolUseId: string; edits: FileEdit[]; rationale: string }

export type MuseState = {
  // Per-conversation slice — reset by resetConversation().
  // `intent` is kept for any callers that still set it but the thread shell
  // uses `draft` (composer text) instead. Remove once nothing references it.
  intent: string
  draft: string
  messages: ChatMessage[]
  thread: ThreadMessage[]
  pending: Pending | null
  answers: Record<number, string>
  loading: boolean
  error: string | null
  applied: boolean
  // Per-chat-turn slice — overwritten by runChat on each response. NOT reset
  // by resetConversation; runChat will replace it on the next call. Stale
  // originals are harmless because they're keyed by file path and only read
  // alongside a matching `pending` from the same response.
  originals: Record<string, string>
  // Cross-conversation slice — persists across selections.
  past: HistoryEntry[]
  future: HistoryEntry[]
  historyLoading: boolean
  showRevertConfirm: boolean
}

const initialState: MuseState = {
  intent: '',
  draft: '',
  messages: [],
  thread: [],
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
  /** Merge a partial state patch and notify. Skips no-op patches (every
   * key in the patch already equals the current value) to avoid spurious
   * re-renders — useSyncExternalStore compares snapshot reference identity. */
  setState(patch: Partial<MuseState> | ((s: MuseState) => Partial<MuseState>)) {
    const next = typeof patch === 'function' ? patch(state) : patch
    if (!next) return
    const cur = state as Record<string, unknown>
    let changed = false
    for (const key in next) {
      if ((next as Record<string, unknown>)[key] !== cur[key]) {
        changed = true
        break
      }
    }
    if (!changed) return
    state = { ...state, ...next }
    notify()
  },
  /**
   * Reset the conversation slice (thread, messages, pending, answers, error,
   * applied). History is preserved. `keepDraft` is for the "shrinking a batch"
   * case where the user removed an element from a multi-select and we don't
   * want to wipe their typed composer text.
   */
  resetConversation(keepDraft = false) {
    state = {
      ...state,
      thread: [],
      messages: [],
      pending: null,
      answers: {},
      error: null,
      applied: false,
      intent: '',
      draft: keepDraft ? state.draft : '',
    }
    notify()
  },
  /** Append a single bubble to the thread, replacing state immutably. */
  appendThread(msg: ThreadMessage) {
    state = { ...state, thread: [...state.thread, msg] }
    notify()
  },
}

let _id = 0
/** Stable, monotonic id for thread messages — sortable, unique per session. */
export const nextThreadId = (): string => `m${++_id}`

/** Subscribe a component to the entire store. Re-renders on any state change. */
export function useMuseStore(): MuseState {
  return useSyncExternalStore(museStore.subscribe, museStore.getState)
}
