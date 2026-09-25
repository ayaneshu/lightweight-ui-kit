import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------- Layers */

/**
 * Every open overlay — dialog, popover, calendar, lightbox — registers here in
 * opening order. Escape belongs to whichever opened last, so one press closes
 * one layer: the tooltip, then the menu, then the dialog.
 */
const layers: symbol[] = []

export function useLayer(active: boolean) {
  const id = useRef(Symbol('layer'))
  useEffect(() => {
    if (!active) return
    const me = id.current
    layers.push(me)
    return () => {
      const i = layers.lastIndexOf(me)
      if (i >= 0) layers.splice(i, 1)
    }
  }, [active])
  return useCallback(() => layers[layers.length - 1] === id.current, [])
}

export type DismissReason = 'escape' | 'outside'

/**
 * Closes a floating surface on an outside press or Escape. Escape only reaches
 * the top-most layer, so nested surfaces close innermost-first.
 */
export function useDismiss(
  open: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onDismiss: (reason: DismissReason) => void,
  { outside = true, escape = true }: { outside?: boolean; escape?: boolean } = {},
) {
  const cb = useRef(onDismiss)
  cb.current = onDismiss
  const isTop = useLayer(open)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (outside && ref.current && !ref.current.contains(e.target as Node)) cb.current('outside')
    }
    function onKey(e: KeyboardEvent) {
      // A field that used Escape itself (clearing a query) has had its say.
      if (!escape || e.key !== 'Escape' || e.defaultPrevented || !isTop()) return
      e.preventDefault()
      cb.current('escape')
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, ref, outside, escape, isTop])
}

/* ----------------------------------------------------------- Presence */

/**
 * Keeps an element mounted for its exit animation. While `closing` is true,
 * render it with `data-closing` so the CSS plays the (shorter) exit, then it
 * unmounts. Reduced motion needs nothing special — the exit is a fade.
 */
export function usePresence(open: boolean, exitMs = 120) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
      return
    }
    if (!mounted) return
    setClosing(true)
    const t = setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, exitMs)
    return () => clearTimeout(t)
    // `mounted` is read, not tracked: this reacts to `open` changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exitMs])
  return { mounted: open || mounted, closing: !open && closing }
}

/* ---------------------------------------------------------- Focus trap */

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A modal's focus contract: move focus in on open, keep Tab inside, make
 * everything behind it `inert` (out of the tab order and the accessibility
 * tree at once) and hand focus back to whatever had it on close.
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  initialFocus?: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active) return
    const restoreTo = document.activeElement as HTMLElement | null
    const panel = ref.current
    const first = initialFocus?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel
    first?.focus()

    // The portal root is a direct child of <body>; everything else goes inert.
    const top = panel?.closest('body > *')
    const background = Array.from(document.body.children).filter(
      (el) => el !== top && !(el as HTMLElement).inert && !el.hasAttribute('data-lui-live'),
    ) as HTMLElement[]
    background.forEach((el) => (el.inert = true))

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !ref.current) return
      const nodes = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes.length) return
      const head = nodes[0]
      const tail = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault()
        tail.focus()
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault()
        head.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      background.forEach((el) => (el.inert = false))
      restoreTo?.focus?.()
    }
    // Focus is parked once per opening; later ref changes shouldn't re-steal it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}

/* -------------------------------------------------------- Controllable */

/** A value that can be controlled (value + onChange) or left to the component. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? (value as T) : inner
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [current, set] as const
}

/* ------------------------------------------------------------- Media */

/** True when the user asked the OS for reduced motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
