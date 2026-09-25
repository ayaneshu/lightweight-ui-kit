import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CircleNotch, Info, WarningCircle, X } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { usePresence } from '../lib/hooks'

/* --------------------------------------------------------------- Spinner */

/**
 * Spins a little faster than the browser default — the same wait feels shorter
 * when the indicator looks busy.
 */
export function Spinner({ size = 22, label = 'Loading', className }: { size?: number; label?: string; className?: string }) {
  return (
    <span role="status" className={cn('inline-grid text-muted', className)}>
      <CircleNotch size={size} aria-hidden="true" className="animate-spin [animation-duration:700ms]" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/* -------------------------------------------------------------- Skeleton */

/** A placeholder block while content loads — a wash with a slow pulse. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-panel border border-line bg-ink/[0.015]', className)} />
}

/* ----------------------------------------------------------------- Toast */

export type ToastTone = 'ink' | 'card'

export interface ToastProps {
  tone?: ToastTone
  /** `fixed` pins it bottom-centre of the viewport; `static` renders in place. */
  position?: 'fixed' | 'static'
  /** Shows a × — for a toast that stays until it's dismissed. */
  onDismiss?: () => void
  className?: string
  children: React.ReactNode
}

const TOAST_TONE: Record<ToastTone, string> = {
  ink: 'bg-ink text-on-ink shadow-toast',
  card: 'border border-line bg-card text-ink shadow-toast',
}

/**
 * A one-line confirmation. Ink for "that worked"; card for a standing note
 * ("You have view-only access"). It rises from the bottom edge it lives on
 * and leaves the same way, a little faster.
 *
 * A bare Toast has no live region of its own — announce through
 * `ToastProvider`, whose region is in the page before anything is said.
 */
export function Toast({ tone = 'ink', position = 'fixed', onDismiss, className, children, ...rest }: ToastProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        'u-toast flex max-w-[calc(100%-2rem)] cursor-default items-center gap-3 rounded-control py-2.5 ps-4 text-ui font-medium',
        onDismiss ? 'pe-1.5' : 'pe-4',
        position === 'fixed' && 'fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[80] mx-auto w-fit',
        TOAST_TONE[tone],
        className,
      )}
    >
      <span className="min-w-0 text-pretty">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={cn(
            'u-circle u-press grid h-7 w-7 flex-none place-items-center rounded-full focus-visible:outline-offset-2',
            tone === 'ink' ? 'text-on-ink/70 hover:bg-on-ink/10 hover:text-on-ink' : 'text-muted hover:bg-ink/[0.05] hover:text-ink',
          )}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export interface ToastOptions {
  tone?: ToastTone
  /** Milliseconds on screen; `null` keeps it until dismissed. Default 5000. */
  duration?: number | null
}

interface ToastState extends Required<ToastOptions> {
  id: number
  message: React.ReactNode
}

const ToastContext = createContext<((message: React.ReactNode, opts?: ToastOptions) => void) | null>(null)

/**
 * Wrap the app once; then `useToast()` anywhere to show one.
 *
 * The live region is rendered up front and stays put, so screen readers are
 * already listening when a message lands in it. The timer pauses while the
 * pointer or focus is on the toast — nobody should race a message to read it.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [paused, setPaused] = useState(false)
  const { mounted, closing } = usePresence(Boolean(toast))
  // The last message stays rendered through the exit, after `toast` clears.
  const last = useRef<ToastState | null>(null)
  if (toast) last.current = toast
  const shown = toast ?? last.current
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => setHost(document.body), [])

  const show = useCallback((message: React.ReactNode, { tone = 'ink', duration = 5000 }: ToastOptions = {}) => {
    // A fresh id re-keys the element so a repeat toast replays its entrance.
    setToast({ id: Date.now(), message, tone, duration })
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!toast || toast.duration === null || paused) return
    const t = setTimeout(dismiss, toast.duration)
    return () => clearTimeout(t)
  }, [toast, paused, dismiss])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {host &&
        createPortal(
          <div data-lui-live="" role="status" aria-live="polite" aria-atomic="true">
            {mounted && shown && (
              <Toast
                key={shown.id}
                tone={shown.tone}
                data-closing={closing || undefined}
                onDismiss={shown.duration === null ? dismiss : undefined}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
              >
                {shown.message}
              </Toast>
            )}
          </div>,
          host,
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast() needs a <ToastProvider> above it.')
  return show
}

/* --------------------------------------------------------------- Callout */

export type CalloutTone = 'neutral' | 'danger' | 'success'

export interface CalloutProps {
  tone?: CalloutTone
  /** `card` is a rounded box in the flow; `banner` is a full-width strip under a header. */
  variant?: 'card' | 'banner'
  icon?: React.ReactNode | false
  title?: React.ReactNode
  actions?: React.ReactNode
  /**
   * Announce it when it appears — set this for a callout that shows up in
   * response to something (a failed save), not for one that's part of the
   * page from the start. `assertive` interrupts; keep it for errors.
   */
  live?: 'polite' | 'assertive'
  className?: string
  children?: React.ReactNode
}

const CALLOUT_TONE: Record<CalloutTone, string> = {
  neutral: 'border-line bg-ink/[0.025] text-muted',
  danger: 'border-danger-line bg-danger-bg text-danger-strong',
  success: 'border-open/20 bg-open-bg text-open',
}

const CALLOUT_ICON: Record<CalloutTone, React.ReactNode> = {
  neutral: <Info size={16} aria-hidden="true" />,
  danger: <WarningCircle size={16} aria-hidden="true" />,
  success: <Check size={16} aria-hidden="true" />,
}

/** A note in the flow of a page — status, a blocker, a heads-up. */
export function Callout({ tone = 'neutral', variant = 'card', icon, title, actions, live, className, children }: CalloutProps) {
  const glyph = icon === false ? null : (icon ?? CALLOUT_ICON[tone])
  return (
    <div
      role={live === 'assertive' ? 'alert' : live ? 'status' : undefined}
      className={cn(
        'flex items-start gap-2.5',
        variant === 'card' ? 'rounded-2xl border p-4' : 'border-b px-4 py-3',
        variant === 'banner' && tone === 'neutral' ? 'border-line bg-ink/[0.02] text-muted' : CALLOUT_TONE[tone],
        className,
      )}
    >
      {glyph && <span className="mt-0.5 flex-none">{glyph}</span>}
      <div className="min-w-0 flex-1">
        {title && <p className={cn('text-ui font-semibold text-balance', tone === 'neutral' && 'text-ink')}>{title}</p>}
        {children && <div className={cn(variant === 'banner' ? 'text-label' : 'text-ui', 'leading-relaxed text-pretty', title && 'mt-0.5')}>{children}</div>}
        {actions && <div className="mt-3 flex flex-wrap gap-2.5">{actions}</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ EmptyState */

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  /** A second, quieter line — why the action isn't offered here, say. */
  note?: React.ReactNode
  /** Less padding, no icon tile — for "No results" inside a list. */
  compact?: boolean
  /** Heading level, to fit the outline of the page it's on. */
  as?: 'h2' | 'h3' | 'p'
  className?: string
}

/**
 * A dashed box that says what goes here and how to put it there. Dashed because
 * it's a space waiting to be filled, not a card with something on it.
 */
export function EmptyState({ icon, title, description, action, note, compact = false, as: Heading = 'h2', className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-sheet border border-dashed border-line-strong bg-ink/[0.015] px-6 text-center',
        compact ? 'py-14' : 'py-16',
        className,
      )}
    >
      {icon && !compact && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ink/[0.06]" aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading className={cn('font-sans text-balance', compact ? 'text-body font-medium' : 'text-title font-semibold tracking-tight')}>{title}</Heading>
      {description && <p className={cn('max-w-sm leading-relaxed text-pretty text-muted', compact ? 'mt-1 text-ui' : 'mt-1.5 text-body')}>{description}</p>}
      {note && <p className="mt-4 max-w-sm text-ui leading-relaxed text-pretty text-muted">{note}</p>}
      {action && <div className={compact ? 'mt-4' : 'mt-5'}>{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------ Placeholder */

/** Where media would be — a dashed frame with a reason. */
export function Placeholder({ label, detail, className }: { label: React.ReactNode; detail?: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-[400px] w-[300px] max-w-full flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-ink/[0.015] px-6 text-center',
        className,
      )}
    >
      <span className="text-ui font-medium text-balance text-muted">{label}</span>
      {detail && <span className="mt-1.5 text-label leading-relaxed text-pretty text-muted">{detail}</span>}
    </div>
  )
}

/* ------------------------------------------------------------ SuccessMark */

/**
 * The end of something, centred and given room: an ink disc with a tick that
 * pops in once. Reserved for rare moments — the pop is the celebration.
 */
export function SuccessMark({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('u-circle u-pop grid flex-none place-items-center rounded-full bg-ink text-on-ink ring-8 ring-ink/[0.07]', className)}
      style={{ width: size, height: size }}
    >
      <Check size={Math.round(size * 0.47)} weight="bold" aria-hidden="true" />
    </span>
  )
}

/* ----------------------------------------------------------------- Nudge */

export interface NudgeProps {
  title: React.ReactNode
  body?: React.ReactNode
  cta?: React.ReactNode
  onAct?: () => void
  onDismiss?: () => void
  icon?: React.ReactNode
  /** Stick to the bottom of the scrolling column it sits in. */
  sticky?: boolean
  className?: string
}

/**
 * A prompt that rises from the bottom once something is finished, pointing at
 * whatever comes next. Sticky rather than fixed: it belongs to its column, not
 * the whole window.
 */
export function Nudge({ title, body, cta, onAct, onDismiss, icon, sticky = false, className }: NudgeProps) {
  const card = (
    <div
      className={cn(
        'u-rise pointer-events-auto flex w-full max-w-[540px] items-center gap-3 rounded-tile border border-line bg-card px-4 py-3 shadow-nudge',
        className,
      )}
    >
      <span className="u-circle grid h-8 w-8 flex-none place-items-center rounded-full bg-ink text-on-ink" aria-hidden="true">
        {icon ?? <Check size={16} weight="bold" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-ui font-semibold tracking-tight text-balance">{title}</p>
        {body && <p className="text-label leading-relaxed text-pretty text-muted">{body}</p>}
      </div>
      {cta && (
        <button
          type="button"
          onClick={onAct}
          className="u-press flex-none rounded-control bg-ink px-3.5 py-2 text-label font-semibold text-on-ink hover:bg-ink/88 hover:shadow-[0_6px_16px_-8px_rgb(0_0_0/0.45)] focus-visible:outline-offset-2"
        >
          {cta}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="u-circle u-press grid h-7 w-7 flex-none place-items-center rounded-full text-muted hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
  if (!sticky) return card
  return <div className="pointer-events-none sticky bottom-0 z-20 flex justify-center pt-6 pb-1">{card}</div>
}
