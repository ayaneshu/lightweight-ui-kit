import { cn } from '../lib/cn'

export type HeadingSize = 'figure' | 'display-lg' | 'display' | 'display-sm' | 'title' | 'subtitle'

/**
 * Sizes over 20px set in the pixel display face; 20px and under in Geist Sans.
 * The cut-off is a rule, not a preference — a 17px dialog title in the display
 * face reads as a rendering fault, not as branding. The pixel face ships one
 * weight (500), so it's set at that weight rather than a browser-faked bold.
 * Every size is a named step; headings balance their lines.
 */
const HEADING: Record<HeadingSize, string> = {
  figure: 'font-pixel text-figure font-medium tracking-tight',
  'display-lg': 'font-pixel text-display-sm font-medium tracking-tight text-balance sm:text-display-lg',
  display: 'font-pixel text-display-sm font-medium tracking-tight text-balance sm:text-display',
  'display-sm': 'font-pixel text-display-xs font-medium tracking-tight text-balance sm:text-display-sm',
  title: 'font-sans text-title font-semibold tracking-tight text-balance',
  subtitle: 'font-sans text-body font-semibold tracking-tight text-balance',
}

const DEFAULT_LEVEL: Record<HeadingSize, 1 | 2 | 3> = {
  figure: 2,
  'display-lg': 1,
  display: 1,
  'display-sm': 1,
  title: 2,
  subtitle: 3,
}

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: HeadingSize
  /** The element — independent of the visual size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export function Heading({ size = 'display-sm', level, className, ...rest }: HeadingProps) {
  const Tag = `h${level ?? DEFAULT_LEVEL[size]}` as 'h1'
  return <Tag className={cn(HEADING[size], className)} {...rest} />
}

export type TextSize = 'caption' | 'label' | 'ui' | 'body'

// Spelled out so Tailwind's scanner can see every class.
const TEXT_SIZE: Record<TextSize, string> = {
  caption: 'text-caption',
  label: 'text-label',
  ui: 'text-ui',
  body: 'text-body',
}

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'label'
  size?: TextSize
  tone?: 'ink' | 'muted' | 'danger'
  weight?: 'regular' | 'medium' | 'semibold'
  /** Relaxed leading for multi-line reading copy. */
  relaxed?: boolean
  /** Tabular figures, for numbers that should line up. */
  numeric?: boolean
}

export function Text({
  as: Tag = 'p',
  size = 'ui',
  tone = 'ink',
  weight = 'regular',
  relaxed = false,
  numeric = false,
  className,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={cn(
        TEXT_SIZE[size],
        tone === 'muted' && 'text-muted',
        tone === 'danger' && 'text-danger',
        weight === 'medium' && 'font-medium',
        weight === 'semibold' && 'font-semibold',
        relaxed && 'leading-relaxed text-pretty',
        numeric && 'tabular-nums',
        className,
      )}
      {...rest}
    />
  )
}

/** Small caps-style section label — "RESULTS SO FAR", "RESPONSES". */
export function Overline({ className, children, as: Tag = 'p' }: { className?: string; children: React.ReactNode; as?: 'p' | 'span' }) {
  return <Tag className={cn('text-label font-semibold uppercase tracking-wide text-muted', className)}>{children}</Tag>
}

/** The muted line above a page title — "Your workspace", "Design system · v0.1". */
export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-ui font-medium text-muted', className)}>{children}</p>
}

/** A hairline. With a label it becomes the "or" divider between two routes. */
export function Divider({ label, className }: { label?: React.ReactNode; className?: string }) {
  if (!label) return <hr className={cn('border-0 border-t border-line', className)} />
  // Not role="separator": a separator's children are hidden from assistive
  // tech, and the label ("or") is the part worth reading.
  return (
    <div className={cn('flex items-center gap-3 text-label text-muted', className)}>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      {label}
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  )
}
