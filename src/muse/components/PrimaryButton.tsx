type Props = {
  onClick: () => void
  idle: string
  busy?: string
  loading?: boolean
  disabled?: boolean
  testId?: string
}

// The single primary action — Phantom-style neutral inversion: the button is
// the inverse of the panel (dark-on-cream / cream-on-dark). The accent color
// is reserved for small flourishes (UFO logo, focus rings, selected-option
// states), keeping the primary button calm rather than shouty.
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
      disabled={disabled || loading}
      className="w-full rounded-xl bg-fg py-2.5 text-sm font-semibold text-surface shadow-sm transition hover:bg-fg/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 motion-reduce:active:scale-100"
    >
      {loading && busy ? busy : idle}
    </button>
  )
}
