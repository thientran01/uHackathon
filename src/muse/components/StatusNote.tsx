export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 ring-1 ring-rose-100">
      {message}
    </p>
  )
}

export function UnmappableNote() {
  return (
    <p className="text-sm leading-relaxed text-amber-600">
      Couldn't map this element to a source file. Try clicking page content — it works best
      inside <code className="rounded bg-amber-50 px-1">src/demo/</code>.
    </p>
  )
}
