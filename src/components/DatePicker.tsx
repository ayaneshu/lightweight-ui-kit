import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { useDismiss, usePresence } from '../lib/hooks'
import { useField } from './Field'

/**
 * Date field + calendar, in the kit's own language.
 *
 * `<input type="date">` hands the calendar to the browser, which draws it in
 * system blue and system type — different on every OS. This keeps the native
 * input's contract (a local `YYYY-MM-DD` string, so timezone handling is
 * untouched) and draws the rest itself.
 */

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** Popover width; also what decides which edge it hangs from. */
const PANEL_W = 268

/** 'YYYY-MM-DD' → local midnight. `new Date(str)` would read it as UTC. */
function parseDay(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

export function toDayString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfToday(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

export interface DatePickerProps {
  /** Local `YYYY-MM-DD`, or '' for none. */
  value: string
  onChange: (value: string) => void
  /** Earliest selectable day, same format. */
  min?: string
  /** Latest selectable day, same format. */
  max?: string
  invalid?: boolean
  placeholder?: string
  id?: string
  className?: string
}

/**
 * Keyboard: one Tab stop for the grid; arrows move a day or a week, Page Up/Down
 * a month, Enter picks, Escape closes (before any dialog it sits in). The month
 * buttons carry the focused day with them, so the grid is always reachable.
 */
export function DatePicker({ value, onChange, min, max, invalid = false, placeholder = 'Pick a date', id, className }: DatePickerProps) {
  const field = useField()
  const [open, setOpen] = useState(false)
  const { mounted, closing } = usePresence(open)
  const [alignRight, setAlignRight] = useState(false)
  const selected = parseDay(value)
  const minDay = min ? parseDay(min) : null
  const maxDay = max ? parseDay(max) : null
  const today = startOfToday()
  const bad = invalid || Boolean(field?.invalid)

  // Which month the grid is showing, and which day the keyboard is on.
  const [view, setView] = useState(() => {
    const base = selected ?? today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [focusDay, setFocusDay] = useState<Date>(selected ?? today)
  /** Only move DOM focus into the grid when the keyboard asked for it. */
  const keyNav = useRef(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useDismiss(open, rootRef, (reason) => {
    setOpen(false)
    if (reason === 'escape') triggerRef.current?.focus()
  })

  /** Opening lands on the chosen month — set on the way in, so the grid never
   *  paints one month and then jumps to another. */
  function toggle() {
    if (!open) {
      const base = selected ?? today
      setView(new Date(base.getFullYear(), base.getMonth(), 1))
      setFocusDay(base)
      keyNav.current = true
      // Hang from whichever edge keeps the panel inside — measured against the
      // dialog it sits in when there is one.
      const r = triggerRef.current?.getBoundingClientRect()
      const box = triggerRef.current?.closest('.u-modal')?.getBoundingClientRect()
      const limit = box ? box.right : window.innerWidth
      setAlignRight(Boolean(r && r.left + PANEL_W > limit - 8))
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open || !keyNav.current) return
    keyNav.current = false
    gridRef.current?.querySelector<HTMLElement>('[data-focused="true"]')?.focus()
  }, [open, focusDay, view])

  const days = useMemo(() => {
    const year = view.getFullYear()
    const month = view.getMonth()
    const lead = new Date(year, month, 1).getDay()
    // Six rows always, so the popover doesn't resize between months.
    return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - lead + i))
  }, [view])

  const disabled = (d: Date) => Boolean((minDay && d < minDay) || (maxDay && d > maxDay))

  function pick(d: Date) {
    if (disabled(d)) return
    onChange(toDayString(d))
    setOpen(false)
    triggerRef.current?.focus()
  }

  /** Change month and bring the keyboard's day along, clamped to the month's length. */
  function shiftMonth(dir: number) {
    const v = new Date(view.getFullYear(), view.getMonth() + dir, 1)
    const last = new Date(v.getFullYear(), v.getMonth() + 1, 0).getDate()
    setView(v)
    setFocusDay(new Date(v.getFullYear(), v.getMonth(), Math.min(focusDay.getDate(), last)))
  }

  function shiftFocus(deltaDays: number) {
    const next = new Date(focusDay.getFullYear(), focusDay.getMonth(), focusDay.getDate() + deltaDays)
    setFocusDay(next)
    if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) {
      setView(new Date(next.getFullYear(), next.getMonth(), 1))
    }
  }

  function onGridKey(e: React.KeyboardEvent) {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl'
    const moves: Record<string, number> = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -7, ArrowDown: 7 }
    if (e.key in moves) {
      e.preventDefault()
      keyNav.current = true
      shiftFocus(moves[e.key])
      return
    }
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      keyNav.current = true
      shiftMonth(e.key === 'PageUp' ? -1 : 1)
    }
  }

  const monthLabel = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const navCls = 'u-circle u-press grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2'

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={id ?? field?.id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={bad || undefined}
        aria-describedby={field?.describedBy}
        data-static
        className={cn(
          // A field, so it focuses like one: the edge turns ink, no outer ring.
          'flex w-full items-center justify-between gap-2 rounded-xl border bg-field px-3.5 py-2.5 text-start text-base outline-hidden transition-colors duration-150 sm:text-ui',
          bad ? 'border-danger' : open ? 'border-ink' : 'border-line-control hover:border-ink/60 focus-visible:border-ink',
        )}
      >
        <span className={selected ? '' : 'text-muted'}>
          {selected ? selected.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : placeholder}
        </span>
        <CalendarBlank size={15} aria-hidden="true" className="shrink-0 text-muted" />
      </button>

      {mounted && (
        <div
          role="dialog"
          aria-label="Choose a date"
          data-closing={closing || undefined}
          className={cn(
            'u-popover absolute top-full z-50 mt-1.5 w-[268px] max-w-[calc(100vw-2rem)] rounded-panel border border-line bg-card p-3 shadow-menu',
            alignRight ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-ui font-semibold tracking-tight" aria-live="polite">
              {monthLabel}
            </p>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className={navCls}>
                <CaretLeft size={14} weight="bold" aria-hidden="true" className="rtl:-scale-x-100" />
              </button>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className={navCls}>
                <CaretRight size={14} weight="bold" aria-hidden="true" className="rtl:-scale-x-100" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-7 gap-y-1">
            {WEEKDAYS.map((d, i) => (
              <span key={i} aria-hidden="true" className="grid h-7 place-items-center text-micro font-semibold uppercase text-muted">
                {d}
              </span>
            ))}
            <div ref={gridRef} className="col-span-7 grid grid-cols-7 gap-y-1" onKeyDown={onGridKey}>
              {days.map((d) => {
                const outside = d.getMonth() !== view.getMonth()
                const isSelected = selected ? sameDay(d, selected) : false
                const isToday = sameDay(d, today)
                const off = disabled(d)
                const focused = sameDay(d, focusDay)
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    // One tab stop for the whole grid; the arrow keys move within it.
                    tabIndex={focused ? 0 : -1}
                    data-focused={focused}
                    data-static
                    // aria-disabled rather than disabled: an unavailable day can
                    // still hold the grid's one tab stop without breaking it.
                    aria-disabled={off || undefined}
                    onClick={() => pick(d)}
                    aria-label={d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    aria-pressed={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    className={cn(
                      'u-circle mx-auto grid h-8 w-8 place-items-center rounded-full text-label tabular-nums transition-colors focus-visible:outline-offset-1',
                      isSelected
                        ? 'bg-ink font-semibold text-on-ink'
                        : off
                          ? 'cursor-not-allowed text-muted/40'
                          : outside
                            ? 'text-muted hover:bg-ink/[0.04]'
                            : 'text-ink hover:bg-ink/[0.06]',
                      isToday && !isSelected && 'font-semibold ring-1 ring-inset ring-line-control',
                    )}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
                triggerRef.current?.focus()
              }}
              className="u-press rounded-chip px-2 py-1 text-label font-medium text-muted hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-offset-2"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pick(minDay && today < minDay ? minDay : today)}
              className="u-press rounded-chip px-2 py-1 text-label font-medium text-ink hover:bg-ink/[0.04] focus-visible:outline-offset-2"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
