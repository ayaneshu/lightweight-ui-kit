import { useEffect, useRef, useState } from 'react'
import { ArrowClockwise, ArrowDown, CaretRight } from 'lightweight-ui/icons'
import {
  Button,
  ChartCard,
  ChoiceRow,
  cn,
  Count,
  DistributionColumns,
  Eyebrow,
  HeaderChip,
  Heading,
  HeroPanel,
  LetterBadge,
  Lightbox,
  OptionCard,
  optionColor,
  Overline,
  Rating,
  ratingBuckets,
  ShareBar,
  ShareLegend,
  SuccessMark,
  Text,
  ZoomableImage,
  type Slice,
} from 'lightweight-ui'
import { Demo, PageHeader, Section } from '../../ui/Demo'

const thumb = (n: number) => `./thumbnails/ascii-${n}.webp`

type Step = 'welcome' | 'compare' | 'done'

const STEPS: { value: Step; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'compare', label: 'Compare' },
  { value: 'done', label: 'Thank you' },
]

const FORM = {
  name: 'Checkout redesign',
  title: 'Which checkout feels faster?',
  body: 'We rebuilt checkout two ways. Look at both, pick the one you’d rather pay with, and tell us how it felt.',
  question: 'How would you rate the one you picked?',
}

const OPTIONS = [
  { id: 'a', letter: 'A', name: 'One-page checkout', description: 'Address, delivery and payment on a single scroll.', src: thumb(2) },
  { id: 'b', letter: 'B', name: 'Two-step checkout', description: 'Address first, then delivery and payment.', src: thumb(4) },
]

/** Everyone who voted before this voter. */
const PRIOR_VOTES: Record<string, number> = { a: 27, b: 15, tie: 6 }
const PRIOR_RATINGS: Record<string, number> = { '1': 1, '2': 3, '3': 8, '4': 18, '5': 11 }

export default function Voting() {
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Voting flow"
        description="What a voter sees after opening a shared link. A welcome screen sets out the question, each comparison gets its own screen, and a thank-you screen shows how everyone else voted, if the creator allows it. Screens appear one at a time, and each one rises in as the last one leaves."
      />

      <Section
        id="flow"
        title="Welcome, compare, thank you"
        description="Each screen is one step in a small state machine. The step bar above the screen is only part of this demo. Use it to jump to any step."
      >
        <Demo stage="none" code={FLOW_CODE}>
          <VotingFlow />
        </Demo>
        <Notes
          items={[
            'The welcome screen is split in two: text on the left, the form’s hero image on the right. The hero is the first thing voters look at, so it gets half the screen and a corner button to view it full size.',
            'The compare screen puts the question and the answers on the left (40%) and the options on the right (60%). The options are what voters came to see. The question sits beside them, not above, so a tall image can’t push it off screen.',
            'Hovering an option lifts it and dims the other to 35%, so it’s clear which one you’re looking at. Dimming follows the pointer, not the answer. A picked option is marked as selected but the other isn’t greyed out, so voters can still change their mind.',
            '“Both feel equal” is a full-width ChoiceRow under the options. It’s an answer with no image, so it doesn’t get an empty card next to the real ones.',
            'Submit stays disabled until the voter picks an option. With nothing to record yet, blocking the button is clearer than showing an error after the click.',
            'The thank-you screen opens with a SuccessMark that pops once, then shows the live results. The voter’s own pick is marked in the legend.',
          ]}
        />
      </Section>
    </>
  )
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-ui leading-relaxed text-muted marker:text-line-strong">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ Flow */

