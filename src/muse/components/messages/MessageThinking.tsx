import { UfoIcon } from '../UfoIcon'
import { ThinkingText } from '../ThinkingText'

// Inline "Muse is thinking" bubble appended to the thread while a request is
// in flight. Removed when the response lands and a new bubble takes its place.
export function MessageThinking() {
  return (
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      <UfoIcon size={16} loading className="text-accent" />
      <ThinkingText />
    </div>
  )
}
