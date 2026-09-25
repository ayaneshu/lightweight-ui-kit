import { cn } from '../lib/cn'
import { AvatarStack } from './Avatar'
import { StatusBadge, type Status } from './Badge'

/* ------------------------------------------------------------------ Card */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `flat` — a hairline only (the default: on a white page a border is enough).
   * `raised` — adds the long soft card shadow, for something that floats.
   * `dashed` — a space waiting to be filled.
   */
  variant?: 'flat' | 'raised' | 'dashed'
  radius?: 'tile' | 'panel' | 'sheet'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Hover darkens the border and lifts the card a couple of pixels onto a soft shadow. */
  interactive?: boolean
}

const RADIUS = { tile: 'rounded-tile', panel: 'rounded-panel', sheet: 'rounded-sheet' }
const PADDING = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ variant = 'flat', radius = 'panel', padding = 'md', interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'border',
        RADIUS[radius],
        PADDING[padding],
        variant === 'dashed' ? 'border-dashed border-line-strong bg-ink/[0.015]' : 'border-line bg-card',
        variant === 'raised' && 'shadow-card',
        interactive &&
          'transition-[border-color,background-color,translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card',
        className,
      )}
      {...rest}
    />
  )
}

/** The card a chart sits on — title left, a quiet fact right. Flat, so a report reads as one document. */
export function ChartCard({
  title,
  meta,
  className,
  children,
}: {
  title: React.ReactNode
  meta?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn('rounded-panel border border-line bg-card p-5', className)}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="min-w-0 font-sans text-ui font-semibold tracking-tight text-balance">{title}</h2>
        {meta && <span className="flex-none text-label text-muted">{meta}</span>}
      </div>
      {children}
    </section>
  )
}

/* ---------------------------------------------------------------- Numbers */

/**
 * The one number a report leads with, in the display face at 52px — it's the
 * headline, not a field. Every other number is a supporting detail in Geist.
 */
export function HeroFigure({ value, label, sub, className }: { value: React.ReactNode; label: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-label font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-pixel text-figure font-medium leading-none tracking-tight tabular-nums">{value}</p>
      {sub && <p className="mt-2 text-label text-muted">{sub}</p>}
    </div>
  )
}

/** A supporting number beside the hero — label, value, optional note. */
export function StatTile({ label, value, sub, className }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('cursor-default rounded-2xl border border-line bg-card px-4 py-3.5', className)}>
      <p className="text-caption font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-title font-semibold leading-tight tracking-tight tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-caption text-muted">{sub}</p>}
    </div>
  )
}

/** A labelled fact — label over value, so two sit side by side on a card. */
export function MetaItem({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-label text-muted">{label}</p>
      <p className="mt-0.5 flex min-w-0 text-ui font-medium text-ink">{children}</p>
    </div>
  )
}

/** A count set large beside its unit — "12 responses". */
export function Count({ value, unit, className }: { value: React.ReactNode; unit: React.ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-baseline gap-1.5', className)}>
      <span className="text-stat font-semibold leading-none tabular-nums">{value}</span>
      <span className="text-label text-muted">{unit}</span>
    </p>
  )
}

/* --------------------------------------------------------- ThumbnailCard */

/** The artwork eases in a little while the card is hovered — slow, so it reads as depth, not as a jump. */
function Zoom({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full transition-[scale] duration-500 ease-out group-hover:scale-[1.03]">{children}</div>
}

export interface ThumbnailCardProps {
  /** The artwork — an <img>, a HeroPanel. Clipped to the card's top corners. */
  thumbnail: React.ReactNode
  title: React.ReactNode
  href?: string
  status?: Status
  /** Faces that straddle the thumbnail's bottom edge. */
  people?: { person: string; label?: string }[]
  /** Two labelled facts along the bottom — the list view's columns, card-shaped. */
  meta?: { label: React.ReactNode; value: React.ReactNode }[]
  /** Left of the footer — usually a <Count>. */
  footer?: React.ReactNode
  /** Right of the footer — one primary action. */
  action?: React.ReactNode
  /** A menu floated over the artwork, revealed on hover. */
  menu?: React.ReactNode
  /** Raise the card while its menu is open, so the menu clears its neighbours. */
  raised?: boolean
  /** Replaces the title while set — an inline rename field. A link wrapping an
   *  input couldn't be clicked into without following it. */
  titleEditor?: React.ReactNode
  className?: string
}

/**
 * An object on a dashboard: its artwork, who's on it, its state, its name, two
 * facts, and one thing to do. Flat — a single hairline carries it, and hover
 * shifts the border and surface rather than adding elevation.
 */
export function ThumbnailCard({
  thumbnail,
  title,
  href,
  status,
  people,
  meta,
  footer,
  action,
  menu,
  raised = false,
  titleEditor,
  className,
}: ThumbnailCardProps) {
  const Title = (
    <h2 className="line-clamp-2 font-sans text-title font-semibold leading-snug tracking-tight text-balance">{title}</h2>
  )
  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-tile border bg-card transition-[border-color,translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card',
        raised ? 'z-[100] border-line-strong' : 'border-line hover:border-line-strong',
        className,
      )}
    >
      {/* rounded-t-[19px]: inside a 1px border, matching the outer 20px leaves a
          hairline of card showing at the corners. */}
      {href ? (
        <a href={href} tabIndex={-1} aria-hidden="true" className="block aspect-[17/6] w-full overflow-hidden rounded-t-[19px] bg-ink/[0.03]">
          <Zoom>{thumbnail}</Zoom>
        </a>
      ) : (
        <div className="aspect-[17/6] w-full overflow-hidden rounded-t-[19px] bg-ink/[0.03]">
          <Zoom>{thumbnail}</Zoom>
        </div>
      )}

      {menu && (
        // Hidden until hover only where hover exists — on touch it's always
        // there. Also shown while focused, and while its menu holds the card up.
        <div
          className={cn(
            'absolute end-2 top-2 z-[150] transition-opacity duration-150',
            !raised && '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:opacity-100',
          )}
        >
          {menu}
        </div>
      )}

      <div className="relative flex flex-1 flex-col p-4">
        {people && people.length > 0 && (
          <div className="absolute -top-4 end-4">
            <AvatarStack people={people} max={3} ring="card" />
          </div>
        )}
        {status && (
          <div className="self-start">
            <StatusBadge status={status} />
          </div>
        )}
        {titleEditor ? (
          <div className={cn(status && 'mt-3')}>{titleEditor}</div>
        ) : href ? (
          <a href={href} className={cn(status && 'mt-3', 'rounded-md focus-visible:outline-offset-2')}>
            {Title}
          </a>
        ) : (
          <div className={cn(status && 'mt-3')}>{Title}</div>
        )}
        {meta && meta.length > 0 && (
          <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
            {meta.map((m, i) => (
              <MetaItem key={i} label={m.label}>
                <span className="truncate tabular-nums" title={typeof m.value === 'string' ? m.value : undefined}>
                  {m.value}
                </span>
              </MetaItem>
            ))}
          </div>
        )}
      </div>

      {(footer || action) && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <div className="min-w-0">{footer}</div>
          {action}
        </div>
      )}
    </div>
  )
}