function VotingFlow() {
  const [step, setStep] = useState<Step>('welcome')
  const [hovered, setHovered] = useState<string | null>(null)
  const [pick, setPick] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [busy, setBusy] = useState(false)
  const [heroOpen, setHeroOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  function go(next: Step) {
    setHovered(null)
    setStep(next)
    scroller.current?.scrollTo({ top: 0 })
  }

  function submit() {
    setBusy(true)
    timer.current = setTimeout(() => {
      setBusy(false)
      go('done')
    }, 700)
  }

  function restart() {
    setPick(null)
    setRating(0)
    go('welcome')
  }

  const reached = STEPS.findIndex((s) => s.value === step)

  return (
    <div>
      {/* Demo control, not part of the screen. */}
      <nav aria-label="Voting steps" className="flex flex-wrap items-center gap-1 border-b border-line bg-ink/[0.015] px-3 py-2">
        {STEPS.map((s, i) => (
          <div key={s.value} className="flex items-center gap-1">
            {i > 0 && <CaretRight size={12} aria-hidden="true" className="text-muted" />}
            <button
              type="button"
              onClick={() => go(s.value)}
              aria-current={step === s.value ? 'step' : undefined}
              className={cn(
                'u-press flex items-center gap-2 rounded-lg px-2 py-1 text-label font-medium transition-colors hover:bg-ink/[0.04]',
                step === s.value ? 'text-ink' : 'text-muted',
              )}
            >
              <LetterBadge letter={String(i + 1)} active={i <= reached} />
              {s.label}
            </button>
          </div>
        ))}
      </nav>

      <div ref={scroller} className="@container h-[600px] overflow-y-auto bg-bg">
        <div key={step} className="u-rise h-full">
          {step === 'welcome' && (
            <div className="grid min-h-full @3xl:h-full @3xl:grid-cols-2">
              <div className="flex flex-col justify-center px-8 py-12 @3xl:px-12">
                <Eyebrow className="truncate">{FORM.name}</Eyebrow>
                <Heading size="display" level={2} className="mt-1">
                  {FORM.title}
                </Heading>
                <Text size="body" tone="muted" relaxed className="mt-3 max-w-xl">
                  {FORM.body}
                </Text>
                <div className="mt-8">
                  <Button onClick={() => go('compare')}>Start</Button>
                  <Text size="label" tone="muted" className="mt-2.5">
                    Takes about 2 minutes
                  </Text>
                </div>
              </div>
              <HeroPanel bg="g-violet" src={thumb(1)} alt="The redesigned checkout" className="h-[300px] @3xl:h-full" onExpand={() => setHeroOpen(true)} />
              <Lightbox open={heroOpen} onClose={() => setHeroOpen(false)} src={thumb(1)} alt="The redesigned checkout" caption={FORM.name} />
            </div>
          )}

          {step === 'compare' && (
            <div className="grid min-h-full @3xl:h-full @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              {/* Narrow: the question leads, then the options, then the answer and the way on. */}
              <div className="px-6 pt-8 @3xl:hidden">
                <CompareHeading />
              </div>

              <div className="order-2 flex flex-col justify-center px-6 py-8 @3xl:order-1 @3xl:overflow-y-auto @3xl:px-10">
                <div className="hidden @3xl:block">
                  <CompareHeading />
                </div>

                <div className="mt-6">
                  <Text size="body" weight="semibold">
                    {FORM.question}
                  </Text>
                  <Text size="label" tone="muted" className="mt-0.5">
                    1 means “I’d give up”, 5 means “effortless”.
                  </Text>
                  <Rating value={rating} onChange={setRating} className="mt-3" />
                </div>

                <div className="mt-8 flex items-center gap-2.5">
                  <Button variant="secondary" onClick={() => go('welcome')} disabled={busy}>
                    Back
                  </Button>
                  <Button onClick={submit} disabled={!pick} loading={busy}>
                    {busy ? 'Submitting…' : 'Submit'}
                  </Button>
                  <span className="ml-auto text-label tabular-nums text-muted">1 of 1</span>
                </div>
              </div>

              <div className="order-1 bg-ink/[0.04] p-4 @3xl:order-2 @3xl:overflow-y-auto @3xl:p-6">
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                  {OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      letter={o.letter}
                      title={o.name}
                      description={o.description}
                      headerAction={<HeaderChip icon={<ArrowDown size={12} aria-hidden="true" />}>Tap to zoom</HeaderChip>}
                      selected={pick === o.id}
                      lifted={hovered === o.id}
                      dimmed={hovered !== null && hovered !== o.id}
                      onSelect={() => setPick(o.id)}
                      selectDisabled={busy}
                      onHoverChange={(on) => setHovered(on ? o.id : null)}
                    >
                      <ZoomableImage src={o.src} alt={o.name} caption={`${o.letter} · ${o.name}`} />
                    </OptionCard>
                  ))}
                </div>
                <ChoiceRow
                  className="mt-4"
                  label="Both feel equal"
                  selected={pick === 'tie'}
                  disabled={busy}
                  onClick={() => setPick('tie')}
                  // A tie is about all of them, so it lifts nothing in particular.
                  onMouseEnter={() => setHovered(null)}
                />
              </div>
            </div>
          )}

          {step === 'done' && <ThankYou pick={pick} rating={rating} onRestart={restart} />}
        </div>
      </div>
    </div>
  )
}

function CompareHeading() {
  return (
    <>
      <Eyebrow className="truncate">{FORM.name}</Eyebrow>
      <Heading size="display-sm" level={2} className="mt-1">
        {FORM.title}
      </Heading>
      <Text size="body" tone="muted" relaxed className="mt-3">
        Both use the same cart. Open an image to see it full size, then pick the one you’d rather pay with.
      </Text>
    </>
  )
}

