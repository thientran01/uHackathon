import { Warning } from '@phosphor-icons/react'

export function RevertConfirmDialog({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      <div className="relative w-80 animate-muse-panel rounded-2xl bg-surface-raised p-5 shadow-2xl ring-1 ring-line/10 motion-reduce:animate-none">
        <div className="mb-1.5 flex items-center gap-2">
          <Warning size={16} weight="fill" className="text-rose-400" />
          <h3 className="text-sm font-semibold text-fg">Revert to original?</h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-fg-muted">
          This will undo all Muse edits in this session and restore the file to its state before
          you started. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-line/10 py-2 text-sm text-fg transition hover:bg-line/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-rose-500/20 py-2 text-sm font-semibold text-rose-300 ring-1 ring-rose-500/30 transition hover:bg-rose-500/30 disabled:opacity-40"
          >
            {loading ? 'Reverting…' : 'Revert'}
          </button>
        </div>
      </div>
    </div>
  )
}
