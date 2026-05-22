// Canned data for mock mode and the ?gallery states view.
import type { ClarifyingQuestion, SelectedElement } from './types'

export const fxElement: SelectedElement = {
  fileName: 'src/demo/Hero.tsx',
  line: 24,
  tag: 'h1',
  classNames: 'text-5xl font-bold tracking-tight',
  text: 'Build faster than ever',
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

export const fxOriginal = `      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Build faster than ever
        </h1>`

export const fxNewContent = `      <section className="mx-auto max-w-4xl px-6 py-40 text-center">
        <h1 className="text-6xl font-light tracking-tight text-slate-900">
          Build faster than ever
        </h1>`

export const fxRationale =
  'Gave the headline a lighter, larger treatment and opened up the vertical spacing — a calmer, more premium feel.'
