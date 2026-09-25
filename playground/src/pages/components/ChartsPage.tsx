import { useState } from 'react'
import {
  ChartCard,
  DistributionColumns,
  Dot,
  NominalBars,
  OPTION_COLORS,
  RATING_RAMP,
  ShareBar,
  ShareLegend,
  Slider,
  onColor,
  optionColor,
  ratingBuckets,
  sliderBuckets,
  type Slice,
} from 'lightweight-ui'
import { Caption, Demo, KnobSegment, PageHeader, PropsTable, Section } from '../../ui/Demo'

const OPTIONS = ['One page', 'Two steps', 'Express pay', 'Guest only'] as const
const LETTERS = ['A', 'B', 'C', 'D'] as const

const slicesOf = (values: number[]): Slice[] =>
  values.map((value, i) => ({ id: LETTERS[i].toLowerCase(), label: `${LETTERS[i]} · ${OPTIONS[i]}`, value, color: optionColor(i) }))

const RULE_SLICES = slicesOf([38, 61, 29])
const RULE_RATINGS = ratingBuckets({ 1: 3, 2: 7, 3: 22, 4: 58, 5: 31 })
const RULE_NOMINAL = [
  { label: 'Speed', value: 74 },
  { label: 'Fewer fields', value: 51 },
  { label: 'Trust badges', value: 18 },
]

const SHAPES = {
  clustered: { 1: 3, 2: 7, 3: 22, 4: 58, 5: 31 },
  polarised: { 1: 41, 2: 9, 3: 6, 4: 12, 5: 47 },
  flat: { 1: 19, 2: 22, 3: 20, 4: 21, 5: 18 },
  'no 1★': { 2: 4, 3: 18, 4: 40, 5: 26 },
} satisfies Record<string, Record<string, number>>
type Shape = keyof typeof SHAPES

const SLIDER_ANSWERS = { 8: 2, 22: 5, 35: 9, 48: 14, 55: 11, 62: 17, 71: 21, 78: 12, 86: 6, 95: 3 }

