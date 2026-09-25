import { useEffect, useRef, useState } from 'react'
import { ArrowsClockwise } from 'lightweight-ui/icons'
import {
  Button,
  Loader,
  LoaderOverlay,
  PageLoader,
  ShareLegend,
  StatTile,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  optionColor,
  type LoaderSize,
  type LoaderVariant,
} from 'lightweight-ui'
import { Demo, KnobSegment, PageHeader, PropsTable, Section } from '../../ui/Demo'

const VARIANTS: LoaderVariant[] = ['pixel', 'dots', 'spinner', 'bar']
const SIZES: LoaderSize[] = ['sm', 'md', 'lg']

/** A fake request that settles after `ms`. */
function useFakeLoad() {
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  const run = (ms: number) => {
    if (timer.current) clearTimeout(timer.current)
    setLoading(true)
    timer.current = setTimeout(() => setLoading(false), ms)
  }
  return [loading, run] as const
}

export default function LoadersPage() {
  const [variant, setVariant] = useState<LoaderVariant>('pixel')
  const [size, setSize] = useState<LoaderSize>('md')
  const [cardLoading, refreshCard] = useFakeLoad()
  const [pageLoading, loadPage] = useFakeLoad()
  const [saving, save] = useFakeLoad()

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Loaders"
        description="Show that something is on its way. Use Loader inside a component, LoaderOverlay over a card or panel while it refreshes, and PageLoader when moving between pages. All three wait a moment before appearing, so a fast load shows nothing at all."
      />

      <Section id="loader" title="Loader" description="Four shapes for different places. Each takes the colour of the text around it, and screen readers hear its label once.">
        <Demo
          code={`<Loader variant="${variant}" size="${size}" label="Loading results" />`}
          controls={
            <>
              <KnobSegment label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
              <KnobSegment label="size" value={size} options={SIZES} onChange={setSize} />
            </>
          }
        >
          <div className={variant === 'bar' ? 'w-full max-w-xs' : ''}>
            <Loader variant={variant} size={size} label="Loading results" className="text-ink" />
          </div>
        </Demo>
        <Table>
          <THead>
            <TR>
              <TH className="w-[120px]">Variant</TH>
              <TH>Use it for</TH>
            </TR>
          </THead>
          <TBody>
            {[
              ['pixel', 'The default. A 3×3 grid that brightens in a diagonal wave, like the pixel typeface.'],
              ['dots', 'Inline, next to text: “Saving…”, “Opening your workspace…”.'],
              ['spinner', 'Inside buttons, where it replaces the icon without changing the width.'],
              ['bar', 'Along the top edge of a card or panel that is fetching more.'],
            ].map(([v, d]) => (
              <TR key={v}>
                <TD>
                  <span className="inline-flex items-center gap-3">
                    <span className="grid w-6 place-items-center">
                      {v === 'bar' ? <span className="w-6"><Loader variant="bar" size="sm" label={`${v} loader`} className="text-ink" /></span> : <Loader variant={v as LoaderVariant} size="sm" label={`${v} loader`} className="text-ink" />}
                    </span>
                    <code className="font-mono text-caption font-medium">{v}</code>
                  </span>
                </TD>
                <TD className="text-label text-muted">{d}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section
        id="components"
        title="In a component"
        description="While a card or panel refreshes, keep the old content where it is. LoaderOverlay dims it, stops it taking clicks and puts a loader on top, so nothing jumps. Buttons show their own spinner."
      >
        <Demo
          code={`<LoaderOverlay loading={loading} label="Refreshing results">
  <ResultsCard />
</LoaderOverlay>

<Button loading={saving}>Save changes</Button>`}
          className="flex-col gap-5"
        >
          <LoaderOverlay loading={cardLoading} label="Refreshing results" className="w-full max-w-sm">
            <div className="rounded-panel bg-card p-5 shadow-card">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-ui font-semibold">Checkout redesign</p>
                <span className="text-caption text-muted">99 votes</span>
              </div>
              <ShareLegend
                className="mt-4"
                slices={[
                  { id: 'a', label: 'One page', value: 38, color: optionColor(0) },
                  { id: 'b', label: 'Two steps', value: 61, color: optionColor(1) },
                ]}
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <StatTile label="Median time" value="1m 12s" />
                <StatTile label="Completion" value="94%" />
              </div>
            </div>
          </LoaderOverlay>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" size="md" leadingIcon={<ArrowsClockwise size={15} aria-hidden="true" />} onClick={() => refreshCard(1600)}>
              Refresh results
            </Button>
            <Button size="md" loading={saving} onClick={() => save(1400)}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Demo>
      </Section>

      <Section
        id="pages"
        title="Between pages"
        description="PageLoader is a thin bar across the top of the window. It moves quickly at first, slows as it goes, and runs to the end when the page arrives. It never covers the page, so you can keep reading. This site uses it when you switch pages."
      >
        <Demo
          code={`const [loading, setLoading] = useState(false)

<PageLoader active={loading} />`}
        >
          <Button variant="secondary" size="md" onClick={() => loadPage(1800)}>
            Load a slow page
          </Button>
          <Button variant="ghost" size="md" onClick={() => loadPage(80)}>
            Load a fast page
          </Button>
          <p className="basis-full text-center text-label text-pretty text-muted">
            {pageLoading ? 'Loading… watch the top edge of the window.' : 'The fast page loads in 80ms, before the bar would appear, so you see nothing.'}
          </p>
        </Demo>
        <PageLoader active={pageLoading} />
      </Section>

      <Section id="timing" title="Timing" description="A loader that flashes on and off looks like a glitch. useLoading, which all three use, handles the timing for you.">
        <Table>
          <THead>
            <TR>
              <TH className="w-[180px]">Rule</TH>
              <TH>Why</TH>
            </TR>
          </THead>
          <TBody>
            {[
              ['Wait 150ms', 'Most loads finish sooner. Showing nothing is better than a loader that blinks.'],
              ['Stay 400ms', 'Once a loader appears, it stays long enough to be read as a loader, not a flicker.'],
              ['Keep the layout', 'Overlays sit on top of the old content, and buttons keep their width.'],
              ['Say what’s loading', 'Give each loader a label, like “Refreshing results”. Screen readers hear it once.'],
            ].map(([r, d]) => (
              <TR key={r}>
                <TD className="font-medium">{r}</TD>
                <TD className="text-label text-muted">{d}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Loader"
          rows={[
            { name: 'variant', type: "'pixel' | 'dots' | 'spinner' | 'bar'", default: "'pixel'", description: 'The shape. See the table above for where each one fits.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'For bar, sm and md are 2px tall and lg is 4px.' },
            { name: 'label', type: 'string', default: "'Loading'", description: 'What screen readers hear. Say what is loading.' },
          ]}
        />
        <PropsTable
          title="LoaderOverlay"
          rows={[
            { name: 'loading', type: 'boolean', description: 'While true, the content dims, stops taking input and shows a loader.' },
            { name: 'label', type: 'string', default: "'Loading'", description: 'What screen readers hear.' },
            { name: 'variant', type: "'pixel' | 'dots' | 'spinner'", default: "'pixel'", description: 'The loader shown on top.' },
            { name: 'delay', type: 'number', default: '150', description: 'How long to wait before covering anything, in milliseconds.' },
          ]}
        />
        <PropsTable
          title="PageLoader · useLoading"
          rows={[
            { name: 'PageLoader.active', type: 'boolean', description: 'True while the next page loads.' },
            { name: 'PageLoader.delay', type: 'number', default: '120', description: 'How long to wait before showing the bar, in milliseconds.' },
            { name: 'useLoading(active, opts)', type: '{ delay?, minVisible? } → boolean', default: '150 / 400', description: 'Whether a loader should be on screen right now. Use it for your own loaders.' },
          ]}
        />
      </Section>
    </>
  )
}
