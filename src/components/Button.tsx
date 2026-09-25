import { forwardRef } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import Tooltip from './Tooltip'

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'danger-outline' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

// Focus is the kit's 2px ink ring (theme.css) with room to breathe; forced-
// colours mode still gets the system ring.
const BASE =
  'u-press group/btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40'

/**
 * Three sizes: lg is every page-level call to action, md is a dialog's footer,
 * sm is a row action or a card footer. With an icon, the icon side gets 2px
 * less padding so the label sits optically centred.
 */
const SIZES: Record<ButtonSize, { base: string; lead: string; trail: string }> = {
  sm: { base: 'rounded-xl px-3 py-1.5 text-label', lead: 'ps-2.5', trail: 'pe-2.5' },
  md: { base: 'rounded-control px-3.5 py-2 text-ui', lead: 'ps-3', trail: 'pe-3' },
  lg: { base: 'rounded-2xl px-5 py-2.5 text-ui', lead: 'ps-4.5', trail: 'pe-4.5' },
}

/**
 * One ink primary per surface. Everything else steps down: secondary is a
 * hairline, soft is a wash, ghost is text until hovered. Danger is solid only
 * when it's the confirming action. Every colour is a token, so each variant is
 * right in light and dark without a single `dark:` class.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  // Solid fills lighten a touch and gain a soft shadow under the pointer, as
  // if they came up to meet it; everything else deepens its wash.
  primary: 'bg-ink text-on-ink not-disabled:hover:bg-ink/88 not-disabled:hover:shadow-[0_6px_16px_-8px_rgb(0_0_0/0.45)]',
  secondary: 'border border-line-strong bg-card text-ink not-disabled:hover:border-line-control not-disabled:hover:bg-ink/[0.03]',
  soft: 'bg-ink/[0.045] font-semibold text-ink not-disabled:hover:bg-ink/[0.08]',
  ghost: 'text-muted not-disabled:hover:bg-ink/[0.04] not-disabled:hover:text-ink',
  danger:
    'bg-danger-solid font-semibold text-white not-disabled:hover:bg-danger-solid/90 not-disabled:hover:shadow-[0_6px_16px_-8px_color-mix(in_oklab,var(--color-danger-solid)_70%,transparent)]',
  'danger-outline': 'border border-line-strong text-danger not-disabled:hover:bg-danger-bg not-disabled:hover:text-danger-strong',
  // A link-button still needs to read as a control, not as the copy beside it.
  link: 'text-muted underline decoration-line-control/60 underline-offset-4 not-disabled:hover:text-ink not-disabled:hover:decoration-current',
}

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the container's width. */
  block?: boolean
}

/**
 * The button's classes on their own, for things that must be a different
 * element — a router `<Link>`, an `<a>`, a `<label>` wrapping a file input.
 */
export function buttonClasses({ variant = 'primary', size = 'lg', block = false }: ButtonStyleProps = {}): string {
  // Hovers are `not-disabled:` rather than `enabled:` because `enabled:` never
  // matches an <a>, which would leave a styled link with no hover at all.
  return cn(BASE, SIZES[size].base, VARIANTS[variant], variant === 'link' && '!px-0 !py-0', block && 'w-full')
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  /** Shows a spinner beside the label and blocks presses, keeping the label. */
  loading?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /** No press scale — for a control where the motion would distract. */
  static?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size = 'lg', block, loading = false, leadingIcon, trailingIcon, static: isStatic, className, disabled, children, type = 'button', ...rest },
  ref,
) {
  const lead = loading || Boolean(leadingIcon)
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-static={isStatic || undefined}
      className={cn(
        buttonClasses({ variant, size, block }),
        variant !== 'link' && lead && SIZES[size].lead,
        variant !== 'link' && trailingIcon && SIZES[size].trail,
        className,
      )}
      {...rest}
    >
      {/* A fast spinner reads as a faster load. */}
      {loading ? <CircleNotch size={15} className="animate-spin [animation-duration:700ms]" aria-hidden="true" /> : leadingIcon}
      {children}
      {trailingIcon && (
        // A trailing arrow leans the way it points on hover — "this goes somewhere".
        <span className="inline-flex transition-[translate] duration-200 ease-out group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5">
          {trailingIcon}
        </span>
      )}
    </button>
  )
})

export type IconButtonVariant = 'ghost' | 'solid' | 'overlay' | 'glass' | 'light'
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const ICON_SIZES: Record<IconButtonSize, string> = {
  // 20px visible, 24px target (WCAG 2.5.8) via an invisible pseudo-element.
  xs: 'relative h-5 w-5 after:absolute after:left-1/2 after:top-1/2 after:size-6 after:-translate-1/2',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
}

/**
 * Ghost sits on the page. The other four sit on media, so they use the
 * constant `shade` rather than theme ink — a dark chip stays dark over a photo
 * in either theme. Glass survives any thumbnail; light is a white chip.
 */
const ICON_VARIANTS: Record<IconButtonVariant, string> = {
  ghost: 'text-muted hover:bg-ink/[0.06] hover:text-ink',
  solid: 'bg-shade/85 text-white hover:bg-shade',
  overlay: 'bg-shade/70 text-white hover:bg-shade',
  glass: 'bg-black/45 text-white backdrop-blur-sm hover:bg-black/65',
  light: 'bg-white/90 text-shade/70 shadow-sm hover:text-shade',
}

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Accessible name — required, since there's no visible text. */
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  shape?: 'circle' | 'square'
  /** Show the label as a hover tooltip too. */
  tooltip?: boolean | 'top' | 'bottom'
  /** For toggles. */
  pressed?: boolean
  /** No press scale. */
  static?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'lg', shape = 'circle', tooltip = false, pressed, static: isStatic, className, children, type = 'button', ...rest },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      data-static={isStatic || undefined}
      className={cn(
        // Not pointer-events-none when disabled: a disabled control's tooltip
        // should still say why.
        // The glyph grows a hair under the pointer — enough to say "pressable".
        'u-press grid flex-none place-items-center focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-30 [&>svg]:transition-[scale] [&>svg]:duration-200 [&>svg]:ease-out not-disabled:hover:[&>svg]:scale-110',
        ICON_SIZES[size],
        shape === 'circle' ? 'u-circle rounded-full' : size === 'lg' ? 'rounded-xl' : size === 'xs' ? 'rounded-md' : 'rounded-lg',
        ICON_VARIANTS[variant],
        pressed && variant === 'ghost' && 'bg-ink/[0.05] text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
  if (!tooltip) return button
  return (
    <Tooltip label={label} side={tooltip === 'bottom' ? 'bottom' : 'top'}>
      {button}
    </Tooltip>
  )
})
