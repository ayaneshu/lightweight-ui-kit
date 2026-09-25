import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'
import { useDismiss } from '../lib/hooks'

/** Long enough that sweeping across a toolbar doesn't strobe labels. */
const OPEN_DELAY = 300
/** A tooltip that opens within this long of another closing skips delay and fade. */
const WARM_WINDOW = 400
let lastClosedAt = 0

export interface TooltipProps {
  label: React.ReactNode
  side?: 'top' | 'bottom'
  className?: string
  /** For triggers whose size is computed — a chart segment's width, say. */
  style?: React.CSSProperties
  /** Open without the hover delay. */
  instant?: boolean
  children: React.ReactNode
}

/**
 * Small hover label for icon-only controls and chart marks.
 *
 * Waits 300ms the first time; once one tooltip has been open, the next opens
 * immediately with no fade, so moving along a toolbar feels instant. Escape
 * dismisses it. Portalled and fixed so no scrolling column or transformed
 * ancestor can clip it; centred on the trigger, clamped inside the viewport,
 * and it wraps rather than overflowing a narrow screen.
 */
export default function Tooltip({ label, side = 'top', className, style, instant = false, children }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [warm, setWarm] = useState(false)

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }, [])

  const show = useCallback(() => {
    cancel()
    const skip = instant || Date.now() - lastClosedAt < WARM_WINDOW
    setWarm(skip && !instant)
    timer.current = setTimeout(() => setOpen(true), skip ? 0 : OPEN_DELAY)
  }, [cancel, instant])

  const hide = useCallback(() => {
    cancel()
    setOpen((was) => {
      if (was) lastClosedAt = Date.now()
      return false
    })
  }, [cancel])

  useEffect(() => cancel, [cancel])
  useDismiss(open, triggerRef, hide, { outside: false })

  // A fixed label would hang in place while its column scrolls away. Capture,
  // so it fires for any scrolling ancestor.
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', hide, true)
    return () => window.removeEventListener('scroll', hide, true)
  }, [open, hide])

  // Measured after mount — the label's size isn't known until it renders.
  const place = useCallback(
    (node: HTMLSpanElement | null) => {
      const r = triggerRef.current?.getBoundingClientRect()
      if (!node || !r) return
      const { offsetWidth: w, offsetHeight: h } = node
      const centred = r.left + r.width / 2 - w / 2
      node.style.left = `${Math.min(Math.max(8, centred), window.innerWidth - w - 8)}px`
      node.style.top = side === 'top' ? `${Math.max(8, r.top - h - 8)}px` : `${r.bottom + 8}px`
    },
    [side],
  )

  return (
    <span
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      style={style}
      onPointerEnter={show}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {children}
      {open &&
        createPortal(
          <span
            ref={place}
            role="tooltip"
            data-instant={warm || undefined}
            className="u-popover pointer-events-none fixed z-[250] w-max select-none max-w-[min(20rem,calc(100vw-1rem))] rounded-lg bg-ink px-2 py-1 text-label font-medium text-on-ink shadow-tooltip"
            style={{ transformOrigin: side === 'top' ? 'bottom' : 'top', transitionDuration: warm ? undefined : 'var(--lui-duration-tooltip)' }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  )
}

export { Tooltip }
