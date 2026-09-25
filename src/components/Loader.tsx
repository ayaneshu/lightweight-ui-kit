import { useEffect, useRef, useState } from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '../lib/cn'

/* ------------------------------------------------------------ useLoading */

/**
 * Whether a loader should be on screen for something that's `active`. It
 * waits `delay` before appearing, so a fast load never flashes a loader at
 * all, and once shown it stays at least `minVisible`, so a load that ends
 * just after it appears doesn't flicker.
 */
export function useLoading(active: boolean, { delay = 150, minVisible = 400 }: { delay?: number; minVisible?: number } = {}) {
  const [shown, setShown] = useState(false)
  const since = useRef(0)
  useEffect(() => {
    if (active) {
      if (shown) return
      const t = setTimeout(() => {
        since.current = Date.now()
        setShown(true)
      }, delay)
      return () => clearTimeout(t)
    }
    if (!shown) return
    const t = setTimeout(() => setShown(false), Math.max(0, minVisible - (Date.now() - since.current)))
    return () => clearTimeout(t)
  }, [active, shown, delay, minVisible])
  return shown
}

/* ---------------------------------------------------------------- Loader */

export type LoaderVariant = 'pixel' | 'dots' | 'spinner' | 'bar'
export type LoaderSize = 'sm' | 'md' | 'lg'

export interface LoaderProps {
  /**
   * `pixel` — a 3×3 grid breathing in a diagonal wave (the kit's own).
   * `dots` — three bouncing dots, for inline text. `spinner` — a turning
   * ring, for buttons. `bar` — a sweeping line, for the top of a card.
   */
  variant?: LoaderVariant
  size?: LoaderSize
  /** Read by screen readers — say what's loading when you can. */
  label?: string
  className?: string
}

const PIXEL = { sm: { cell: 3, gap: 1 }, md: { cell: 4, gap: 1.5 }, lg: { cell: 6, gap: 2 } }
const DOT = { sm: 4, md: 6, lg: 8 }
const SPIN = { sm: 14, md: 20, lg: 28 }

/**
 * Something is on its way. Takes the text colour, so it sits in a button, a
 * card or a page without restyling. Announced once as a status; the motion
 * itself is decoration.
 */
export function Loader({ variant = 'pixel', size = 'md', label = 'Loading', className }: LoaderProps) {
  let glyph: React.ReactNode
  if (variant === 'pixel') {
    const { cell, gap } = PIXEL[size]
    glyph = (
      <span className="u-loader-pixel grid grid-cols-3" style={{ gap }}>
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="rounded-[1px] bg-current"
            // A diagonal wave: each cell a beat after the one up and to its left.
            style={{ width: cell, height: cell, animationDelay: `${((i % 3) + Math.floor(i / 3)) * 110}ms` }}
          />
        ))}
      </span>
    )
  } else if (variant === 'dots') {
    const d = DOT[size]
    glyph = (
      <span className="u-loader-dots inline-flex items-center" style={{ gap: d * 0.6, height: d * 2.4 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="u-circle rounded-full bg-current" style={{ width: d, height: d, animationDelay: `${i * 140}ms` }} />
        ))}
      </span>
    )
  } else if (variant === 'spinner') {
    glyph = <CircleNotch size={SPIN[size]} className="animate-spin [animation-duration:700ms]" />
  } else {
    glyph = (
      <span className={cn('relative block w-full overflow-hidden rounded-full bg-current/15', size === 'lg' ? 'h-1' : 'h-0.5')}>
        <span className="u-loader-bar absolute inset-y-0 start-0 w-[40%] rounded-full bg-current" />
      </span>
    )
  }
  return (
    <span role="status" className={cn(variant === 'bar' ? 'block w-full' : 'inline-flex items-center justify-center', 'select-none text-muted', className)}>
      <span aria-hidden="true" className={variant === 'bar' ? 'block w-full' : 'inline-flex'}>
        {glyph}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  )
}

/* --------------------------------------------------------- LoaderOverlay */

export interface LoaderOverlayProps {
  loading: boolean
  label?: string
  variant?: Exclude<LoaderVariant, 'bar'>
  /** Wait this long before covering anything — fast loads never flash. */
  delay?: number
  className?: string
  children: React.ReactNode
}

/**
 * A component-level loader: the content stays in place, dims and goes inert,
 * and a loader fades in over it. The layout never jumps, and a refresh keeps
 * the old content visible underneath instead of blanking it.
 */
export function LoaderOverlay({ loading, label = 'Loading', variant = 'pixel', delay, className, children }: LoaderOverlayProps) {
  const shown = useLoading(loading, { delay })
  return (
    <div className={cn('relative', className)} aria-busy={loading || undefined}>
      <div inert={shown || undefined} className={cn('transition-opacity duration-200 ease-out', shown && 'opacity-35')}>
        {children}
      </div>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-200 ease-out',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      >
        {shown && <Loader variant={variant} size="lg" label={label} className="text-ink" />}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ PageLoader */

export interface PageLoaderProps {
  /** True while the next page (or any page-wide work) is loading. */
  active: boolean
  /** Wait this long before showing the bar — a fast navigation shows nothing. */
  delay?: number
  className?: string
}

/**
 * A page-level loader: a thin bar across the top of the window. It creeps
 * toward the end while the load runs — fast at first, then slower, never
 * quite arriving — and when the load finishes it runs to the end and fades.
 * It moves with a transform only, and never covers the page, so you can keep
 * reading while it works.
 */
export function PageLoader({ active, delay = 120, className }: PageLoaderProps) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (active) {
      const start = setTimeout(() => {
        setPhase('running')
        setProgress(0.12)
      }, delay)
      const trickle = setInterval(() => setProgress((p) => (p ? p + (0.9 - p) * 0.14 : p)), 280)
      return () => {
        clearTimeout(start)
        clearInterval(trickle)
      }
    }
    setPhase((ph) => (ph === 'running' ? 'done' : ph))
  }, [active, delay])

  useEffect(() => {
    if (phase !== 'done') return
    setProgress(1)
    const t = setTimeout(() => {
      setPhase('idle')
      setProgress(0)
    }, 420)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 transition-opacity duration-300 ease-out',
        phase === 'running' ? 'opacity-100' : phase === 'done' ? 'opacity-0 delay-200' : 'opacity-0',
        className,
      )}
    >
      <div
        data-lui-motion
        className={cn(
          'h-full origin-left bg-ink shadow-[0_0_8px_var(--color-ink)] rtl:origin-right',
          phase !== 'idle' && 'transition-transform duration-300 ease-out',
        )}
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
