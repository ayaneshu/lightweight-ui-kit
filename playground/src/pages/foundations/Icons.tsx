import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { icons } from '@phosphor-icons/core'
import * as Phosphor from 'lightweight-ui/icons'
import { ArrowSquareOut, Bell, X, type Icon, type IconWeight } from 'lightweight-ui/icons'
import { cn, commandScore, IconButton, SearchInput, SegmentedControl, Select } from 'lightweight-ui'
import { CodeBlock, CopyButton, PageHeader, Section } from '../../ui/Demo'

/** Phosphor's metadata, typed loosely — its literal types are too big for the checker. */
interface Meta {
  name: string
  pascal_name: string
  categories: string[]
  tags: string[]
}
const ALL = icons as unknown as readonly Meta[]

const WEIGHTS: IconWeight[] = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']
const GLYPHS = Phosphor as unknown as Record<string, Icon>
const CATEGORIES = [...new Set(ALL.flatMap((i) => i.categories))].sort()
const TOTAL = ALL.length.toLocaleString('en')

/** `#/icons?icon=Trash` → 'Trash' (how ⌘K points at one icon). */
function iconFromHash() {
  const q = window.location.hash.split('?')[1]
  return q ? new URLSearchParams(q).get('icon') : null
}

export default function Icons() {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const [category, setCategory] = useState('')
  const [weight, setWeight] = useState<IconWeight>('regular')
  const [selected, setSelected] = useState<string | null>(iconFromHash)

  // Arriving from search: select it and bring it into view.
  useEffect(() => {
    const sync = () => {
      const name = iconFromHash()
      if (!name) return
      setSelected(name)
      setQuery('')
      setCategory('')
      requestAnimationFrame(() => document.getElementById(`icon-${name}`)?.scrollIntoView({ block: 'center' }))
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const shown = useMemo(() => {
    const q = deferred.trim()
    const pool = category ? ALL.filter((i) => i.categories.includes(category)) : ALL
    if (!q) return pool
    return pool
      .map((i) => ({ i, s: commandScore(i.pascal_name, q, [i.name, ...i.tags.filter((t) => !t.startsWith('*')), ...i.categories]) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.i)
  }, [deferred, category])

  const current = selected ? ALL.find((i) => i.pascal_name === selected) : undefined

  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Iconography"
        description={
          <>
            Lightweight UI uses{' '}
            <a href="https://phosphoricons.com" target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-line-control/60 underline-offset-2 hover:decoration-ink">
              Phosphor Icons
            </a>
            : one consistent family of {TOTAL} icons, instead of a mix of hand-drawn ones that don’t quite match in weight or size. It comes with the kit and is re-exported from{' '}
            <code className="font-mono text-ui">lightweight-ui/icons</code>, so there’s nothing extra to install.
          </>
        }
      />

      <Section
        id="phosphor"
        title="Phosphor Icons"
        description="An icon family for interfaces, by Helena Zhang and Tobias Fried. Every icon comes in six weights, drawn on a 256-unit grid so they line up with each other and with text."
      >
        <div className="grid overflow-hidden rounded-panel sm:grid-cols-3 lg:grid-cols-6 bg-ink/[0.03]">
          {WEIGHTS.map((w) => (
            <div key={w} className="flex flex-col items-center gap-2 border-b border-e border-line px-3 py-5">
              <Bell size={28} weight={w} aria-hidden="true" />
              <code className="font-mono text-caption text-muted">{w}</code>
            </div>
          ))}
        </div>
        <p className="max-w-2xl text-ui leading-relaxed text-pretty text-muted">
          The kit’s components use <strong className="font-medium text-ink">regular</strong>. They use <strong className="font-medium text-ink">bold</strong> only for tiny marks, like a
          tick or a caret, that would be too faint to see otherwise. Phosphor is MIT-licensed.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            ['phosphoricons.com', 'https://phosphoricons.com'],
            ['phosphor-icons/react on GitHub', 'https://github.com/phosphor-icons/react'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="u-press group inline-flex items-center gap-1.5 rounded-control border border-line-strong px-3.5 py-2 text-label font-medium hover:border-line-control hover:bg-ink/[0.03] focus-visible:outline-offset-2"
            >
              {label}
              <ArrowSquareOut size={14} aria-hidden="true" className="transition-[translate] duration-200 ease-out group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
          ))}
        </div>
      </Section>

      <Section id="usage" title="Usage">
        <CodeBlock
          title="Import any Phosphor icon from the kit"
          code={`import { Trash, Check, IconContext } from 'lightweight-ui/icons'
// Server Components (Next.js App Router): 'lightweight-ui/icons/ssr'

<Trash size={16} aria-hidden="true" />               // beside 13–14px text
<Check size={13} weight="bold" aria-hidden="true" />  // tiny marks go bold

// Defaults for a subtree
<IconContext.Provider value={{ size: 16, weight: 'regular' }}>…</IconContext.Provider>`}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { s: 13, t: 'Next to 12–13px labels, in bold' },
            { s: 15, t: 'In buttons and menu rows' },
            { s: 18, t: 'Icon-only buttons' },
          ].map((x) => (
            <div key={x.s} className="cursor-default select-none flex items-center gap-3 rounded-2xl p-4 bg-ink/[0.03]">
              <Bell size={x.s} aria-hidden="true" />
              <div>
                <p className="font-mono text-caption font-medium">{x.s}px</p>
                <p className="text-caption text-muted">{x.t}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="all"
        title="All icons"
        description={`All ${TOTAL} Phosphor icons. Search by name or by what an icon is for. Phosphor’s tags are searched too, so “delete” finds Trash. Select an icon to copy its import.`}
      >
        {/* Controls stay in reach while you scroll the grid. */}
        <div className="sticky top-14 z-20 -mx-2 flex flex-wrap items-center gap-2 border-b border-line bg-bg px-2 py-2 lg:top-0">
          <SearchInput value={query} onChange={setQuery} label="Search icons" placeholder="Try “delete” or “upload”" className="min-w-[200px] flex-1" />
          <Select size="sm" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className="w-40 capitalize">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <SegmentedControl
            label="Weight"
            value={weight}
            onChange={setWeight}
            items={WEIGHTS.map((w) => ({ value: w, label: w[0].toUpperCase() + w.slice(1) }))}
          />
        </div>

        <p className="text-label text-muted" role="status">
          {shown.length === ALL.length ? `${TOTAL} icons` : `${shown.length.toLocaleString('en')} of ${TOTAL}`}
        </p>

        {shown.length ? (
          <ul className={cn('grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-1.5', current && 'pb-64')}>
            {shown.map((i) => {
              const Glyph = GLYPHS[i.pascal_name]
              const on = i.pascal_name === selected
              return (
                <li key={i.pascal_name} className="[contain-intrinsic-size:auto_96px] [content-visibility:auto]">
                  <button
                    id={`icon-${i.pascal_name}`}
                    type="button"
                    onClick={() => setSelected(on ? null : i.pascal_name)}
                    aria-pressed={on}
                    data-static
                    className={cn(
                      'u-press group flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-xl border px-2 focus-visible:outline-offset-2',
                      on ? 'border-ink bg-ink/[0.04] text-ink' : 'border-transparent text-ink hover:border-line hover:bg-ink/[0.025]',
                    )}
                  >
                    <Glyph size={26} weight={weight} aria-hidden="true" className="transition-[scale] duration-200 ease-out group-hover:scale-115" />
                    <span className={cn('w-full truncate text-center text-caption', on ? 'font-medium text-ink' : 'text-muted group-hover:text-ink')}>{i.pascal_name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="rounded-sheet border border-dashed border-line-strong bg-ink/[0.015] px-6 py-14 text-center">
            <p className="text-body font-medium">No icons match “{deferred.trim()}”</p>
            <p className="mt-1 text-ui text-muted">Try searching for what the icon does, like “remove”, “money” or “upload”.</p>
          </div>
        )}
      </Section>

      {current && <IconDetail key={current.pascal_name} icon={current} weight={weight} onWeight={setWeight} onClose={() => setSelected(null)} />}
    </>
  )
}

/** The chosen icon, docked to the bottom of the window: every weight, and the code. */
function IconDetail({ icon, weight, onWeight, onClose }: { icon: Meta; weight: IconWeight; onWeight: (w: IconWeight) => void; onClose: () => void }) {
  const Glyph = GLYPHS[icon.pascal_name]
  const imp = `import { ${icon.pascal_name} } from 'lightweight-ui/icons'`
  const jsx = `<${icon.pascal_name} size={16}${weight === 'regular' ? '' : ` weight="${weight}"`} aria-hidden="true" />`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !e.defaultPrevented && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <section
      aria-label={`${icon.pascal_name} icon`}
      className="u-toast fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[860px] rounded-sheet bg-card p-4 shadow-modal lg:start-[284px]"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="grid h-28 w-full flex-none place-items-center rounded-2xl bg-ink/[0.02] sm:w-28">
          <Glyph size={56} weight={weight} aria-hidden="true" className="u-icon-in" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-sans text-title font-semibold tracking-tight">{icon.pascal_name}</h3>
              <p className="mt-0.5 truncate text-label capitalize text-muted">{[...icon.categories, ...icon.tags.filter((t) => !t.startsWith('*')).slice(0, 5)].join(' · ')}</p>
            </div>
            <IconButton label="Close" size="md" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label="Weight">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={w === weight}
                aria-label={w}
                title={w}
                onClick={() => onWeight(w)}
                className={cn(
                  'u-press grid h-9 w-9 place-items-center rounded-lg border focus-visible:outline-offset-2',
                  w === weight ? 'border-ink bg-ink/[0.04]' : 'border-line hover:border-line-control hover:bg-ink/[0.03]',
                )}
              >
                <Glyph size={18} weight={w} aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {[imp, jsx].map((code) => (
              <div key={code} className="flex items-center gap-2 rounded-xl bg-ink/[0.015] ps-3 pe-1">
                <code className="min-w-0 flex-1 truncate py-2 font-mono text-[12.5px]">{code}</code>
                <CopyButton text={code} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>,
    document.body,
  )
}
