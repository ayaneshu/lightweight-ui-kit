import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'
import { CountBadge } from './Badge'

export interface SegmentItem<T extends string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
  count?: number
  /** Render as a link — for tabs that are routes, so they're linkable and Back works. */
  href?: string
  disabled?: boolean
}

interface GroupProps<T extends string> {
  items: readonly SegmentItem<T>[]
  value: T
  onChange?: (value: T) => void
  /** Accessible name for the group. */
  label?: string
  className?: string
}

/* ------------------------------------------------------------ Indicator */

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

interface Box {
  x: number
  y: number
  w: number
  h: number
  /** The group's own padding box, for the clip. */
  W: number
  H: number
}

/**
 * Where the chosen segment sits inside its group — measured, so segments can
 * be any width and the group can wrap. Re-measured when the value changes and
 * whenever anything in the group resizes (a font loading, a count changing).
 * `ready` stays false for the first placement, so the indicator appears in
 * place instead of sliding in from the corner.
 */
function useIndicator(ref: React.RefObject<HTMLElement | null>, value: string) {
  const [box, setBox] = useState<Box | null>(null)
  const [ready, setReady] = useState(false)

  useIsoLayoutEffect(() => {
    const group = ref.current
    if (!group) return
    const measure = () => {
      const el = group.querySelector<HTMLElement>(':scope > [data-seg][data-active="true"]')
      if (!el) return setBox(null)
      const next = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, W: group.clientWidth, H: group.clientHeight }
      setBox((b) => (b && b.x === next.x && b.y === next.y && b.w === next.w && b.h === next.h && b.W === next.W && b.H === next.H ? b : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(group)
    group.querySelectorAll(':scope > [data-seg]').forEach((n) => ro.observe(n))
    return () => ro.disconnect()
  }, [ref, value])

  useEffect(() => {
    if (!box || ready) return
    const frame = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(frame)
  }, [box, ready])

  return { box, ready }
}

/**
 * The shared motion: one shape that travels to the chosen segment rather than
 * each segment fading its own background in and out. It moves with a
 * transform and resizes only itself — it's out of flow, so nothing else lays
 * out again — and marks itself `data-lui-motion` so a theme switch doesn't
 * freeze it mid-slide. Reduced motion places it instantly.
 */
function Indicator({ box, ready, className }: { box: Box | null; ready: boolean; className: string }) {
  return (
    <span
      aria-hidden="true"
      data-lui-motion
      className={cn(
        'pointer-events-none absolute left-0 top-0 ease-out',
        ready && 'transition-[transform,width,height,opacity] duration-[var(--lui-duration-slide)]',
        className,
      )}
      style={box ? { width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` } : { opacity: 0, width: 0, height: 0 }}
    />
  )
}

/* -------------------------------------------------------------- Segment */

/** A segment as a button, or as a link when it has an href (and isn't disabled). */
function Segment<T extends string>({
  item,
  active,
  onChange,
  className,
  iconOnly = false,
  still = false,
}: {
  item: SegmentItem<T>
  active: boolean
  onChange?: (value: T) => void
  className: string
  iconOnly?: boolean
  /** Opt out of the global press scale. */
  still?: boolean
}) {
  const content = (
    <>
      {item.icon}
      {/* Icon-only still has a name: visually hidden text, which works for
          any label — not just a string. */}
      {iconOnly ? <span className="sr-only">{item.label}</span> : item.label}
      {item.count !== undefined && <CountBadge active={active}>{item.count}</CountBadge>}
    </>
  )
  const title = iconOnly && typeof item.label === 'string' ? item.label : undefined
  const shared = { 'data-seg': '', 'data-active': active, 'data-static': still || undefined, title, className }
  if (item.href && !item.disabled) {
    return (
      <a
        {...shared}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        onClick={(e) => {
          if (!onChange || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
          e.preventDefault()
          onChange(item.value)
        }}
      >
        {content}
      </a>
    )
  }
  return (
    <button {...shared} type="button" aria-pressed={active} disabled={item.disabled} onClick={() => onChange?.(item.value)}>
      {content}
    </button>
  )
}

/** A group of links is navigation; a group of toggles is just a group. */
function Group({
  items,
  label,
  className,
  style,
  groupRef,
  children,
}: {
  items: readonly { href?: string }[]
  label?: string
  className: string
  style?: React.CSSProperties
  groupRef: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}) {
  const Tag = items.some((i) => i.href) ? 'nav' : 'div'
  return (
    <Tag ref={groupRef} role={Tag === 'div' ? 'group' : undefined} aria-label={label} className={className} style={style}>
      {children}
    </Tag>
  )
}

/** Segments sit above the indicator; their text colour eases with its travel. */
const SEG =
  'relative z-10 transition-colors duration-[var(--lui-duration-slide)] ease-out focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40'

/* ---------------------------------------------------- SegmentedControl */

/**
 * Solid segmented control — the chosen segment fills ink. For a setting with a
 * few mutually exclusive values that should all be visible.
 *
 * The ink pill is a real element, so it shares the kit's corners with every
 * other track and pill. Above it sits a copy of the labels, each on its own ink
 * pill, clipped to the chosen segment's box: as the pill slides, the text
 * turns light at exactly the pixels it covers — never white on the track or
 * dark on the pill.
 */
export function SegmentedControl<T extends string>({ items, value, onChange, label, className }: GroupProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const { box, ready } = useIndicator(ref, value)
  const layout = 'inline-flex flex-wrap items-center gap-1 p-1'
  const segCls = 'flex h-7 items-center gap-1.5 rounded-chip px-3.5 text-label font-medium'
  // A plain rectangle: the text never reaches the corners, and the pill below draws them.
  const clip = box ? `inset(${box.y}px ${box.W - box.x - box.w}px ${box.H - box.y - box.h}px ${box.x}px)` : 'inset(50%)'
  const slide = ready && 'duration-[var(--lui-duration-slide)]'
  return (
    <Group items={items} label={label} groupRef={ref} className={cn('relative rounded-control border border-line', layout, className)}>
      <Indicator box={box} ready={ready} className="rounded-chip bg-ink" />
      {items.map((item) => (
        <Segment
          key={item.value}
          item={item}
          active={item.value === value}
          onChange={onChange}
          // No press scale here: the light copy above can't scale with it.
          still
          className={cn(segCls, SEG, 'text-muted', item.value !== value && 'not-disabled:hover:bg-ink/[0.04] not-disabled:hover:text-ink')}
        />
      ))}
      <div
        aria-hidden="true"
        data-lui-motion
        className={cn('pointer-events-none absolute inset-0 z-20 select-none ease-out', layout, slide && 'transition-[clip-path]', slide)}
        style={{ clipPath: clip }}
      >
        {items.map((item) => (
          // Each copy carries its own ink pill with the kit's corners, so what the
          // clip reveals is a whole pill — and its text always sits on ink.
          <span key={item.value} className={cn(segCls, 'bg-ink text-on-ink')}>
            {item.icon}
            {item.label}
            {item.count !== undefined && <CountBadge active>{item.count}</CountBadge>}
          </span>
        ))}
      </div>
    </Group>
  )
}

/* ---------------------------------------------------------- PillTabs */

/**
 * View tabs on a wash track — the chosen one lifts to a raised card that
 * slides between them. The Editor · Preview · Results switch: three views of
 * one thing, one bar.
 */
export function PillTabs<T extends string>({ items, value, onChange, label, className }: GroupProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const { box, ready } = useIndicator(ref, value)
  return (
    <Group
      items={items}
      label={label}
      groupRef={ref}
      className={cn('relative inline-flex items-center gap-1 rounded-control border border-line bg-ink/[0.03] p-1', className)}
    >
      <Indicator box={box} ready={ready} className="rounded-chip bg-raised shadow-hairline" />
      {items.map((item) => (
        <Segment
          key={item.value}
          item={item}
          active={item.value === value}
          onChange={onChange}
          className={cn(
            'u-press flex h-7 items-center gap-1.5 rounded-chip px-3.5 text-label font-medium',
            SEG,
            item.value === value ? 'text-ink' : 'text-muted not-disabled:hover:bg-ink/[0.03] not-disabled:hover:text-ink',
          )}
        />
      ))}
    </Group>
  )
}

/* ------------------------------------------------------- SlidingSwitch */

/**
 * One raised pill that physically slides to the chosen segment. Equal-width
 * segments; `iconOnly` for a row of glyphs whose names are a hover away
 * (device preview, theme).
 */
export function SlidingSwitch<T extends string>({
  items,
  value,
  onChange,
  label,
  iconOnly = false,
  className,
}: GroupProps<T> & { iconOnly?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { box, ready } = useIndicator(ref, value)
  return (
    <Group
      items={items}
      label={label}
      groupRef={ref}
      className={cn('relative inline-grid rounded-control border border-line bg-ink/[0.03] p-1', className)}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      <Indicator box={box} ready={ready} className="rounded-chip bg-raised shadow-hairline" />
      {items.map((item) => (
        <Segment
          key={item.value}
          item={item}
          active={item.value === value}
          onChange={onChange}
          iconOnly={iconOnly}
          className={cn(
            'flex h-7 items-center justify-center gap-1.5 rounded-chip text-label font-medium',
            SEG,
            iconOnly ? 'w-10' : 'px-3.5',
            item.value === value ? 'text-ink' : 'text-muted not-disabled:hover:text-ink',
          )}
        />
      ))}
    </Group>
  )
}

/* -------------------------------------------------------- FilterPills */

/**
 * Filter pills with counts, on a rounded-full wash — one axis, every option
 * worth seeing at once (All · Draft · Active · Closed).
 */
export function FilterPills<T extends string>({ items, value, onChange, label, className }: GroupProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const { box, ready } = useIndicator(ref, value)
  return (
    <Group
      items={items}
      label={label}
      groupRef={ref}
      className={cn('relative inline-flex flex-wrap items-center gap-1 rounded-full bg-ink/[0.04] p-1', className)}
    >
      <Indicator box={box} ready={ready} className="rounded-full bg-raised shadow-pill" />
      {items.map((item) => (
        <Segment
          key={item.value}
          item={item}
          active={item.value === value}
          onChange={onChange}
          className={cn(
            'u-press inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-label font-medium',
            SEG,
            item.value === value ? 'text-ink' : 'text-muted not-disabled:hover:bg-ink/[0.04] not-disabled:hover:text-ink',
          )}
        />
      ))}
    </Group>
  )
}

/* ---------------------------------------------------- IconToggleGroup */

/** Icon-only toggle on a pill track — list / grid. */
export function IconToggleGroup<T extends string>({ items, value, onChange, label, className }: GroupProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const { box, ready } = useIndicator(ref, value)
  return (
    <Group items={items} label={label} groupRef={ref} className={cn('relative inline-flex items-center gap-1 rounded-full bg-ink/[0.04] p-1', className)}>
      <Indicator box={box} ready={ready} className="rounded-full bg-raised shadow-pill" />
      {items.map((item) => (
        <Segment
          key={item.value}
          item={item}
          active={item.value === value}
          onChange={onChange}
          iconOnly
          className={cn('u-press grid h-7 w-8 place-items-center rounded-full', SEG, item.value === value ? 'text-ink' : 'text-muted not-disabled:hover:text-ink')}
        />
      ))}
    </Group>
  )
}

/* -------------------------------------------------------- UnderlineNav */

/**
 * Top-level navigation inside a header: full bar height, so the underline
 * lands on the header's own hairline — and slides along it to the chosen tab.
 */
export function UnderlineNav<T extends string>({ items, value, onChange, label, className }: GroupProps<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const { box, ready } = useIndicator(ref, value)
  return (
    <Group items={items} label={label} groupRef={ref} className={cn('relative flex items-center gap-4 sm:gap-6', className)}>
      {items.map((item) => (
        <Segment
          key={item.value}
          item={item}
          active={item.value === value}
          onChange={onChange}
          className={cn(
            'relative flex min-h-14 items-center gap-1.5 whitespace-nowrap text-ui font-medium transition-colors duration-[var(--lui-duration-slide)] ease-out focus-visible:-outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40',
            item.value === value ? 'text-ink' : 'text-muted not-disabled:hover:text-ink',
          )}
        />
      ))}
      <Indicator box={box && { ...box, y: box.y + box.h - 1, h: 2 }} ready={ready} className="z-10 rounded-full bg-ink" />
    </Group>
  )
}
