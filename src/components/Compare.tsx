import { Check } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { LetterBadge } from './Badge'

/* ------------------------------------------------------------ SelectButton */

export interface SelectButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected: boolean
  label?: React.ReactNode
  selectedLabel?: React.ReactNode
  /**
   * Which option this answers for — read after the label ("Select this one,
   * option A") so a list of identical buttons can be told apart by ear.
   */
  context?: React.ReactNode
}

/** The answer control at the foot of an option — outlined at rest, ink with a tick once chosen. */
export function SelectButton({ selected, label = 'Select this one', selectedLabel = 'Selected', context, className, ...rest }: SelectButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'u-press flex w-full items-center justify-center gap-1.5 rounded-control border py-2.5 text-ui font-semibold focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        selected
          ? 'border-ink bg-ink text-on-ink'
          : 'border-line-control text-ink not-disabled:hover:border-ink/60 not-disabled:hover:bg-ink/[0.03] disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {selected && <Check size={15} weight="bold" aria-hidden="true" className="u-icon-in" />}
      {selected ? selectedLabel : label}
      {context && <span className="sr-only">, {context}</span>}
    </button>
  )
}

/* --------------------------------------------------------------- ChoiceRow */

export interface ChoiceRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected: boolean
  label: React.ReactNode
}

/**
 * An answer with nothing to show — "Both feel equal". A full-width row under
 * the options rather than an empty card beside real ones.
 */
export function ChoiceRow({ selected, label, className, ...rest }: ChoiceRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'u-press flex w-full items-center justify-center gap-1.5 rounded-2xl border px-4 py-3.5 text-body font-medium focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        selected ? 'border-ink bg-ink text-on-ink' : 'border-line-control bg-card text-ink not-disabled:hover:border-ink/60 disabled:opacity-50',
        className,
      )}
      data-static
      {...rest}
    >
      {selected && <Check size={16} weight="bold" aria-hidden="true" className="u-icon-in" />}
      {label}
    </button>
  )
}

/* -------------------------------------------------------------- OptionCard */

export interface OptionCardProps {
  /** A / B / C. Omit for media that's shown but not chosen between. */
  letter?: string
  title?: React.ReactNode
  description?: React.ReactNode
  /** Right of the title — a Reset button, a "tap to zoom" hint. */
  headerAction?: React.ReactNode
  /** The media. */
  children: React.ReactNode
  selected?: boolean
  /** Pointed at from elsewhere — ink border and lift, without being chosen. */
  lifted?: boolean
  /** Fade the media back so a sibling can stand out. The header and the
   *  answer stay at full strength — they still have to be read. */
  dimmed?: boolean
  /** Adds the SelectButton footer. */
  onSelect?: () => void
  selectDisabled?: boolean
  onHoverChange?: (hovered: boolean) => void
  className?: string
}

/**
 * One option in a comparison: a labelled header, the media given room, and the
 * answer sitting on the thing it answers about. Pointing at an option lifts it;
 * its siblings can dim so "which one is that again?" answers itself.
 */
export function OptionCard({
  letter,
  title,
  description,
  headerAction,
  children,
  selected = false,
  lifted = false,
  dimmed = false,
  onSelect,
  selectDisabled,
  onHoverChange,
  className,
}: OptionCardProps) {
  const emphasised = lifted || selected
  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-tile border bg-card transition-[border-color,box-shadow] duration-200 ease-out',
        emphasised ? 'border-ink shadow-lift' : 'border-line',
        className,
      )}
    >
      {(letter || title) && (
        <div className="flex flex-none items-center justify-between gap-3 border-b border-line px-4 py-3">
          <span className="flex min-w-0 items-center gap-2">
            {letter && <LetterBadge letter={letter} active={emphasised} />}
            {title && <span className="line-clamp-2 text-body font-semibold leading-snug tracking-tight text-balance">{title}</span>}
          </span>
          {headerAction}
        </div>
      )}
      {description && <p className="flex-none border-b border-line px-4 py-2.5 text-ui text-pretty text-muted">{description}</p>}
      <div className={cn('flex flex-1 items-center justify-center p-4 transition-opacity duration-200 ease-out', dimmed && 'opacity-35')}>{children}</div>
      {onSelect && (
        // p-1.5: the button's 14px corners sit concentric inside the card's 20px.
        <div className="mt-auto flex-none border-t border-line p-1.5">
          <SelectButton
            selected={selected}
            context={letter ? `option ${letter}` : undefined}
            onClick={onSelect}
            disabled={selectDisabled}
            onFocus={() => onHoverChange?.(true)}
            onBlur={() => onHoverChange?.(false)}
          />
        </div>
      )}
    </div>
  )
}

/** A small outlined action for a card header — "↻ Reset". */
export function HeaderChip({ icon, children, onClick }: { icon?: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  if (!onClick) {
    return <span className="inline-flex flex-none items-center gap-1 whitespace-nowrap text-label text-muted">{children}{icon}</span>
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="u-press inline-flex flex-none items-center gap-1 rounded-xl border border-line-strong px-2.5 py-1 text-label font-medium text-muted hover:bg-ink/[0.03] hover:text-ink focus-visible:outline-offset-2"
    >
      {icon}
      {children}
    </button>
  )
}
