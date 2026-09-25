import { useState } from 'react'
import { Check, Copy } from 'lightweight-ui/icons'
import { Button, Callout, cn, Input, onColor, StatusBadge, Switch, Table, TBody, TD, TH, THead, tokens, TR } from 'lightweight-ui'
import { CodeBlock, Demo, PageHeader, ScrollTable, Section } from '../../ui/Demo'

const { themes, washes, chartColors, ratingRamp, avatarColors } = tokens
type Key = keyof typeof themes.light

const CORE: { key: Key; token: string; name: string; use: string }[] = [
  { key: 'ink', token: 'ink', name: 'Ink', use: 'Text, primary buttons, selection, focus' },
  { key: 'onInk', token: 'on-ink', name: 'On ink', use: 'Text and icons on an ink fill' },
  { key: 'muted', token: 'muted', name: 'Muted', use: 'Secondary text, resting icons and placeholders. At least 4.5:1 contrast on every wash.' },
  { key: 'bg', token: 'bg', name: 'Background', use: 'The page' },
  { key: 'card', token: 'card', name: 'Card', use: 'Cards, menus, dialogs' },
  { key: 'raised', token: 'raised', name: 'Raised', use: 'The selected segment in a segmented control. In dark mode it’s lighter than the card, so it stands out.' },
  { key: 'field', token: 'field', name: 'Field', use: 'Input fields' },
  { key: 'line', token: 'line', name: 'Line', use: 'Card edges and dividers' },
  { key: 'lineStrong', token: 'line-strong', name: 'Line strong', use: 'Outlined buttons and dashed empty areas' },
  { key: 'lineControl', token: 'line-control', name: 'Line control', use: 'Edges that mark out a control, like field borders and empty stars. At least 3:1 contrast.' },
]

const STATUS: { status: 'draft' | 'open' | 'closed'; fg: Key; bg: Key }[] = [
  { status: 'draft', fg: 'draft', bg: 'draftBg' },
  { status: 'open', fg: 'open', bg: 'openBg' },
  { status: 'closed', fg: 'closed', bg: 'closedBg' },
]

const DANGER: { key: Key; token: string; use: string }[] = [
  { key: 'danger', token: 'danger', use: 'Text and borders' },
  { key: 'dangerSolid', token: 'danger-solid', use: 'Solid fill behind white text' },
  { key: 'dangerStrong', token: 'danger-strong', use: 'Text on the tinted background' },
  { key: 'dangerBg', token: 'danger-bg', use: 'The tinted background' },
  { key: 'dangerLine', token: 'danger-line', use: 'Border of the tinted background' },
]

const THEMING = `/* Follow the OS (default), or pin one — on <html> or any subtree. */
<html data-theme="system">   <!-- light | dark | system -->
<section data-theme="dark">…</section>

/* Every colour is one variable, resolved by color-scheme: */
--color-ink: light-dark(#18191d, #ececee);

/* React */
import { ThemeSwitch, useTheme, applyTheme, themeScript } from 'lightweight-ui'
<ThemeSwitch />                        // Light · Dark · System, persisted
const [theme, setTheme] = useTheme()   // build your own control
<script dangerouslySetInnerHTML={{ __html: themeScript() }} />  // in <head>: no flash`

