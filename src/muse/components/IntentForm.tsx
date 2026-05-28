import { PrimaryButton } from './PrimaryButton'

export function IntentForm({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-fg-muted">What would you like to change?</p>
      <textarea
        data-testid="muse-intent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit()
        }}
        rows={3}
        placeholder="e.g. make this feel more premium"
        className="w-full resize-none rounded-xl border border-line/10 bg-line/[0.04] p-3 text-sm text-fg outline-none transition placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/25"
      />
      <PrimaryButton
        testId="muse-ask"
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        loading={loading}
        idle="Ask Muse"
        busy="Thinking…"
      />
    </div>
  )
}
