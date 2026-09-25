import { cn } from '../lib/cn'
import { onColor, tint } from '../lib/color'
import Tooltip from './Tooltip'

/**
 * The chart language. Colour does exactly one job per chart:
 *
 *   • Options are *identity* — which one won — so they take a categorical
 *     palette assigned by position, never by rank. A is always blue.
 *   • Ratings are *ordered* (1★ → 5★), so they take a one-hue ramp.
 *   • Anything nominal (a multiple choice) is one series: one hue, no legend.
 *
 * Both palettes are validated rather than eyeballed. Two option hues sit under
 * 3:1 against white, which is legal only because every value is also written
 * out beside its mark — never hover-only.
 */
export const OPTION_COLORS = ['#277fff', '#1baf7a', '#eda100', '#008300'] as const

/** One vivid azure, light to deep (OKLCH hue 259). Steps read as order; every value is also written out. */
export const RATING_RAMP = ['#a4c9ff', '#6fabff', '#277fff', '#0260d9', '#0347a2'] as const

/** Option identity by position — never by tally. */
export function optionColor(index: number): string {
  return OPTION_COLORS[index % OPTION_COLORS.length]
}

/** Every mark: 28px tall, 10px radius — chunky enough to carry a label inside. */
const BAR = 'h-7 rounded-chip'

/**
 * Marks grow by sliding a full-size fill into view inside a clipped rail —
 * `translate` runs on the compositor, where animating width or height would
 * lay the page out again on every frame. Reduced motion snaps to the value.
 */
const GROW = 'transition-[translate,filter] duration-[var(--lui-duration-chart)] ease-out'

/** "1 vote", "2 votes" — pass `units` where adding an s is wrong ("replies"). */
function counted(n: number, unit: string, units = `${unit}s`) {
  return `${n} ${n === 1 ? unit : units}`
}

export interface Slice {
  id: string
  label: string
  value: number
  color: string
}

/**
 * Part-to-whole in one bar. At two to four options a single split answers
 * "what share went to B?" in one look. The 3px gaps are the surface showing
 * through, so neighbours stay distinct without extra ink.
 */
export function ShareBar({
  slices,
  total,
  unit = 'vote',
  units,
  className,
}: {
  slices: Slice[]
  total?: number
  unit?: string
  units?: string
  className?: string
}) {
  const sum = total ?? slices.reduce((s, x) => s + x.value, 0)
  const shown = slices.filter((s) => s.value > 0)
  if (!sum || shown.length === 0) return <div className={cn(BAR, 'w-full bg-ink/[0.04]', className)} />
  return (
    // The one mark that animates width: its segments trade space with each
    // other, which no transform can express. It's short, and it's one row.
    <div className={cn('flex w-full gap-[3px] overflow-hidden bg-ink/[0.04]', BAR, className)}>
      {shown.map((s) => {
        const pct = (s.value / sum) * 100
        return (
          <Tooltip
            key={s.id}
            label={`${s.label} · ${counted(s.value, unit, units)} (${Math.round(pct)}%)`}
            className="h-7 items-center justify-center transition-[width,filter] duration-[var(--lui-duration-chart)] ease-out hover:brightness-110"
            style={{ width: `${pct}%`, background: s.color }}
          >
            {pct >= 11 ? (
              <span className="cursor-default select-none text-caption font-semibold tabular-nums" style={{ color: onColor(s.color) }}>
                {Math.round(pct)}%
              </span>
            ) : (
              <span className="sr-only">{s.label}</span>
            )}
          </Tooltip>
        )
      })}
    </div>
  )
}

/**
 * The share bar's key and its table in one: a swatch carries identity, the
 * name and numbers carry the values. The leader is said out loud.
 */