function ThankYou({ pick, rating, onRestart }: { pick: string | null; rating: number; onRestart: () => void }) {
  const votes = { ...PRIOR_VOTES }
  if (pick) votes[pick] += 1
  const slices: Slice[] = [
    ...OPTIONS.map((o, i) => ({ id: o.id, label: o.name, value: votes[o.id], color: optionColor(i) })),
    { id: 'tie', label: 'Both feel equal', value: votes.tie, color: optionColor(OPTIONS.length) },
  ]
  const voted = slices.reduce((s, x) => s + x.value, 0)

  const ratings = { ...PRIOR_RATINGS }
  if (rating > 0) ratings[String(rating)] = (ratings[String(rating)] ?? 0) + 1
  const answered = Object.values(ratings).reduce((s, n) => s + n, 0)
  const average = Object.entries(ratings).reduce((s, [k, n]) => s + Number(k) * n, 0) / answered

  return (
    <div className="mx-auto w-full max-w-[640px] px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <SuccessMark />
        <Heading size="display" level={2} className="mt-6">
          Thanks — your feedback’s in.
        </Heading>
        <Text size="body" tone="muted" relaxed className="mt-3">
          Your answer has been counted. Here’s how everyone has voted so far.
        </Text>
        <Button variant="secondary" size="md" leadingIcon={<ArrowClockwise size={15} aria-hidden="true" />} onClick={onRestart} className="mt-6">
          Start over
        </Button>
      </div>

      <div className="mt-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Overline>Results so far</Overline>
          <Count value={voted} unit="responses" />
        </div>
        <ChartCard title={FORM.title} meta={`${voted} votes`}>
          <div className="space-y-3.5">
            <ShareBar slices={slices} total={voted} />
            <ShareLegend slices={slices} total={voted} mineId={pick} />
          </div>
        </ChartCard>
        <ChartCard title={FORM.question} meta={`Average ${average.toFixed(1)} · ${answered} answers`}>
          <DistributionColumns buckets={ratingBuckets(ratings)} unit="rating" />
        </ChartCard>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Code */

const FLOW_CODE = `const [step, setStep] = useState<'welcome' | 'compare' | 'done'>('welcome')

<div key={step} className="u-rise">            {/* each screen rises in as the last leaves */}
  {step === 'welcome' && (
    <div className="grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-12">
        <Eyebrow>Checkout redesign</Eyebrow>
        <Heading size="display">Which checkout feels faster?</Heading>
        <Text size="body" tone="muted" relaxed>…</Text>
        <Button onClick={() => setStep('compare')}>Start</Button>
        <Text size="label" tone="muted">Takes about 2 minutes</Text>
      </div>
      <HeroPanel bg="g-violet" src={hero} className="h-full" onExpand={openLightbox} />
    </div>
  )}

  {step === 'compare' && (
    <div className="grid lg:grid-cols-[2fr_3fr]">
      <div>
        <Heading size="display-sm">…</Heading>
        <Rating value={rating} onChange={setRating} />
        <Button variant="secondary">Back</Button>
        <Button disabled={!pick} loading={busy} onClick={submit}>Submit</Button>
        <span>1 of 1</span>
      </div>
      <div className="bg-ink/[0.04] p-6">
        {options.map((o) => (
          <OptionCard
            letter={o.letter} title={o.name} description={o.description}
            headerAction={<HeaderChip icon={<ArrowDown size={12} />}>tap to zoom</HeaderChip>}
            selected={pick === o.id}
            lifted={hovered === o.id}
            dimmed={hovered !== null && hovered !== o.id}
            onHoverChange={(on) => setHovered(on ? o.id : null)}
            onSelect={() => setPick(o.id)}
          >
            <ZoomableImage src={o.src} alt={o.name} />
          </OptionCard>
        ))}
        <ChoiceRow label="Both feel equal" selected={pick === 'tie'} onClick={() => setPick('tie')} />
      </div>
    </div>
  )}

  {step === 'done' && (
    <>
      <SuccessMark />
      <Heading size="display">Thanks — your feedback’s in.</Heading>
      <Overline>Results so far</Overline>
      <ChartCard title="Which checkout feels faster?" meta="49 votes">
        <ShareBar slices={slices} />
        <ShareLegend slices={slices} mineId={pick} />
      </ChartCard>
      <ChartCard title="How would you rate the one you picked?" meta="Average 3.8 · 42 answers">
        <DistributionColumns buckets={ratingBuckets(ratings)} unit="rating" />
      </ChartCard>
    </>
  )}
</div>`
