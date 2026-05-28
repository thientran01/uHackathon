export function MessageUser({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-line/[0.07] px-3.5 py-2 text-sm leading-snug text-fg">
        {text}
      </div>
    </div>
  )
}
