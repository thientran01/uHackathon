import { useState, type ReactNode } from 'react'
import { ActiveTargetStrip } from './components/ActiveTargetStrip'
import { Composer } from './components/Composer'
import { MuseFab } from './components/MuseFab'
import { MusePanel } from './components/MusePanel'
import {
  HoverHighlight,
  SelectBanner,
  SelectionTray,
} from './components/SelectionOverlay'
import { MessageApplied } from './components/messages/MessageApplied'
import { MessageClarify } from './components/messages/MessageClarify'
import { MessageOptionSet } from './components/messages/MessageOptionSet'
import { MessageTargetHandoff } from './components/messages/MessageTargetHandoff'
import { MessageThinking } from './components/messages/MessageThinking'
import { MessageUser } from './components/messages/MessageUser'
import { UfoIcon } from './components/UfoIcon'
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

// Wraps a bubble preview in a slim panel-like container so it reads the way
// it would in the real overlay. Not the full MusePanel — just chrome.
function ThreadFrame({ target, children }: { target: SelectedElement; children: ReactNode }) {
  return (
    <MusePanel onClose={noop}>
      <ActiveTargetStrip elements={[target]} mock />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3.5">{children}</div>
      <Composer value="" onChange={noop} onSubmit={noop} loading={false} />
    </MusePanel>
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
          <UfoIcon size={22} className="text-accent" /> Muse — UI states
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

        <Cell title="Composer — empty">
          <div className="w-[380px] rounded-2xl bg-surface ring-1 ring-line/10">
            <Composer value="" onChange={noop} onSubmit={noop} loading={false} />
          </div>
        </Cell>
        <Cell title="Composer — typing">
          <div className="w-[380px] rounded-2xl bg-surface ring-1 ring-line/10">
            <Composer value="make this feel more premium" onChange={noop} onSubmit={noop} loading={false} />
          </div>
        </Cell>

        <Cell title="Thread — empty + user message">
          <ThreadFrame target={fxElement}>
            <MessageUser text="make this feel more premium" />
            <MessageThinking />
          </ThreadFrame>
        </Cell>

        <Cell title="Thread — clarify (active)">
          <ThreadFrame target={fxElement}>
            <MessageUser text="make this feel more premium" />
            <MessageClarify
              questions={fxQuestions}
              answers={{}}
              onSelect={noop}
              onContinue={noop}
              loading={false}
              allAnswered={false}
              active
            />
          </ThreadFrame>
        </Cell>

        <Cell title="Thread — clarify (answered, inactive)">
          <ThreadFrame target={fxElement}>
            <MessageUser text="make this feel more premium" />
            <MessageClarify
              questions={fxQuestions}
              answers={answers}
              onSelect={(qi, label) => setAnswers((a) => ({ ...a, [qi]: label }))}
              onContinue={noop}
              loading={false}
              allAnswered
              active={false}
            />
          </ThreadFrame>
        </Cell>

        <Cell title="Thread — proposed option (active, multi-file)">
          <ThreadFrame target={fxElement}>
            <MessageUser text="make this feel more premium" />
            <MessageOptionSet
              edits={fxEdits}
              originals={fxOriginals}
              rationale={fxRationale}
              loading={false}
              onApprove={noop}
              active
            />
          </ThreadFrame>
        </Cell>

        <Cell title="Thread — applied">
          <ThreadFrame target={fxElement}>
            <MessageUser text="make this feel more premium" />
            <MessageOptionSet
              edits={fxEdits}
              originals={fxOriginals}
              rationale={fxRationale}
              loading={false}
              onApprove={noop}
              active={false}
            />
            <MessageApplied fileCount={fxEdits.length} rationale="" />
          </ThreadFrame>
        </Cell>

        <Cell title="Thread — target handoff mid-conversation">
          <ThreadFrame target={fxElement2}>
            <MessageUser text="punch up the heading" />
            <MessageTargetHandoff target={fxElement2} />
            <MessageUser text="now this button — make it pop" />
            <MessageThinking />
          </ThreadFrame>
        </Cell>

        <Cell title="Thread — error">
          <ThreadFrame target={fxElement}>
            <MessageUser text="..." />
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/20">
              Muse did not return an action. Try rephrasing.
            </p>
          </ThreadFrame>
        </Cell>

        <Cell title="Active target strip — batch">
          <div className="w-[380px] rounded-2xl bg-surface ring-1 ring-line/10">
            <ActiveTargetStrip
              elements={[fxElement, fxElement2, { ...fxElement, key: 'x3', tag: 'p' }]}
              mock={false}
              onRemove={noop}
            />
          </div>
        </Cell>
      </div>
    </div>
  )
}
