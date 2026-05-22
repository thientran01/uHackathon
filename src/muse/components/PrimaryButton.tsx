type Props = {
  onClick: () => void
  idle: string
  busy?: string
  loading?: boolean
  disabled?: boolean
  testId?: string
}

// The single primary action — always the cobalt accent. One accent, used sparingly.
export function PrimaryButton({
  onClick,
  idle,
  busy,
  loading = false,
  disabled = false,
  testId,
}: Props) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 motion-reduce:active:scale-100"
    >
      {loading && busy ? busy : idle}
    </button>
  )
}
