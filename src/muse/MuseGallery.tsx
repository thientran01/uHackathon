import { useState, type ReactNode } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { ClarifyingQuestions } from './components/ClarifyingQuestions'
import { IntentForm } from './components/IntentForm'
import { MuseFab } from './components/MuseFab'
import { MusePanel } from './components/MusePanel'
import { ProposedEdit } from './components/ProposedEdit'
import {
  HoverHighlight,
  SelectBanner,
  SelectionTray,
} from './components/SelectionOverlay'
import { ErrorNote, UnmappableNote } from './components/StatusNote'
import { fxEdits, fxElement, fxOriginals, fxQuestions, fxRationale } from './fixtures'
import type { SelectedElement } from './types'

const noop = () => {}
const fxElement2: SelectedElement = {
  fileName: 'src/demo/CTA.tsx',
  line: 12,
  tag: 'button',
  classNames: 'rounded-lg bg-slate-900 px-6 py-3',
  text: 'Get started',
  key: 'src/demo/CTA.tsx:12:6:button',
}

function Cell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
      <div className="relative flex min-h-[140px] items-start justify-center rounded-2xl border border-slate-200 bg-slate-100 p-6">
        {children}
      </div>
    </section>
  )
}

/**
 * Dev-only showcase of every Muse UI state, rendered with fixtures.
 * Open at /?gallery. Edit the components in src/muse/components/ — changes
 * show up here AND in the live overlay.
 */
export function MuseGallery() {
  const [answers, setAnswers] = useState<Record<number, string>>({ 0: 'Minimal & sophisticated' })

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10 font-sans text-slate-900">
      <header className="mx-auto mb-10 max-w-6xl">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sparkle size={22} weight="fill" className="text-accent" /> Muse — UI states
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Every component and step of the flow, with mock data. Edit the components in{' '}
          <code className="rounded bg-slate-200 px-1">src/muse/components/</code> and they update
          here and in the live overlay.
        </p>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 md:grid-cols-2 xl:grid-cols-3">
        <Cell title="FAB — idle">
          <MuseFab active={false} onToggle={noop} />
        </Cell>
        <Cell title="FAB — select mode">
          <MuseFab active onToggle={noop} />
        </Cell>
        <Cell title="Select banner">
          <SelectBanner />
        </Cell>

        <Cell title="Hover highlight">
          <div className="relative h-24 w-48 rounded bg-white ring-1 ring-slate-200">
            <HoverHighlight rect={{ top: 8, left: 8, width: 176, height: 80 }} />
          </div>
        </Cell>
        <Cell title="Batch tray">
          <SelectionTray count={3} onDesign={noop} />
        </Cell>

        <Cell title="Panel — intent">
          <MusePanel elements={[fxElement]} onClose={noop}>
            <IntentForm value="" onChange={noop} onSubmit={noop} loading={false} />
          </MusePanel>
        </Cell>
        <Cell title="Panel — thinking">
          <MusePanel elements={[fxElement]} onClose={noop}>
            <IntentForm value="make this feel more premium" onChange={noop} onSubmit={noop} loading />
          </MusePanel>
        </Cell>

        <Cell title="Panel — clarifying questions">
          <MusePanel elements={[fxElement]} onClose={noop}>
            <ClarifyingQuestions
              questions={fxQuestions}
              answers={{}}
              onSelect={noop}
              onContinue={noop}
              loading={false}
              allAnswered={false}
            />
          </MusePanel>
        </Cell>
        <Cell title="Panel — questions answered">
          <MusePanel elements={[fxElement]} onClose={noop}>
            <ClarifyingQuestions
              questions={fxQuestions}
              answers={answers}
              onSelect={(qi, label) => setAnswers((a) => ({ ...a, [qi]: label }))}
              onContinue={noop}
              loading={false}
              allAnswered
            />
          </MusePanel>
        </Cell>

        <Cell title="Panel — batch (3 elements)">
          <MusePanel elements={[fxElement, fxElement2, { ...fxElement, key: 'x3', tag: 'p' }]} onClose={noop} onRemove={noop}>
            <IntentForm value="" onChange={noop} onSubmit={noop} loading={false} />
          </MusePanel>
        </Cell>

        <Cell title="Panel — proposed edit (multi-file pager)">
          <MusePanel elements={[fxElement, fxElement2]} onClose={noop} onRemove={noop}>
            <ProposedEdit
              edits={fxEdits}
              originals={fxOriginals}
              rationale={fxRationale}
              applied={false}
              loading={false}
              onApprove={noop}
              onRefine={noop}
            />
          </MusePanel>
        </Cell>
        <Cell title="Panel — applied">
          <MusePanel elements={[fxElement, fxElement2]} mock onClose={noop} onRemove={noop}>
            <ProposedEdit
              edits={fxEdits}
              originals={fxOriginals}
              rationale={fxRationale}
              applied
              loading={false}
              onApprove={noop}
              onRefine={noop}
            />
          </MusePanel>
        </Cell>

        <Cell title="Panel — error">
          <MusePanel elements={[fxElement]} onClose={noop}>
            <IntentForm value="" onChange={noop} onSubmit={noop} loading={false} />
            <ErrorNote message="Muse did not return an action. Try rephrasing." />
          </MusePanel>
        </Cell>
        <Cell title="Panel — source not found">
          <MusePanel elements={[{ ...fxElement, fileName: '' }]} onClose={noop}>
            <UnmappableNote />
          </MusePanel>
        </Cell>
      </div>
    </div>
  )
}
