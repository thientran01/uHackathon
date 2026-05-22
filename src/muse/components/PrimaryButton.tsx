type Props = {
  onClick: () => void
  idle: string
  busy?: string
  loading?: boolean
  disabled?: boolean
  variant?: 'violet' | 'emerald'
  testId?: string
}

export function PrimaryButton({
  onClick,
  idle,
  busy,
  loading = false,
  disabled = false,
  variant = 'violet',
  testId,
}: Props) {
  const color =
    variant === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-500'
      : 'bg-violet-600 hover:bg-violet-500'
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl ${color} py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 motion-reduce:active:scale-100`}
    >
      {loading && busy ? busy : idle}
    </button>
  )
}
