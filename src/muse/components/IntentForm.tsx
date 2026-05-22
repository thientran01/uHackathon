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
      <p className="text-sm text-slate-600">What would you like to change?</p>
      <textarea
        data-testid="muse-intent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit()
        }}
        rows={3}
        placeholder="e.g. make this feel more premium"
        className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
