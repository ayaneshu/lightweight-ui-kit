import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Bell, CalendarBlank, Check, Copy, Sparkle } from 'lightweight-ui/icons'
import {
  AvatarStack,
  Badge,
  Button,
  buttonClasses,
  FilterPills,
  HERO_GRADIENTS,
  HeroPanel,
  Input,
  LetterBadge,
  PillTabs,
  Rating,
  SearchInput,
  ShareBar,
  StatusBadge,
  Swatch,
  Switch,
  tokens,
} from 'lightweight-ui'
import * as Kit from 'lightweight-ui'
import { GROUPS, PAGES } from '../pages'
import { REPO } from '../ui/site'

/** A small live preview per page for the overview grid. */
function Preview({ slug }: { slug: string }) {
  const [on, setOn] = useState(true)
  const [tab, setTab] = useState<'a' | 'b' | 'c'>('a')
  const [pill, setPill] = useState<'all' | 'open'>('all')
  const [q, setQ] = useState('')
  switch (slug) {
    case 'colour':
      return (
        <div className="flex gap-1.5">
          {['var(--color-ink)', 'var(--color-muted)', 'var(--color-line-strong)', 'var(--color-open)', 'var(--color-draft)', ...tokens.chartColors.slice(0, 2)].map((c) => (
            <span key={c} className="h-8 w-8 rounded-lg border border-ink/5" style={{ background: c }} />
          ))}
        </div>
      )
    case 'typography':
      return (
        <p className="flex items-baseline gap-3">
          <span className="font-pixel text-[40px] font-medium leading-none">Aa</span>
          <span className="text-[34px] font-semibold leading-none">Aa</span>
        </p>
      )
    case 'shape':
      return (
        <div className="flex items-end gap-2">
          {[10, 16, 22, 28].map((r) => (
            <span key={r} className="h-10 w-10 border-2 border-ink/80 bg-card shadow-card" style={{ borderRadius: `calc(${r}px * var(--lui-corner-fallback, 1))` }} />
          ))}
        </div>
      )
    case 'motion':
      return (
        <svg width="120" height="48" aria-hidden="true">
          <path d="M4 44 C 32 2, 40 4, 116 4" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'backdrops':
      return (
        <div className="w-40 overflow-hidden rounded-xl">
          <HeroPanel bg="g-berry" className="h-16" padding={0} />
        </div>
      )
    case 'icons':
      return <Bell size={28} />
    case 'buttons':
      return (
        <div className="flex gap-2">
          <Button size="sm">Publish</Button>
          <Button size="sm" variant="secondary">
            Preview
          </Button>
        </div>
      )
    case 'badges':
      return (
        <div className="flex gap-1.5">
          <StatusBadge status="draft" />
          <StatusBadge status="open" />
        </div>
      )
    case 'avatars':
      return <AvatarStack people={['sara.k@example.com', 'omar.h@example.com', 'lena.m@example.com', 'ravi.p@example.com'].map((p) => ({ person: p }))} tooltips={false} />
    case 'inputs':
      return <Input size="sm" placeholder="Form name" className="w-44" />
    case 'selection':
      return (
        <div className="flex items-center gap-4">
          <Switch checked={on} onChange={setOn} label="Toggle" />
          <Rating value={3.5} size={18} readOnly />
        </div>
      )
    case 'segmented':
      return (
        <div>
          <PillTabs
            value={tab}
            onChange={setTab}
            items={[
              { value: 'a', label: 'Editor' },
              { value: 'b', label: 'Preview' },
              { value: 'c', label: 'Results' },
            ]}
          />
        </div>
      )
    case 'menus':
      return (
        <div className="w-40 rounded-control border border-line bg-card p-1 shadow-menu">
          <p className="rounded-chip px-2.5 py-1.5 text-label font-medium">Rename</p>
          <p className="rounded-chip px-2.5 py-1.5 text-label font-medium text-danger">Delete form</p>
        </div>
      )
    case 'feedback':
      return <div className="rounded-control bg-ink px-3 py-2 text-label font-medium text-on-ink shadow-toast">The form is up to date.</div>
    case 'cards':
      return (
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-muted">Responses</p>
          <p className="font-pixel text-[34px] font-medium leading-none">48</p>
        </div>
      )
    case 'charts':
      return (
        <ShareBar
          className="w-44"
          slices={[
            { id: 'a', label: 'A', value: 11, color: tokens.chartColors[0] },
            { id: 'b', label: 'B', value: 7, color: tokens.chartColors[1] },
            { id: 'c', label: 'Tie', value: 3, color: tokens.chartColors[2] },
          ]}
        />
      )
    case 'dashboard':
      return (
        <div>
          <FilterPills
            value={pill}
            onChange={setPill}
            items={[
              { value: 'all', label: 'All', count: 12 },
              { value: 'open', label: 'Active', count: 7 },
            ]}
          />
        </div>
      )
    case 'navigation':
      return (
        <div className="w-44">
          <SearchInput value={q} onChange={setQ} placeholder="Search" />
        </div>
      )
    case 'presence':
      return (
        <span className="relative grid h-9 w-9 place-items-center rounded-full text-muted">
          <Bell size={18} />
          <span className="u-circle absolute right-1 top-1 h-2 w-2 rounded-full bg-open ring-2 ring-bg" />
        </span>
      )
    case 'tooltip':
      return <span className="rounded-lg bg-ink px-2 py-1 text-label font-medium text-on-ink shadow-tooltip">Duplicate</span>
    case 'swatches':
      return (
        <div className="flex gap-1.5">
          {HERO_GRADIENTS.slice(0, 5).map((g, i) => (
            <Swatch key={g.value} background={g.css} label={g.label} selected={i === 1} size={26} />
          ))}
        </div>
      )
    case 'date-picker':
      return (
        <div className="flex w-44 items-center justify-between rounded-xl border border-line bg-field px-3 py-2 text-sm">
          12 Oct 2026 <CalendarBlank size={15} className="text-muted" />
        </div>
      )
    case 'dialogs':
      return (
        <div className="w-48 rounded-panel border border-line bg-card p-3 shadow-modal">
          <p className="text-label font-semibold">Delete this page?</p>
          <div className="mt-2.5 flex justify-end gap-1.5">
            <span className="rounded-lg border border-line-strong px-2 py-0.5 text-caption font-medium">Cancel</span>
            <span className="rounded-lg bg-danger-solid px-2 py-0.5 text-caption font-semibold text-white">Delete</span>
          </div>
        </div>
      )
    case 'tables':
      return (
        <div className="w-48 divide-y divide-line rounded-xl border border-line bg-card">
          {['Sara K', 'Omar H', 'Lena M'].map((n, i) => (
            <div key={n} className="flex items-center justify-between px-2.5 py-1.5 text-caption">
              <span className="font-medium">{n}</span>
              <span className="text-muted">Option {'ABA'[i]}</span>
            </div>
          ))}
        </div>
      )
    case 'media':
      return (
        <div className="w-44 overflow-hidden rounded-xl">
          <HeroPanel bg="g-ocean" className="h-20" padding={10}>
            <img src="./thumbnails/ascii-1.webp" alt="" className="relative z-10 max-h-full max-w-full rounded-md" />
          </HeroPanel>
        </div>
      )
    case 'compare':
    case 'voting':
      return (
        <div className="flex gap-2">
          {['A', 'B'].map((l, i) => (
            <div key={l} className={`w-20 rounded-xl border bg-card p-1.5 ${i === 0 ? 'border-ink shadow-lift' : 'border-line opacity-50'}`}>
              <LetterBadge letter={l} active={i === 0} />
              <div className="mt-1.5 h-8 rounded-md bg-ink/[0.05]" />
            </div>
          ))}
        </div>
      )
    case 'results':
      return (
        <div className="flex h-14 items-end gap-1.5">
          {[2, 4, 7, 10, 6].map((v, i) => (
            <span key={i} className="w-5 rounded-md" style={{ height: v * 5, background: tokens.ratingRamp[i] }} />
          ))}
        </div>
      )
    case 'builder':
      return (
        <div className="grid h-16 w-48 grid-cols-[36px_1fr_44px] overflow-hidden rounded-xl border border-line bg-card">
          <div className="space-y-1 border-r border-line p-1.5">
            <div className="h-2 rounded bg-ink/[0.08]" />
            <div className="h-2 rounded bg-ink/[0.05]" />
            <div className="h-2 rounded bg-ink/[0.05]" />
          </div>
          <div className="bg-ink/[0.015] p-2">
            <div className="h-full rounded-md border border-line bg-card" />
          </div>
          <div className="space-y-1 border-l border-line p-1.5">
            <div className="h-2 rounded bg-ink/[0.05]" />
            <div className="h-3 rounded bg-ink/80" />
          </div>
        </div>
      )
    case 'publish':
      return (
        <div className="flex w-48 gap-1">
          <span className="min-w-0 flex-1 truncate rounded-lg border border-line bg-ink/[0.015] px-2 py-1.5 text-caption text-muted">forms.example.com/f/checkout</span>
          <span className="rounded-lg border border-line-strong px-2 py-1.5 text-caption font-semibold">Copy</span>
        </div>
      )
    case 'sign-in':
      return (
        <div className="w-40 space-y-1.5 rounded-panel border border-line bg-card p-2.5 shadow-card">
          <div className="h-5 rounded-md border border-line" />
          <div className="h-5 rounded-md border border-line" />
          <div className="h-5 rounded-lg bg-ink" />
        </div>
      )
    default:
      return <Sparkle size={22} className="text-muted" />
  }
}

/** Counted from the kit itself: PascalCase exports that are components (functions or forwardRef objects). */
const COMPONENTS = Object.entries(Kit).filter(
  ([name, value]) => /^[A-Z][a-z]/.test(name) && (typeof value === 'function' || (typeof value === 'object' && value !== null && '$$typeof' in value)),
).length

const COLOUR_TOKENS =
  Object.keys(tokens.colors).length +
  Object.keys(tokens.statusColors).length * 2 +
  Object.keys(tokens.dangerColors).length +
  tokens.washes.length +
  tokens.chartColors.length +
  tokens.ratingRamp.length +
  tokens.avatarColors.length

const GROUP_INTRO: Record<string, string> = {
  Foundations: 'The rules everything else follows: colour, type, shape, motion, backdrops and icons.',
  Components: 'Every building block, each with live examples and its props.',
  Patterns: 'Whole screens built only from the kit, to show how the parts fit.',
}

export default function Overview() {
  return (
    <>
      {/* The first fold: everything before Foundations, filling the screen.
          Three groups, set apart by space alone — what it is, what to do, what's in it. */}
      <section
        aria-labelledby="overview-title"
        className="relative -mx-5 -mt-10 flex min-h-[calc(100dvh-3.5rem)] flex-col px-5 pb-8 pt-10 sm:-mx-8 sm:px-8 lg:-mt-14 lg:min-h-dvh lg:pt-14"
      >
        <DitherBackground />
        <div className="u-stagger relative my-auto max-w-[640px] py-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-ink/[0.05] py-1 ps-1 pe-3 text-label text-muted">
              <Badge tone="ink" size="sm">
                v0.1
              </Badge>
              Open source · MIT · React 18 and 19
            </p>
            <h1 id="overview-title" className="mt-5 font-pixel text-[56px] font-medium leading-[1.02] tracking-tight sm:text-[76px]">
              Lightweight UI
            </h1>
            <p className="mt-4 max-w-[34rem] text-[17px] leading-relaxed text-pretty text-muted sm:text-[18px]">
              A React UI kit for calm, fast product interfaces. Tokens, type, colour, motion and {COMPONENTS} components, in light and dark. Install it with one command, or copy in only the parts you need.
            </p>
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap items-center gap-3">
              <a href="#/installation" className={buttonClasses()}>
                Get started
                <ArrowRight size={15} aria-hidden="true" className="transition-[translate] duration-200 ease-out group-hover/btn:translate-x-0.5 rtl:-scale-x-100" />
              </a>
              <a href="#/buttons" className={buttonClasses({ variant: 'secondary' })}>
                Browse components
              </a>
            </div>
            <InstallLine />
          </div>

          <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-5">
            {[
              { v: COMPONENTS, l: 'components' },
              { v: COLOUR_TOKENS, l: 'colour tokens' },
              { v: '1,500+', l: 'icons' },
              { v: PAGES.filter((p) => p.group === 'Patterns').length, l: 'page patterns' },
            ].map((s) => (
              <div key={s.l} className="flex flex-col-reverse gap-1.5">
                <dt className="text-label text-muted">{s.l}</dt>
                <dd className="font-pixel text-[32px] font-medium leading-none tabular-nums">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* In the flow, on the text's leading edge — it can't land on top of anything on a short screen. */}
        <a
          href="#/overview#foundations"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('foundations')?.scrollIntoView({ block: 'start' })
          }}
          className="group relative inline-flex items-center gap-1.5 self-start rounded-lg py-1 text-label text-muted transition-colors hover:text-ink focus-visible:outline-offset-2"
        >
          Explore the kit
          <ArrowDown size={14} aria-hidden="true" className="u-scroll-cue transition-[translate] duration-200 ease-out group-hover:translate-y-0.5" />
        </a>
      </section>

      {GROUPS.filter((g) => g !== 'Get started').map((group) => (
        <section key={group} id={group.toLowerCase()} className="mb-20 scroll-mt-20">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <div>
              <h2 className="font-pixel text-[28px] font-medium tracking-tight">{group}</h2>
              <p className="mt-1 text-ui text-pretty text-muted">{GROUP_INTRO[group]}</p>
            </div>
            <span className="flex-none text-label tabular-nums text-muted">{PAGES.filter((p) => p.group === group).length} pages</span>
          </div>
          <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {PAGES.filter((p) => p.group === group).map((p) => (
              <div key={p.slug} className="group relative flex flex-col">
                {/* Previews are live components, made inert: the card is one link, not a nest of controls. */}
                <div
                  className="pg-stage pointer-events-none flex h-32 items-center justify-center overflow-hidden rounded-tile bg-ink/[0.03] transition-[background-color,translate] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:bg-ink/[0.05]"
                  inert
                >
                  <div className="transition-[scale] duration-300 ease-out group-hover:scale-[1.04]">
                    <Preview slug={p.slug} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 px-0.5">
                  <a
                    href={`#/${p.slug}`}
                    className="text-ui font-semibold tracking-tight before:absolute before:inset-0 before:rounded-tile focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-ink"
                  >
                    {p.title}
                  </a>
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="text-muted opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </div>
                <p className="mt-0.5 px-0.5 text-label leading-relaxed text-pretty text-muted">{p.blurb}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section aria-labelledby="principles" className="rounded-sheet bg-ink/[0.03] p-6 sm:p-8">
        <h2 id="principles" className="font-sans text-title font-semibold tracking-tight">
          How it’s built
        </h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          {[
            ['Ink on paper', 'Weight, spacing and soft washes set the hierarchy. Colour is saved for meaning.'],
            ['Two typefaces, one rule', 'Geist for the interface. Geist Pixel for display text above 20px.'],
            ['Quick, never showy', 'Motion confirms what you did, then gets out of the way.'],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="text-ui font-semibold">{t}</p>
              <p className="mt-1 text-label leading-relaxed text-pretty text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-label text-muted">
          Icons by{' '}
          <a href="https://phosphoricons.com" target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-line-control/60 underline-offset-2 hover:decoration-ink">
            Phosphor
          </a>
          , included as <code className="font-mono">lightweight-ui/icons</code>.
        </p>
      </section>
    </>
  )
}

/**
 * The three.js dither field behind the first fold. Loaded after the page
 * paints (three.js is only fetched here), full-bleed across the content
 * column, and faded out at the bottom so the fold ends softly.
 */
function DitherBackground() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    import('../ui/ditherField')
      .then(({ mountDitherField }) => {
        if (!cancelled && ref.current) stop = mountDitherField(ref.current)
      })
      .catch(() => undefined) // No WebGL: the fold reads fine without it.
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 lg:w-[calc(100vw-272px-2rem)]',
        // Phones: a band across the top, above the words.
        '[mask-image:radial-gradient(ellipse_130%_42%_at_85%_0%,black_15%,transparent_78%)]',
        // Wider: mostly on the trailing side, fading out before it reaches the text.
        'lg:[mask-image:radial-gradient(ellipse_62%_85%_at_100%_28%,black_18%,transparent_76%)]',
        'lg:rtl:[mask-image:radial-gradient(ellipse_62%_85%_at_0%_28%,black_18%,transparent_76%)]',
      ].join(' ')}
    />
  )
}

/** The one-line install, copyable. */
function InstallLine() {
  const cmd = `npm install github:${REPO}`
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl bg-ink/[0.04] py-1 ps-3.5 pe-1">
      <span className="select-none font-mono text-[13px] text-muted" aria-hidden="true">
        $
      </span>
      <code className="min-w-0 truncate font-mono text-[13px]">{cmd}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(cmd)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          } catch {
            /* clipboard blocked — the text is there to select */
          }
        }}
        aria-label={copied ? 'Copied' : 'Copy install command'}
        className="u-press grid h-7 w-7 flex-none place-items-center rounded-lg text-muted hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-offset-2"
      >
        {copied ? <Check size={14} weight="bold" aria-hidden="true" className="u-icon-in" /> : <Copy size={14} aria-hidden="true" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Install command copied' : ''}
      </span>
    </div>
  )
}