export function ShareLegend({
  slices,
  total,
  leadId,
  mineId,
  className,
}: {
  slices: Slice[]
  total?: number
  /** The option in front. Defaults to the largest, unless it's tied. */
  leadId?: string | null
  /** This viewer's pick. */
  mineId?: string | null
  className?: string
}) {
  const sum = total ?? slices.reduce((s, x) => s + x.value, 0)
  // Only a clear leader is named: a tie at the top has no one in front.
  const top = Math.max(0, ...slices.map((s) => s.value))
  const atTop = slices.filter((s) => s.value === top)
  const lead = leadId !== undefined ? leadId : top > 0 && atTop.length === 1 ? atTop[0].id : null
  return (
    <ul className={cn('space-y-2', className)}>
      {slices.map((s) => {
        const pct = sum ? Math.round((s.value / sum) * 100) : 0
        const isLead = s.id === lead
        return (
          <li key={s.id} className="flex items-center gap-2.5 text-ui">
            <span className="h-3 w-3 flex-none rounded-[4px]" style={{ background: s.color }} aria-hidden="true" />
            <span className={cn('min-w-0 flex-1 break-words', isLead ? 'font-semibold' : 'font-medium')}>{s.label}</span>
            {isLead && <span className="flex-none cursor-default select-none rounded-full bg-ink px-2 py-0.5 text-caption font-medium text-on-ink">Leading</span>}
            {s.id === mineId && <span className="flex-none cursor-default select-none rounded-full bg-ink/[0.06] px-2 py-0.5 text-caption text-muted">Your pick</span>}
            <span className="flex-none tabular-nums text-muted">
              <span className={isLead ? 'font-semibold text-ink' : 'text-ink'}>{pct}%</span> · {s.value}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** How tall a column's rail stands. The tallest value fills it. */
const COLUMN_H = 132

/**
 * Ordered buckets as columns — a rating's *shape* is the story ("clustered at
 * 4"). Each column stands in a full-height rail of its own hue, so the chart
 * has a frame without an axis and an empty bucket reads as an empty rail.
 */
export function DistributionColumns({
  buckets,
  ramp = RATING_RAMP,
  unit = 'answer',
  units,
  height = COLUMN_H,
  className,
}: {
  buckets: { label: string; value: number }[]
  ramp?: readonly string[]
  unit?: string
  units?: string
  height?: number
  className?: string
}) {
  const max = Math.max(...buckets.map((b) => b.value), 1)
  return (
    <div className={cn('flex items-end gap-2 sm:gap-3', className)}>
      {buckets.map((b, i) => {
        const color = ramp[i % ramp.length]
        const h = b.value === 0 ? 0 : Math.max(10, Math.round((b.value / max) * height))
        return (
          <div key={b.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className={cn('text-caption tabular-nums', b.value === max ? 'font-semibold text-ink' : 'font-medium text-muted')}>{b.value}</span>
            <Tooltip label={`${b.label} · ${counted(b.value, unit, units)}`} className="group/col w-full justify-center">
              <span className="relative block w-full max-w-[44px] overflow-hidden rounded-chip" style={{ height, background: tint(color) }} aria-hidden="true">
                <span
                  className={cn('absolute inset-0 rounded-chip translate-y-(--off) group-hover/col:brightness-110', GROW)}
                  style={{ background: color, ['--off' as string]: `${height - h}px` }}
                />
              </span>
            </Tooltip>
            <span className="w-full truncate text-center text-caption text-muted">{b.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Nominal buckets — labels with no order. One hue for every bar; length is
 * share of everyone who answered, so the track is the 100%.
 */
export function NominalBars({
  buckets,
  total,
  color = OPTION_COLORS[0],
  className,
}: {
  buckets: { label: string; value: number }[]
  total?: number
  color?: string
  className?: string
}) {
  // Share of everyone who answered — pass `total` for multi-select, where
  // answers outnumber people. Defaulting to the largest bucket would make a
  // 42% winner look like the whole vote.
  const basis = total || buckets.reduce((sum, b) => sum + b.value, 0) || 1
  return (
    <ul className={cn('space-y-3', className)}>
      {buckets.map((b) => {
        const pct = Math.round((b.value / basis) * 100)
        return (
          <li key={b.label}>
            <div className="flex items-baseline justify-between gap-3 text-ui">
              <span className="min-w-0 font-medium">{b.label}</span>
              <span className="flex-none tabular-nums text-muted">
                <span className="text-ink">{pct}%</span> · {b.value}
              </span>
            </div>
            <span className={cn('mt-2 block w-full overflow-hidden', BAR)} style={{ background: tint(color) }} aria-hidden="true">
              <span
                className={cn('block w-full -translate-x-(--off) rtl:translate-x-(--off)', BAR, GROW)}
                style={{ background: color, ['--off' as string]: `${100 - Math.min(100, (b.value / basis) * 100)}%` }}
              />
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** 1★…5★ always shows all five buckets — a missing rating is information. */
export function ratingBuckets(distribution: Record<string, number>) {
  return ['1', '2', '3', '4', '5'].map((k) => ({ label: `${k}★`, value: distribution[k] ?? 0 }))
}

/** Continuous answers binned into fifths of the scale, so they have a shape. */
export function sliderBuckets(distribution: Record<string, number>, min = 0, max = 100) {
  const span = Math.max(1, max - min)
  const size = span / 5
  const buckets = Array.from({ length: 5 }, (_, i) => ({
    label: `${Math.round(min + i * size)}–${Math.round(min + (i + 1) * size)}`,
    value: 0,
  }))
  for (const [k, n] of Object.entries(distribution)) {
    const v = Number(k)
    if (Number.isNaN(v)) continue
    const i = Math.min(4, Math.max(0, Math.floor(((v - min) / span) * 5)))
    buckets[i].value += n
  }
  return buckets
}
