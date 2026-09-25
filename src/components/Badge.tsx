import { CaretUp, Check } from '@phosphor-icons/react'
import { cn } from '../lib/cn'

export type BadgeTone = 'neutral' | 'ink' | 'outline' | 'draft' | 'open' | 'closed' | 'danger'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-ink/[0.06] text-muted',
  ink: 'bg-ink text-on-ink',
  outline: 'border border-line text-muted',
  draft: 'bg-draft-bg text-draft',
  open: 'bg-open-bg text-open',
  closed: 'bg-closed-bg text-closed',
  danger: 'bg-danger-bg text-danger-strong',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  size?: 'sm' | 'md'
  /** A leading dot in the text colour — how state badges announce themselves. */
  dot?: boolean
  icon?: React.ReactNode
}

/** A rounded-full label. `sm` for tags beside data, `md` for state. */
export function Badge({ tone = 'neutral', size = 'md', dot = false, icon, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-none cursor-default select-none items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-1 text-label',
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className="u-circle h-1.5 w-1.5 flex-none rounded-full bg-current" aria-hidden="true" />}
      {icon}
      {children}
    </span>
  )
}

export type Status = 'draft' | 'open' | 'closed'

const STATUS_LABEL: Record<Status, string> = { draft: 'Draft', open: 'Active', closed: 'Closed' }

/** Draft · Active · Closed — muted accents, each with its word, never colour alone. */
export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  return (
    <Badge tone={status} dot className={className}>
      {label ?? STATUS_LABEL[status]}
    </Badge>
  )
}

/**
 * The small count that trails a filter label. Its tint follows the text colour
 * around it, so it reads on a white pill and on an ink segment alike.
 */
export function CountBadge({ children, active = false, className }: { children: React.ReactNode; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'select-none rounded-full px-1.5 py-0.5 text-micro font-semibold tabular-nums transition-colors',
        active ? 'bg-current/10' : 'bg-ink/[0.05] text-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}

export interface DotProps {
  /** Any CSS colour; defaults to the "open" green used for unread. */
  color?: string
  size?: number
  /** A ring in the surface colour, for a dot sitting over another element. */
  ring?: boolean
  pulse?: boolean
  className?: string
}

/** Unread markers, presence dots, recording lights. Decorative — pair with text. */
export function Dot({ color, size = 8, ring = false, pulse = false, className }: DotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('u-circle inline-block flex-none rounded-full', !color && 'bg-open', ring && 'ring-2 ring-bg', pulse && 'animate-pulse', className)}
      style={{ width: size, height: size, ...(color ? { backgroundColor: color } : null) }}
    />
  )
}

/**
 * The A / B / C tile that names an option. Neutral at rest, ink when that
 * option is the one being pointed at or chosen.
 */
export function LetterBadge({ letter, active = false, className }: { letter: string; active?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid h-6 w-6 flex-none cursor-default select-none place-items-center rounded-md text-caption font-semibold transition-colors',
        active ? 'bg-ink text-on-ink' : 'bg-ink/[0.06] text-muted',
        className,
      )}
    >
      {letter}
    </span>
  )
}

/**
 * A small square holding a glyph — the page-type and input-type tiles, and the
 * rail's readiness indicator. `done` tints it green *and* adds a tick, so
 * readiness never rests on colour alone.
 */
export function IconTile({
  children,
  size = 'md',
  done = false,
  className,
}: {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  done?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid flex-none place-items-center transition-colors',
        size === 'sm' && 'h-5 w-5 rounded-md text-micro',
        size === 'md' && 'h-6 w-6 rounded-lg',
        size === 'lg' && 'h-12 w-12 rounded-2xl',
        done ? 'bg-open-bg text-open' : 'bg-ink/[0.06]',
        className,
      )}
    >
      {children}
      {done && (
        <span className="u-circle u-icon-in absolute -bottom-1 -end-1 grid h-3 w-3 place-items-center rounded-full bg-open text-white ring-2 ring-card">
          <Check size={8} weight="bold" />
        </span>
      )}
    </span>
  )
}

/** A count with a caret — an upvotable answer. Static without `onClick`. */
export function UpvoteChip({ count, onClick, className }: { count: number; onClick?: () => void; className?: string }) {
  const inner = (
    <>
      <CaretUp size={11} weight="bold" aria-hidden="true" />
      {count}
    </>
  )
  if (!onClick) {
    return (
      <span
        aria-label={`${count} upvotes`}
        className={cn('inline-flex flex-none cursor-default select-none items-center gap-1 rounded-full bg-ink/[0.06] px-2 py-0.5 text-label tabular-nums text-muted', className)}
      >
        {inner}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Upvote — ${count} so far`}
      className={cn(
        'u-press inline-flex min-h-6 flex-none items-center gap-1 rounded-full border border-line px-2 py-0.5 text-label font-medium tabular-nums text-muted hover:border-line-control hover:text-ink focus-visible:outline-offset-2 [&>svg]:transition-[translate] [&>svg]:duration-200 [&>svg]:ease-out hover:[&>svg]:-translate-y-0.5',
        className,
      )}
    >
      {inner}
    </button>
  )
}
