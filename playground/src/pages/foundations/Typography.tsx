import { useState } from 'react'
import { Eyebrow, Heading, Overline, Table, TBody, TD, Text, TH, THead, tokens, TR } from 'lightweight-ui'
import { Demo, KnobSegment, KnobText, PageHeader, PropsTable, ScrollTable, Section } from '../../ui/Demo'

const { typeScale, fontWeights } = tokens

export default function Typography() {
  const [sample, setSample] = useState('Structured feedback, built in minutes.')
  const [size, setSize] = useState<'figure' | 'display-lg' | 'display' | 'display-sm' | 'title' | 'subtitle'>('display-lg')

  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Typography"
        description="Two typefaces, one rule. Geist sets the interface: every label, control and number. Geist Pixel Square is for display, and it only appears above 20px."
      />

      <Section id="faces" title="Typefaces">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-panel p-6 bg-ink/[0.03]">
            <p className="font-pixel text-[64px] font-medium leading-none tracking-tight">Aa</p>
            <p className="mt-5 text-title font-semibold">Geist Pixel Square</p>
            <p className="mt-1 text-label leading-relaxed text-muted">
              For display. It has one weight (500). The kit sets titles with <code className="font-mono">font-semibold</code>, which makes the browser thicken it. Its square shapes hold up in a 40px heading but blur together at small sizes.
            </p>
            <p className="mt-4 font-pixel text-body tracking-wide text-muted">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
            <code className="mt-3 block font-mono text-caption text-muted">font-pixel · var(--font-pixel)</code>
          </div>
          <div className="rounded-panel p-6 bg-ink/[0.03]">
            <p className="text-[64px] font-semibold leading-none tracking-tight">Aa</p>
            <p className="mt-5 text-title font-semibold">Geist</p>
            <p className="mt-1 text-label leading-relaxed text-muted">
              For the interface. A variable font with weights from 100 to 900. The kit uses 400, 500 and 600. Anything you can press defaults to Medium (500). Numbers that need to line up use tabular (fixed-width) figures.
            </p>
            <p className="mt-4 text-body tracking-wide text-muted">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
            <code className="mt-3 block font-mono text-caption text-muted">font-sans · var(--font-sans)</code>
          </div>
        </div>
      </Section>

      <Section
        id="rule"
        title="The 20px rule"
        description="By default, base.css sets every <h1>–<h6> in the pixel face. Headings of 20px or smaller switch back to Geist with font-sans. A 17px dialog title in the pixel face looks like a rendering bug, not a style choice."
      >
        <Demo stage="plain" className="flex-col items-stretch gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-open">Do: 17px in Geist</p>
              <div className="rounded-panel p-5 bg-ink/[0.03]">
                <h3 className="font-sans text-title font-semibold tracking-tight">Delete this page?</h3>
                <p className="mt-1.5 text-ui leading-relaxed text-muted">Its options and inputs go with it.</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-danger">Don’t: 17px in Geist Pixel</p>
              <div className="rounded-panel p-5 bg-ink/[0.03]">
                <h3 className="font-pixel text-title font-medium tracking-tight">Delete this page?</h3>
                <p className="mt-1.5 text-ui leading-relaxed text-muted">Its options and inputs go with it.</p>
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="scale" title="Type scale" description="Sizes are named for what they do, not how big they are. Use each one as a Tailwind font size (text-label, text-ui) or as a CSS variable (var(--text-label)).">
        <ScrollTable label="Type scale">
          <Table className="min-w-[560px] table-fixed">
            <THead>
              <TR>
                <TH className="w-[140px]">Token</TH>
                <TH>Sample</TH>
                <TH className="w-[220px]">Used for</TH>
              </TR>
            </THead>
            <TBody>
              {typeScale.map((t) => (
                <TR key={t.token}>
                  <TD className="align-middle">
                    <p className="font-mono text-caption font-medium">text-{t.token}</p>
                    <p className="text-caption text-muted">
                      {t.size}px · {t.weight}
                    </p>
                  </TD>
                  <TD className="align-middle">
                    <p
                      className="truncate tracking-tight"
                      style={{
                        fontSize: Math.min(t.size, 52),
                        lineHeight: t.lineHeight,
                        fontWeight: t.font === 'pixel' ? 500 : t.weight,
                        fontFamily: t.font === 'pixel' ? 'var(--font-pixel)' : 'var(--font-sans)',
                      }}
                    >
                      {t.font === 'pixel' ? (t.token === 'figure' ? '48' : 'Forms') : 'Compare prototypes, rate, choose'}
                    </p>
                  </TD>
                  <TD className="align-middle text-label leading-snug text-muted">{t.use}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ScrollTable>
      </Section>

      <Section id="weights" title="Weights">
        <div className="grid gap-3 sm:grid-cols-4">
          {fontWeights.map((w) => (
            <div key={w.value} className="rounded-2xl bg-ink/[0.03] p-4">
              <p className="text-[28px] leading-none" style={{ fontWeight: w.value }}>
                Ag
              </p>
              <p className="mt-3 text-ui font-semibold">
                {w.name} <span className="font-normal text-muted">{w.value}</span>
              </p>
              <p className="mt-0.5 text-label text-muted">{w.use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="components" title="Components" description="Heading chooses the typeface from its size, so you don’t have to remember the 20px rule. Text, Overline and Eyebrow cover everything else.">
        <Demo
          code={`<Heading size="${size}">${sample}</Heading>`}
          stage="plain"
          className="justify-start"
          controls={
            <>
              <KnobSegment label="size" value={size} options={['figure', 'display-lg', 'display', 'display-sm', 'title', 'subtitle'] as const} onChange={setSize} />
              <KnobText label="children" value={sample} onChange={setSample} />
            </>
          }
        >
          <Heading size={size} level={3} className="max-w-full">
            {sample}
          </Heading>
        </Demo>
        <Demo
          stage="plain"
          className="flex-col items-start gap-5"
          code={`<Eyebrow>Your workspace</Eyebrow>
<Heading size="display-lg">Forms</Heading>
<Overline>Results so far</Overline>
<Text size="body" tone="muted" relaxed>Share the voter link to start collecting feedback.</Text>
<Text size="label" tone="danger">Give the form a name.</Text>`}
        >
          <div>
            <Eyebrow>Your workspace</Eyebrow>
            <Heading size="display-lg" level={3} className="mt-1">
              Forms
            </Heading>
          </div>
          <Overline>Results so far</Overline>
          <Text size="body" tone="muted" relaxed>
            Share the voter link to start collecting feedback.
          </Text>
          <Text size="label" tone="danger">
            Give the form a name.
          </Text>
          <Text size="ui" numeric weight="semibold">
            1,284 · 96% · 4.0
          </Text>
        </Demo>
        <PropsTable
          title="Heading"
          rows={[
            { name: 'size', type: "'figure' | 'display-lg' | 'display' | 'display-sm' | 'title' | 'subtitle'", default: "'display-sm'", description: 'The figure and display sizes use Geist Pixel. The title and subtitle sizes use Geist.' },
            { name: 'level', type: '1–6', description: 'Which heading element to render (h1–h6), separate from its size. Each size has its own default.' },
          ]}
        />
        <PropsTable
          title="Text"
          rows={[
            { name: 'size', type: "'caption' | 'label' | 'ui' | 'body'", default: "'ui'", description: '12 / 13 / 14 / 15px.' },
            { name: 'tone', type: "'ink' | 'muted' | 'danger'", default: "'ink'", description: 'Text colour.' },
            { name: 'weight', type: "'regular' | 'medium' | 'semibold'", default: "'regular'", description: '400 / 500 / 600.' },
            { name: 'relaxed', type: 'boolean', description: 'Looser line height (leading-relaxed) for paragraphs.' },
            { name: 'numeric', type: 'boolean', description: 'Fixed-width (tabular) figures, so numbers line up in columns.' },
            { name: 'as', type: "'p' | 'span' | 'div' | 'label'", default: "'p'", description: 'The element to render.' },
          ]}
        />
      </Section>
    </>
  )
}
