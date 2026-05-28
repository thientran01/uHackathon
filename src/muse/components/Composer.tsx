import { useEffect, useRef } from 'react'
import { ArrowUp } from '@phosphor-icons/react'

export function Composer({
  value,
  onChange,
  onSubmit,
  loading,
  disabled = false,
  placeholder = 'Tell Muse what you want…',
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
  disabled?: boolean
  placeholder?: string
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea up to a sensible cap so it never overwhelms the
  // panel. Reset to 'auto' first so it can shrink as the user deletes text.
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [value])

  const canSend = !!value.trim() && !loading && !disabled

  return (
    <div className="border-t border-line/[0.07] bg-line/[0.02] p-3">
      <div className="relative flex items-end gap-2 rounded-xl border border-line/10 bg-line/[0.04] px-3 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
        <textarea
          ref={taRef}
          data-testid="muse-composer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSend) onSubmit()
            }
          }}
          rows={1}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="min-h-[20px] flex-1 resize-none bg-transparent text-sm leading-snug text-fg outline-none placeholder:text-fg-faint disabled:opacity-50"
        />
        <button
          data-testid="muse-send"
          onClick={() => { if (canSend) onSubmit() }}
          disabled={!canSend}
          aria-label="Send"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fg text-surface transition hover:bg-fg/90 active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100 motion-reduce:active:scale-100"
        >
          <ArrowUp size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