export default function Colour() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Colour"
        description="The palette is mostly ink and paper: dark on light, or light on dark. Hierarchy comes from font weight, thin borders and see-through ink washes, not from greys or a brand colour. Colour is saved for meaning: a status, a series in a chart, a person. Each token is defined once and works in both themes."
      />

      <Section
        id="themes"
        title="Light and dark"
        description="Each colour is one CSS variable that holds both values through light-dark(). Components, washes and shadows all switch with color-scheme. Set data-theme on <html> to theme the whole page, or on any element to fix just that region to light or dark."
      >
        <div className="grid overflow-hidden rounded-panel md:grid-cols-2">
          <ThemePreview theme="light" />
          <ThemePreview theme="dark" />
        </div>
        <CodeBlock title="Theming" code={THEMING} />
      </Section>

      <Section id="core" title="Core tokens" description="These ten tokens cover almost everything. Use each one as a Tailwind colour (bg-ink, text-muted, border-line-control) or as a CSS variable (var(--color-ink)). Click a value to copy it.">
        <ScrollTable label="Core colour tokens">
          <Table className="min-w-[560px]">
            <THead>
              <TR>
                <TH>Token</TH>
                <TH className="w-[150px]">Light</TH>
                <TH className="w-[150px]">Dark</TH>
              </TR>
            </THead>
            <TBody>
              {CORE.map((c) => (
                <TR key={c.key}>
                  <TD>
                    <p className="font-semibold">
                      {c.name} <code className="ms-1 font-mono text-caption font-normal text-muted">--color-{c.token}</code>
                    </p>
                    <p className="mt-0.5 text-label leading-snug text-pretty text-muted">{c.use}</p>
                  </TD>
                  <TD className="align-middle">
                    <HexCell label="Light" hex={themes.light[c.key]} />
                  </TD>
                  <TD className="align-middle">
                    <HexCell label="Dark" hex={themes.dark[c.key]} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ScrollTable>
      </Section>

      <Section
        id="washes"
        title="Washes"
        description="Hover, pressed and selected states, tracks and empty areas all use ink at low opacity, laid over whatever is underneath. That means black on light and white on dark, never a fixed grey. So a hover looks the same on the page, on a card or on a tinted panel, in either theme."
      >
        <Demo
          stage="none"
          code={`<button className="hover:bg-ink/[0.04]">…</button>   // wash-3
<div className="bg-ink/[0.015]">…</div>               // wash-1 — an empty well
// or the named tokens: bg-wash-1 … bg-wash-6, var(--color-wash-4)`}
        >
          {(['light', 'dark'] as const).map((t) => (
            <div key={t} data-theme={t} className="grid grid-cols-2 bg-bg text-ink sm:grid-cols-3 lg:grid-cols-6">
              {washes.map((w) => (
                <div key={w.token} className="p-4">
                  <div className="h-14 rounded-xl bg-ink/[0.03]" style={{ background: `var(--color-${w.token})` }} />
                  <p className="mt-3 font-mono text-caption font-medium">{w.token}</p>
                  <p className="text-caption text-muted">
                    ink / {w.alpha} · {t}
                  </p>
                  {t === 'light' && <p className="mt-1 text-caption leading-snug text-muted">{w.use}</p>}
                </div>
              ))}
            </div>
          ))}
        </Demo>
      </Section>

      <Section id="status" title="Status" description="Three states: Draft, Active and Closed. Each is a muted text colour on its own tint, so a column of badges fits the palette without shouting. In dark mode the text gets lighter and the tint gets darker. Danger has its own set of tokens, below.">
        <div className="grid gap-3 sm:grid-cols-3">
          {STATUS.map((s) => (
            <div key={s.status} className="overflow-hidden rounded-2xl bg-ink/[0.03]">
              <div className="grid grid-cols-2">
                {(['light', 'dark'] as const).map((t) => (
                  <div key={t} data-theme={t} className="flex h-20 items-center justify-center bg-card">
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2">
                <HexCell label={s.status} hex={themes.light[s.fg]} alt={themes.dark[s.fg]} />
                <HexCell label={`${s.status}-bg`} hex={themes.light[s.bg]} alt={themes.dark[s.bg]} />
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl bg-ink/[0.03]">
          <div className="grid md:grid-cols-2">
            {(['light', 'dark'] as const).map((t) => (
              <div key={t} data-theme={t} className="bg-card p-4">
                <Callout tone="danger" title="Danger">
                  For destructive actions, validation errors and the recording indicator.
                </Callout>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5">
            {DANGER.map((d) => (
              <HexCell key={d.key} label={d.token} hex={themes.light[d.key]} alt={themes.dark[d.key]} />
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="charts"
        title="Chart palettes"
        description="In a chart, colour does one job. For options, it tells them apart: colours follow the order the options are listed in, not how they rank, so option A is always blue. For ratings, it shows order, with one hue running from light to dark. Both palettes are the same in light and dark themes."
      >
        <Demo stage="none">
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-label font-semibold">Options · chart-1…4</p>
              <div className="flex gap-2">
                {chartColors.map((c, i) => (
                  <Chip key={c} hex={c} label={String.fromCharCode(65 + i)} />
                ))}
              </div>
              <p className="mt-3 text-caption leading-relaxed text-pretty text-muted">
                A bright azure comes first. Two of the colours fall below 3:1 contrast on white. That’s acceptable only because every value is also printed next to its mark.
              </p>
            </div>
            <div>
              <p className="mb-3 text-label font-semibold">Ratings · ramp-1…5</p>
              <div className="flex gap-2">
                {ratingRamp.map((c, i) => (
                  <Chip key={c} hex={c} label={`${i + 1}★`} />
                ))}
              </div>
              <p className="mt-3 text-caption leading-relaxed text-pretty text-muted">One azure hue, from light to deep. Each step is darker than the last, so the order reads on both light and dark backgrounds.</p>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        id="avatars"
        title="Avatars"
        description="Each avatar colour is worked out from the person’s email address or name, so a teammate has the same colour everywhere. White initials reach at least 4.5:1 contrast on every fill, in either theme."
      >
        <div className="flex flex-wrap gap-2">
          {avatarColors.map((c, i) => (
            <Chip key={c} hex={c} label={['IN', 'RO', 'CY', 'AM', 'VI', 'EM', 'PI', 'TE'][i]} round />
          ))}
        </div>
      </Section>
    </>
  )
}

/** A slice of real components pinned to one theme. */
function ThemePreview({ theme }: { theme: 'light' | 'dark' }) {
  const [on, setOn] = useState(true)
  return (
    <div data-theme={theme} className="space-y-4 bg-bg p-5 text-ink">
      <p className="text-micro font-semibold uppercase tracking-[0.06em] text-muted">{theme === 'light' ? 'Light' : 'Dark'}</p>
      <div className="rounded-panel bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <p className="text-ui font-semibold">Checkout redesign</p>
          <StatusBadge status="open" />
        </div>
        <p className="mt-1 text-label text-muted">12 responses · closes Friday</p>
        <Input size="sm" defaultValue="forms.example.com/f/checkout" aria-label={`Link (${theme} preview)`} className="mt-3" readOnly />
        <div className="mt-3 flex items-center justify-between gap-3">
          <Switch checked={on} onChange={setOn} label="Anonymous" />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Share
            </Button>
            <Button size="sm">Publish</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  return {
    copied,
    copy: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(text)
        setTimeout(() => setCopied(null), 1200)
      } catch {
        /* blocked */
      }
    },
  }
}

/** A copyable value with its swatch — and, given `alt`, the dark value beside it. */
function HexCell({ label, hex, alt }: { label: string; hex: string; alt?: string }) {
  const { copied, copy } = useCopy()
  return (
    <button
      type="button"
      onClick={() => copy(hex)}
      aria-label={`Copy ${label} ${hex}`}
      data-static
      className="flex items-center gap-2 rounded-chip px-3 py-2.5 text-start transition-colors hover:bg-ink/[0.02] focus-visible:-outline-offset-2"
    >
      <span className="flex flex-none">
        <span className="h-4 w-4 rounded-md border border-ink/10" style={{ background: hex }} />
        {alt && <span className="-ms-1 h-4 w-4 rounded-md border border-ink/10" style={{ background: alt }} />}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-mono text-caption font-medium">{label}</span>
        <span className="block font-mono text-caption uppercase text-muted">
          {copied === hex ? 'copied' : alt ? `${hex} · ${alt}` : hex}
        </span>
      </span>
    </button>
  )
}

function Chip({ hex, label, round = false }: { hex: string; label: string; round?: boolean }) {
  const { copied, copy } = useCopy()
  return (
    <button type="button" onClick={() => copy(hex)} aria-label={`Copy ${hex}`} className="group flex flex-col items-center gap-1.5 rounded-xl focus-visible:outline-offset-2">
      <span
        className={cn('grid h-12 w-12 place-items-center text-label font-semibold transition-transform duration-150 ease-out group-hover:scale-105', round ? 'u-circle rounded-full' : 'rounded-xl')}
        style={{ background: hex, color: onColor(hex) }}
      >
        {label}
      </span>
      <span className="flex items-center gap-1 font-mono text-[11px] uppercase text-muted">
        {copied === hex ? <Check size={10} weight="bold" aria-hidden="true" /> : <Copy size={10} aria-hidden="true" />}
        {copied === hex ? 'copied' : hex}
      </span>
    </button>
  )
}
