export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/20">
      {message}
    </p>
  )
}

export function UnmappableNote() {
  return (
    <p className="text-sm leading-relaxed text-amber-300/80">
      Couldn't map this element to a source file. Try clicking page content — it works best
      inside <code className="rounded bg-line/10 px-1 text-amber-200">src/demo/</code>.
    </p>
  )
}
