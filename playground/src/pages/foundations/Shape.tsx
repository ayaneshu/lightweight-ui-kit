import { useState } from 'react'
import { Button, cn, Table, TBody, TD, TH, THead, tokens, TR } from 'lightweight-ui'
import { Demo, KnobSegment, PageHeader, Section } from '../../ui/Demo'

const { radii, shadows, layout, zIndex } = tokens

export default function Shape() {
  const [shape, setShape] = useState<'superellipse(4)' | 'squircle' | 'round'>('superellipse(4)')
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Radius & elevation"
        description="Corners are generous and smoothed, and get rounder as objects get bigger. Most things have no shadow, because on a white page a thin border is enough. Shadows are kept for things that float above the page."
      />

      <Section id="radius" title="Radius" description="The bigger the object, the rounder its corners. Tailwind’s md, lg, xl and 2xl stay as they are. The kit adds chip, control, tile, panel, sheet, canvas and device to fill the gaps.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {radii.map((r) => (
            <div key={r.token} className="rounded-2xl p-4 bg-ink/[0.03]">
              <div
                className="mx-auto h-16 w-full border-2 border-ink/80 bg-ink/[0.03]"
                // The live token, so it follows the kit's fallback where corner-shape isn't supported.
                style={{ borderRadius: r.px === 9999 ? 9999 : `var(--radius-${r.token})` }}
              />
              <p className="mt-3 font-mono text-caption font-medium">rounded-{r.token}</p>
              <p className="text-caption text-muted">{r.px === 9999 ? 'full' : `${r.px}px`}</p>
              <p className="mt-1 text-caption leading-snug text-muted">{r.use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="smoothing"
        title="Corner smoothing"
        description="Every rounded box gets smooth, continuous corners through the CSS corner-shape property. Browsers without it show ordinary rounded corners. The default is superellipse(4), which current Chromium draws close to square at small radii. It’s set by one token, so switching to a softer squircle or plain round takes one line. Add .u-circle to true circles to opt them out."
      >
        <Demo
          controls={<KnobSegment label="--lui-corner-shape" value={shape} options={['superellipse(4)', 'squircle', 'round'] as const} onChange={setShape} />}
          code={`:root { --lui-corner-shape: ${shape}; }   /* default: superellipse(4) */`}
          codeOpen
        >
          <div className="flex flex-wrap items-center justify-center gap-6" style={{ '--lui-corner-shape': shape } as React.CSSProperties}>
            {[26, 20].map((r) => (
              <div key={r} className="grid h-28 w-28 place-items-center border border-line-strong bg-card text-caption text-muted shadow-card" style={{ borderRadius: r }}>
                {r}px
              </div>
            ))}
            <div className="flex flex-col items-center gap-3">
              <Button>Publish form</Button>
              <Button variant="secondary" size="sm">
                Results
              </Button>
            </div>
          </div>
        </Demo>
        <p className="text-label text-muted">
          To see the difference, use a browser that supports <code className="font-mono">corner-shape</code> (Chromium 139+).
        </p>
      </Section>

      <Section id="elevation" title="Elevation" description="Each shadow has two layers: a thin one right at the edge, and a wide, soft one pulled in with a large negative spread. The result is soft and long rather than dark and tight. Use them as Tailwind shadows, such as shadow-card and shadow-menu.">
        <div className="pg-stage grid gap-6 rounded-panel p-8 sm:grid-cols-2 lg:grid-cols-3 bg-ink/[0.03]">
          {shadows.map((s) => (
            <div key={s.token} className="cursor-default select-none rounded-2xl bg-card p-4" style={{ boxShadow: s.value }}>
              <p className="font-mono text-caption font-medium">shadow-{s.token}</p>
              <p className="mt-1 text-caption leading-snug text-muted">{s.use}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Flat', d: 'Cards, chart cards and lists. A border is enough.', cls: 'border border-line' },
            { t: 'Raised', d: 'Feature cards, the sign-in card and the canvas.', cls: 'border border-line shadow-card' },
            { t: 'Floating', d: 'Menus, popovers, dialogs and toasts.', cls: 'border border-line shadow-modal' },
          ].map((x) => (
            <div key={x.t} className={cn('rounded-panel bg-card p-5', x.cls)}>
              <p className="text-ui font-semibold">{x.t}</p>
              <p className="mt-1 text-label text-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="spacing" title="Spacing and widths" description="Spacing uses Tailwind’s 4px scale everywhere. Content columns are sized for what they hold, not to fit a grid.">
        <Table className="table-fixed">
          <THead>
            <TR>
              <TH className="w-[150px]">Width</TH>
              <TH>To scale</TH>
            </TR>
          </THead>
          <TBody>
            {layout.map((l) => (
              <TR key={l.token}>
                <TD>
                  <p className="font-mono text-caption font-medium">{l.px}px</p>
                  <p className="text-caption text-muted">{l.use}</p>
                </TD>
                <TD className="align-middle">
                  <div className="h-2.5 rounded-full bg-ink/80" style={{ width: `${(l.px / 1100) * 100}%` }} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section id="layers" title="Layers" description="The stacking order, from bottom to top. Each layer is also a CSS variable: --lui-z-*.">
        <div className="flex flex-wrap gap-2">
          {Object.entries(zIndex).map(([k, v]) => (
            <div key={k} className="cursor-default select-none rounded-xl bg-ink/[0.04] px-3 py-2">
              <p className="font-mono text-caption font-medium">{k}</p>
              <p className="text-caption tabular-nums text-muted">z {v}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
