// Minimal line-based diff (LCS) for showing "here's the real code change".
export type DiffLine = { type: 'same' | 'add' | 'del'; text: string }

export function diffLines(oldStr: string, newStr: string): DiffLine[] {
  const a = oldStr.split('\n')
  const b = newStr.split('\n')
  const n = a.length
  const m = b.length

  // LCS length table.
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  // Backtrack into a diff.
  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: 'same', text: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: 'del', text: a[i] })
      i++
    } else {
      out.push({ type: 'add', text: b[j] })
      j++
    }
  }
  while (i < n) out.push({ type: 'del', text: a[i++] })
  while (j < m) out.push({ type: 'add', text: b[j++] })
  return out
}

// Collapse long runs of unchanged lines so the diff stays readable.
export function collapseContext(lines: DiffLine[], context = 2): DiffLine[] {
  const keep = new Array(lines.length).fill(false)
  lines.forEach((l, idx) => {
    if (l.type !== 'same') {
      for (let k = Math.max(0, idx - context); k <= Math.min(lines.length - 1, idx + context); k++) {
        keep[k] = true
      }
    }
  })
  const out: DiffLine[] = []
  let gap = false
  lines.forEach((l, idx) => {
    if (keep[idx]) {
      out.push(l)
      gap = false
    } else if (!gap) {
      out.push({ type: 'same', text: '⋯' })
      gap = true
    }
  })
  return out
}
