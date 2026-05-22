// Canned data for mock mode and the ?gallery states view.
import type { ClarifyingQuestion, FileEdit, SelectedElement } from './types'

export const fxElement: SelectedElement = {
  fileName: 'src/demo/Hero.tsx',
  line: 24,
  tag: 'h1',
  classNames: 'text-5xl font-bold tracking-tight',
  text: 'Build faster than ever',
  key: 'src/demo/Hero.tsx:24:6:h1',
}

export const fxQuestions: ClarifyingQuestion[] = [
  {
    question: 'What style of premium are you going for?',
    options: [
      {
        label: 'Elegant & refined',
        description: 'Lighter weight, more breathing room, soft serif — luxury / high-end SaaS.',
      },
      {
        label: 'Bold & confident',
        description: 'Bigger, tighter, high contrast — fintech / enterprise.',
      },
      {
        label: 'Minimal & sophisticated',
        description: 'Sleek, understated, perfect proportions — Apple / Stripe.',
      },
    ],
  },
]

export const fxRationale =
  'Gave the headline and the call-to-action a lighter, larger, more refined treatment with more breathing room — a calmer, more premium feel across both.'

// Two files, so the batch UI (multi-file diff pager, approve-all) is exercisable in mock.
export const fxOriginals: Record<string, string> = {
  'src/demo/Hero.tsx': `      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Build faster than ever
        </h1>`,
  'src/demo/CTA.tsx': `      <button className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white">
        Get started
      </button>`,
}

export const fxEdits: FileEdit[] = [
  {
    fileName: 'src/demo/Hero.tsx',
    newContent: `      <section className="mx-auto max-w-4xl px-6 py-40 text-center">
        <h1 className="text-6xl font-light tracking-tight text-slate-900">
          Build faster than ever
        </h1>`,
  },
  {
    fileName: 'src/demo/CTA.tsx',
    newContent: `      <button className="rounded-full bg-slate-900 px-7 py-3.5 font-medium tracking-tight text-white">
        Get started
      </button>`,
  },
]