export default function ChartsPage() {
  const [count, setCount] = useState<'2' | '3' | '4'>('3')
  const [votes, setVotes] = useState([38, 61, 29, 12])
  const [mine, setMine] = useState<'none' | 'A' | 'B' | 'C' | 'D'>('B')
  const [shape, setShape] = useState<Shape>('clustered')

  const n = Number(count)
  const slices = slicesOf(votes.slice(0, n))
  const total = slices.reduce((s, x) => s + x.value, 0)
  const top = Math.max(...slices.map((s) => s.value))
  const leaders = slices.filter((s) => s.value === top)
  // A tie has no leader — say so, rather than crowning whichever came first.
  const leadId = top > 0 && leaders.length === 1 ? leaders[0].id : null
  const mineId = mine === 'none' || LETTERS.indexOf(mine) >= n ? null : mine.toLowerCase()

  const code = `const slices = [
${slices.map((s, i) => `  { id: '${s.id}', label: '${s.label}', value: ${s.value}, color: optionColor(${i}) },`).join('\n')}
]

<ChartCard title="Which checkout felt fastest?" meta="${total} votes">
  <ShareBar slices={slices} />
  <ShareLegend slices={slices}${leadId === null ? ' leadId={null}' : ''}${mineId ? ` mineId="${mineId}"` : ''} className="mt-4" />
</ChartCard>`

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Charts"
        description="A small set of charts for showing results. Bars and columns are a chunky 28px with 10px corners. Every value is written next to its bar, and colour does one job per chart."
      />

      <Section
        id="one-job"
        title="Colour does one job"
        description="Before you pick a chart, decide what colour is for. It can show which option a bar belongs to, or where a value sits in an order. Never both, and never just for decoration."
      >
        <Demo stage="none">
          <div className="pg-stage p-6 @container">
            <div className="grid gap-4 @3xl:grid-cols-3">
              <RuleCard
                rule="Identity"
                why="Each option gets its colour from its position, never its rank. A is always blue, even when B overtakes it."
              >
                <ShareBar slices={RULE_SLICES} />
                <ShareLegend slices={RULE_SLICES} className="mt-4" />
              </RuleCard>
              <RuleCard rule="Order" why="Ratings have an order, 1★ to 5★, so they use shades of one colour. Darker means a higher rating, and nothing else.">
                <DistributionColumns buckets={RULE_RATINGS} height={96} />
              </RuleCard>
              <RuleCard rule="Single colour" why="Multiple-choice answers have no order and no winner to track. Every bar uses the same colour, with no legend.">
                <NominalBars buckets={RULE_NOMINAL} total={128} />
              </RuleCard>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        id="playground"
        title="Playground"
        description="Drag the sliders until a different option leads. The colours stay put, and only the Leading tag moves. If colour followed rank, every option would change colour each time the lead changed, and the legend would stop making sense."
      >
        <Demo
          code={code}
          codeOpen
          controls={
            <>
              <KnobSegment
                label="options"
                value={count}
                options={['2', '3', '4'] as const}
                onChange={(c) => {
                  setCount(c)
                  if (mine !== 'none' && LETTERS.indexOf(mine) >= Number(c)) setMine('none')
                }}
              />
              {slices.map((s, i) => (
                <div key={s.id}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-label font-medium text-muted">
                    <Dot size={8} color={s.color} />
                    Option {LETTERS[i]} votes
                  </p>
                  <Slider
                    variant="compact"
                    min={0}
                    max={100}
                    value={s.value}
                    label={`Option ${LETTERS[i]} votes`}
                    onChange={(v) => setVotes((prev) => prev.map((x, j) => (j === i ? v : x)))}
                  />
                </div>
              ))}
              <KnobSegment label="mineId" value={mine} options={['none', ...LETTERS.slice(0, n)] as ('none' | 'A' | 'B' | 'C' | 'D')[]} onChange={setMine} />
            </>
          }
        >
          <ChartCard title="Which checkout felt fastest?" meta={`${total} ${total === 1 ? 'vote' : 'votes'}`} className="w-full max-w-md">
            <ShareBar slices={slices} />
            <ShareLegend slices={slices} leadId={leadId} mineId={mineId} className="mt-4" />
          </ChartCard>
        </Demo>
      </Section>

      <Section
        id="share-bar"
        title="Share bar"
        description="One bar, split to show each option's share of the total. With two to four options, it answers “what share went to B?” at a glance. A 3px gap separates each part, so neighbouring colours stay distinct without extra lines."
      >
        <Demo
          code={`<ShareBar slices={slices} />                // percentages inside marks ≥ 11% wide
<ShareBar slices={slices} unit="answer" />  // tooltip: "B · Two steps · 61 answers (48%)"
<ShareBar slices={[]} />                    // no votes yet: an empty track`}
        >
          <div className="w-full max-w-md space-y-5">
            <div>
              <ShareBar slices={slicesOf([52, 48])} />
              <Caption className="mt-2">A close split. Both parts show their percentage.</Caption>
            </div>
            <div>
              <ShareBar slices={slicesOf([81, 12, 7])} />
              <Caption className="mt-2">A part narrower than 11% hides its label instead of cutting it off. The tooltip and legend still show the value.</Caption>
            </div>
            <div>
              <ShareBar slices={slicesOf([0, 0, 0])} />
              <Caption className="mt-2">With no votes yet, it shows an empty track, never a fake even split.</Caption>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        id="share-legend"
        title="Share legend"
        description="A key and a table of values in one. The colour swatch shows which option it is, and the name and numbers give the values. The leading option is tagged in words, so people don't have to compare bar lengths. The viewer's own choice is tagged too."
      >
        <Demo
          code={`<ShareLegend slices={slices} mineId="c" />
<ShareLegend slices={tied} leadId={null} />  // a tie crowns nobody`}
          className="items-start gap-8"
        >
          <div className="w-full max-w-[280px]">
            <ShareLegend slices={slicesOf([38, 61, 29])} mineId="c" />
            <Caption className="mt-3">By default, the largest value is tagged Leading.</Caption>
          </div>
          <div className="w-full max-w-[280px]">
            <ShareLegend slices={slicesOf([44, 44, 12])} leadId={null} />
            <Caption className="mt-3">On a tie, pass leadId=&#123;null&#125;. Otherwise the first option gets the tag.</Caption>
          </div>
        </Demo>
      </Section>

      <Section
        id="distribution"
        title="Distribution columns"
        description="Columns for answers that have an order, such as ratings. The overall shape tells the story, like “most people chose 4”. Each column sits in a full-height track of its own colour. The tracks frame the chart without an axis, and a value nobody chose shows as an empty track."
      >
        <Demo
          title="Ratings"
          description="ratingBuckets() always returns all five ratings, because a rating nobody chose is worth showing."
          code={`<DistributionColumns buckets={ratingBuckets(question.distribution)} unit="rating" />`}
          controls={<KnobSegment label="shape" value={shape} options={Object.keys(SHAPES) as Shape[]} onChange={setShape} />}
        >
          <div className="w-full max-w-sm">
            <DistributionColumns buckets={ratingBuckets(SHAPES[shape])} unit="rating" />
          </div>
        </Demo>
        <Demo
          title="Slider answers"
          description="sliderBuckets() groups slider answers into five equal ranges, so they have a shape too. They use the same shades, because a scale still has an order."
          code={`// { "8": 2, "22": 5, "35": 9, … } — value → how many people chose it
<DistributionColumns buckets={sliderBuckets(question.distribution, 0, 100)} unit="answer" />`}
        >
          <div className="w-full max-w-sm">
            <DistributionColumns buckets={sliderBuckets(SLIDER_ANSWERS, 0, 100)} />
          </div>
        </Demo>
      </Section>

      <Section
        id="nominal"
        title="Nominal bars"
        description="Bars for answers with no order, such as a multiple-choice question. Every bar uses one colour, with no legend. A bar's length is its share of everyone who answered, so a full track is 100%. When people can pick more than one answer, the shares add up to more than 100%. That's expected."
      >
        <Demo
          code={`<NominalBars
  total={128}   // respondents, not the sum of picks
  buckets={[
    { label: 'Speed', value: 74 },
    { label: 'Fewer fields', value: 51 },
    { label: 'Trust badges', value: 18 },
    { label: 'Saved cards', value: 9 },
  ]}
/>`}
        >
          <div className="w-full max-w-md">
            <NominalBars total={128} buckets={[...RULE_NOMINAL, { label: 'Saved cards', value: 9 }]} />
          </div>
        </Demo>
      </Section>

      <Section
        id="palettes"
        title="Palettes"
        description="Both palettes are checked for contrast, not chosen by eye. Two option colours fall below 3:1 contrast against white. That's acceptable only because every value is also written next to its bar, not just shown on hover. Text on a coloured bar gets its colour from onColor(), which picks ink or white, whichever is easier to read. That's why labels on the bright blue and the amber are in ink."
      >
        <Demo
          code={`import { OPTION_COLORS, RATING_RAMP, optionColor, onColor } from 'lightweight-ui'

optionColor(0)   // '#277fff' — A, always
optionColor(5)   // wraps: '#1baf7a'
onColor('#eda100') // '#18191d' — ink on amber

// Also published as CSS: var(--color-chart-1…4), var(--color-ramp-1…5)`}
          stage="plain"
        >
          <div className="w-full space-y-6">
            <div>
              <p className="mb-2 text-label font-medium text-muted">OPTION_COLORS: one per option, by position</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {OPTION_COLORS.map((c, i) => (
                  <div key={c} className="overflow-hidden rounded-2xl bg-ink/[0.03]">
                    <div className="flex h-14 items-center px-3 text-ui font-semibold" style={{ background: c, color: onColor(c) }}>
                      {LETTERS[i]}
                    </div>
                    <p className="px-3 py-2 font-mono text-caption text-muted">{c}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-label font-medium text-muted">RATING_RAMP: for ordered values, light to dark</p>
              <div className="grid grid-cols-5 gap-2">
                {RATING_RAMP.map((c, i) => (
                  <div key={c} className="overflow-hidden rounded-2xl bg-ink/[0.03]">
                    <div className="flex h-14 items-center px-3 text-ui font-semibold" style={{ background: c, color: onColor(c) }}>
                      {i + 1}★
                    </div>
                    <p className="truncate px-3 py-2 font-mono text-caption text-muted">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="ShareBar"
          rows={[
            { name: 'slices', type: 'Slice[]', description: '{ id, label, value, color }. Get each colour from optionColor(index).' },
            { name: 'total', type: 'number', default: 'sum of values', description: 'The total that each share is measured against.' },
            { name: 'unit', type: 'string', default: "'vote'", description: 'The noun in the tooltip. An s is added for plurals.' },
          ]}
        />
        <PropsTable
          title="ShareLegend"
          rows={[
            { name: 'slices', type: 'Slice[]', description: 'The same slices as the bar.' },
            { name: 'total', type: 'number', default: 'sum of values', description: 'The total the percentages are based on.' },
            { name: 'leadId', type: 'string | null', default: 'largest', description: 'The option tagged Leading. Pass null for no tag, such as on a tie.' },
            { name: 'mineId', type: 'string | null', description: 'The viewer’s own pick, tagged “Your pick”.' },
          ]}
        />
        <PropsTable
          title="DistributionColumns"
          rows={[
            { name: 'buckets', type: '{ label: string; value: number }[]', description: 'Groups in order, from ratingBuckets() or sliderBuckets().' },
            { name: 'ramp', type: 'readonly string[]', default: 'RATING_RAMP', description: 'One colour per column, light to dark.' },
            { name: 'unit', type: 'string', default: "'answer'", description: 'The noun in the tooltip.' },
            { name: 'height', type: 'number', default: '132', description: 'Track height in px. The largest value fills it.' },
          ]}
        />
        <PropsTable
          title="NominalBars"
          rows={[
            { name: 'buckets', type: '{ label: string; value: number }[]', description: 'One bar per item, in the order given.' },
            { name: 'total', type: 'number', description: 'The number of people who answered, which is 100% of each track. Always pass it. Without it, bars are sized relative to the largest.' },
            { name: 'color', type: 'string', default: 'OPTION_COLORS[0]', description: 'The colour for every bar.' },
          ]}
        />
        <PropsTable
          title="Helpers"
          rows={[
            { name: 'optionColor(index)', type: '(number) => string', description: 'The colour for an option, by its position, never its vote count. Starts again after four.' },
            { name: 'ratingBuckets(dist)', type: '(Record<string, number>) => Bucket[]', description: 'Always returns five groups, 1★ to 5★, including any with zero.' },
            { name: 'sliderBuckets(dist, min?, max?)', type: '(Record<string, number>, number, number) => Bucket[]', description: 'Groups slider answers into five equal ranges. The scale defaults to 0–100.' },
            { name: 'OPTION_COLORS', type: 'readonly string[4]', description: 'The four option colours.' },
            { name: 'RATING_RAMP', type: 'readonly string[5]', description: 'Five shades of one blue, light to dark.' },
          ]}
        />
      </Section>
    </>
  )
}

function RuleCard({ rule, why, children }: { rule: string; why: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-panel bg-card p-5 shadow-card">
      <p className="text-label font-semibold uppercase tracking-wide text-muted">{rule}</p>
      <div className="mt-4 flex-1">{children}</div>
      <p className="mt-5 border-t border-line pt-3 text-label leading-relaxed text-muted">{why}</p>
    </div>
  )
}
