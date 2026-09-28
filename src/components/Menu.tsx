import { cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { useControllable, useDismiss, usePresence } from '../lib/hooks'

/* --------------------------------------------------------------- Popover */

type CloseReason = 'escape' | 'outside' | 'select' | 'tab'
const CloseContext = createContext<(reason?: CloseReason) => void>(() => {})

/** Closes the nearest Popover / Menu — for custom content inside one. */
export function usePopoverClose() {
  return useContext(CloseContext)
}

type Align = 'start' | 'center' | 'end'

/** Logical edges, and a transform origin at the trigger's corner — mirrored in RTL. */
const ALIGN: Record<Align, string> = {
  start: 'start-0 origin-top-left rtl:origin-top-right',
  center: 'left-1/2 -translate-x-1/2 origin-top',
  end: 'end-0 origin-top-right rtl:origin-top-left',
}

export interface PopoverProps {
  /** The element that opens it — gets onClick, keyboard and aria wiring. */
  trigger: React.ReactElement<React.HTMLAttributes<HTMLElement>>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: Align
  /** Classes for the floating panel (width, padding). */
  className?: string
  role?: 'dialog' | 'menu' | 'listbox'
  /** Accessible name for the panel. */
  label?: string
  /** `card` — a roomy popover (account, notifications). `menu` — a tight list of rows. */
  surface?: 'card' | 'menu'
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
}

const SURFACE = {
  card: 'mt-2 rounded-2xl shadow-card',
  menu: 'mt-1.5 rounded-control p-1 shadow-menu',
}

const ITEMS = '[role="menuitem"]:not(:disabled), [role="option"]'

/**
 * A floating card anchored under its trigger. It scales in from the trigger's
 * edge and leaves faster than it arrived. Menus and listboxes follow the APG
 * pattern: opening focuses the selected (or first) item, arrow keys, Home and
 * End move, Tab leaves, and Escape or a choice returns focus to the trigger
 * rather than dropping it on the page.
 */
export function Popover({
  trigger,
  open: openProp,
  onOpenChange,
  align = 'end',
  className,
  role = 'dialog',
  label,
  surface = 'card',
  children,
}: PopoverProps) {
  const [open, setOpen] = useControllable(openProp, false, onOpenChange)
  const { mounted, closing } = usePresence(open)
  const ref = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const focusLast = useRef(false)
  const listy = role === 'menu' || role === 'listbox'

  const close = useCallback(
    (reason: CloseReason = 'select') => {
      setOpen(false)
      if (reason === 'escape' || reason === 'select') triggerRef.current?.focus()
    },
    [setOpen],
  )
  useDismiss(open, ref, close)

  const items = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])

  // Move focus into a menu as it opens.
  useEffect(() => {
    if (!open || !listy) return
    const frame = requestAnimationFrame(() => {
      const all = items()
      const target = focusLast.current
        ? all[all.length - 1]
        : (panelRef.current?.querySelector<HTMLElement>('[aria-selected="true"]') ?? all[0])
      focusLast.current = false
      target?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open, listy])

  function onPanelKey(e: React.KeyboardEvent) {
    if (!listy) return
    const all = items()
    const at = all.indexOf(document.activeElement as HTMLElement)
    const go = (i: number) => {
      e.preventDefault()
      all[(i + all.length) % all.length]?.focus()
    }
    if (e.key === 'ArrowDown') go(at + 1)
    else if (e.key === 'ArrowUp') go(at - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(all.length - 1)
    else if (e.key === 'Tab') close('tab')
  }

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(e)
          triggerRef.current = e.currentTarget
          setOpen(!open)
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
          trigger.props.onKeyDown?.(e)
          triggerRef.current = e.currentTarget
          if (listy && !open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault()
            focusLast.current = e.key === 'ArrowUp'
            setOpen(true)
          }
        },
        'aria-expanded': open,
        'aria-haspopup': role,
      } as React.HTMLAttributes<HTMLElement>)
    : trigger

  return (
    <div ref={ref} data-popover className="relative inline-flex">
      {triggerEl}
      {mounted && (
        <CloseContext.Provider value={close}>
          <div
            ref={panelRef}
            role={role}
            aria-label={label}
            data-closing={closing || undefined}
            onKeyDown={onPanelKey}
            className={cn(
              'u-popover absolute top-full z-50 max-w-[calc(100vw-2rem)] overflow-hidden border border-line bg-card',
              SURFACE[surface],
              ALIGN[align],
              className,
            )}
          >
            {typeof children === 'function' ? children(() => close('select')) : children}
          </div>
        </CloseContext.Provider>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Menu */

export interface MenuProps extends Omit<PopoverProps, 'role' | 'surface'> {}

/**
 * An action menu — the "⋮" on a row or card. Same bordered card as every
 * other floating surface, rows with an icon column, danger last.
 */
export function Menu({ className, align = 'end', ...rest }: MenuProps) {
  return <Popover role="menu" surface="menu" align={align} className={cn('min-w-[160px]', className)} {...rest} />
}

export interface MenuItemProps {
  icon?: React.ReactNode
  tone?: 'default' | 'danger'
  onSelect?: () => void
  href?: string
  disabled?: boolean
  /** Trailing content — a shortcut, a count. */
  trailing?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Rows focus with an inset ring — an outset one would be clipped by the menu. */
const ROW =
  'group/row flex w-full items-center gap-2.5 rounded-chip px-2.5 py-2 text-start text-label font-medium transition-colors focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40'

export function MenuItem({ icon, tone = 'default', onSelect, href, disabled, trailing, className, children }: MenuItemProps) {
  const close = useContext(CloseContext)
  const cls = cn(ROW, tone === 'danger' ? 'text-danger hover:bg-danger-bg hover:text-danger-strong' : 'text-ink hover:bg-ink/[0.04]', className)
  const body = (
    <>
      {icon && (
        // The glyph rests muted and comes up to the row's colour under the
        // pointer or keyboard — the row you're on reads as the live one.
        <span
          className={cn(
            'grid w-4 flex-none place-items-center transition-colors',
            tone === 'default' && 'text-muted group-hover/row:text-ink group-focus-visible/row:text-ink',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate" title={typeof children === 'string' ? children : undefined}>
        {children}
      </span>
      {trailing && <span className="flex-none text-caption text-muted">{trailing}</span>}
    </>
  )
  if (href) {
    return (
      <a
        href={href}
        role="menuitem"
        tabIndex={-1}
        className={cls}
        onClick={() => {
          onSelect?.()
          close('select')
        }}
      >
        {body}
      </a>
    )
  }
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      data-static
      className={cls}
      onClick={() => {
        close('select')
        onSelect?.()
      }}
    >
      {body}
    </button>
  )
}

export function MenuDivider() {
  return <div role="separator" className="my-1 border-t border-line" />
}

/** A non-interactive heading row inside a menu or popover. */
export function MenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-2.5 py-2', className)}>{children}</div>
}

/* ------------------------------------------------------------ FilterMenu */

export interface FilterOption {
  value: string
  label: React.ReactNode
  count?: number
}

interface FilterMenuBase {
  /** The axis — "Pod", "Status". Shown muted in the trigger. */
  label: string
  options: FilterOption[]
  align?: Align
  className?: string
}

export interface FilterMenuSingleProps extends FilterMenuBase {
  multiple?: false
  value: string
  onChange: (value: string) => void
  /** The resting value; anything else marks the trigger as active. */
  defaultValue?: string
}

export interface FilterMenuMultipleProps extends FilterMenuBase {
  /** Pick any number of options. The menu stays open while you pick. */
  multiple: true
  /** The picked values, in the order of `options`. Empty means no filter. */
  value: string[]
  onChange: (value: string[]) => void
  /** What the trigger says while nothing is picked. */
  allLabel?: string
}

export type FilterMenuProps = FilterMenuSingleProps | FilterMenuMultipleProps

/**
 * One filter axis as a menu. The trigger states what's selected rather than
 * just naming the axis ("Pod · Growth"), so a filtered list explains itself —
 * to sight and to a screen reader — without opening anything.
 *
 * Single: a listbox; picking an option applies it and closes. Multiple:
 * checkbox rows that apply as you tick them and keep the menu open, with Clear
 * and Done underneath. The trigger names the first pick and counts the rest.
 */
export function FilterMenu(props: FilterMenuProps) {
  return props.multiple ? <MultiFilterMenu {...props} /> : <SingleFilterMenu {...props} />
}

function SingleFilterMenu({ label, value, onChange, options, defaultValue = 'all', align = 'start', className }: FilterMenuSingleProps) {
  const selected = options.find((o) => o.value === value) ?? options[0]
  const active = value !== defaultValue
  return (
    <Popover
      role="listbox"
      surface="menu"
      label={label}
      align={align}
      className={cn('max-h-[320px] min-w-[220px] overflow-y-auto', className)}
      trigger={
        <FilterTrigger label={label} active={active}>
          {selected?.label ?? '—'}
        </FilterTrigger>
      }
    >
      {(close) =>
        options.map((o) => {
          const isSelected = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={isSelected}
              data-static
              onClick={() => {
                onChange(o.value)
                close()
              }}
              className={cn(ROW, 'font-normal hover:bg-ink/[0.04]', o.count === 0 && !isSelected ? 'text-muted' : 'text-ink')}
            >
              {/* The tick keeps its column whether or not it's drawn, so labels line up. */}
              <span className="grid w-3.5 flex-none place-items-center" aria-hidden="true">
                {isSelected && <Check size={13} weight="bold" className="u-icon-in" />}
              </span>
              <span className={cn('min-w-0 flex-1 truncate', isSelected ? 'font-semibold' : 'font-medium')}>{o.label}</span>
              <Count value={o.count} />
            </button>
          )
        })
      }
    </Popover>
  )
}

function MultiFilterMenu({ label, value, onChange, options, allLabel = 'All', align = 'start', className }: FilterMenuMultipleProps) {
  const picked = options.filter((o) => value.includes(o.value))
  const more = picked.length - 1
  return (
    <Popover
      role="dialog"
      surface="menu"
      label={`Filter by ${label}`}
      align={align}
      className={cn('min-w-[240px]', className)}
      trigger={
        <FilterTrigger label={label} active={picked.length > 0}>
          {picked.length === 0 ? (
            allLabel
          ) : (
            <>
              {picked[0].label}
              {more > 0 && (
                <>
                  {/* Keyed on the count, so each change pops in rather than just swapping digits. */}
                  <span
                    key={more}
                    aria-hidden="true"
                    className="u-icon-in ms-1.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink/[0.07] px-1.5 text-caption font-semibold tabular-nums"
                  >
                    +{more}
                  </span>
                  <span className="sr-only"> and {more} more</span>
                </>
              )}
            </>
          )}
        </FilterTrigger>
      }
    >
      <MultiFilterList label={label} value={value} onChange={onChange} options={options} />
    </Popover>
  )
}

/**
 * The panel's contents. A multi-select listbox with a roving tab stop — arrows,
 * Home and End move, Space or Enter ticks — then Clear and Done. Tab walks from
 * the list to the buttons; leaving the panel closes it.
 */
function MultiFilterList({ label, value, onChange, options }: Pick<FilterMenuMultipleProps, 'label' | 'value' | 'onChange' | 'options'>) {
  const close = usePopoverClose()
  const listRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState(() => Math.max(options.findIndex((o) => value.includes(o.value)), 0))
  // The last option ticked by hand — only it plays the pop, never the ones already on.
  const [touched, setTouched] = useState<string | null>(null)

  const rows = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])

  // Focus lands on the first ticked option, or the first one.
  useEffect(() => {
    const frame = requestAnimationFrame(() => rows()[cursor]?.focus())
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(v: string) {
    const next = new Set(value)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    setTouched(v)
    onChange(options.filter((o) => next.has(o.value)).map((o) => o.value))
  }

  function onListKey(e: React.KeyboardEvent) {
    const all = rows()
    const at = all.indexOf(document.activeElement as HTMLElement)
    const go = (i: number) => {
      e.preventDefault()
      all[(i + all.length) % all.length]?.focus()
    }
    if (e.key === 'ArrowDown') go(at + 1)
    else if (e.key === 'ArrowUp') go(at - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(all.length - 1)
  }

  return (
    <div
      onBlur={(e) => {
        // Tabbing out closes it. Focus moving to the trigger doesn't — its own
        // click toggles the panel — and neither does a click on the panel's
        // padding (no related target). Clicks outside are the Popover's.
        const to = e.relatedTarget as Node | null
        if (to && !e.currentTarget.closest('[data-popover]')?.contains(to)) close('tab')
      }}
    >
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        aria-multiselectable="true"
        onKeyDown={onListKey}
        className="max-h-[280px] overflow-y-auto"
      >
        {options.map((o, i) => {
          const isSelected = value.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              role="option"
              tabIndex={i === cursor ? 0 : -1}
              aria-selected={isSelected}
              data-static
              onFocus={() => setCursor(i)}
              onClick={() => toggle(o.value)}
              className={cn(ROW, 'hover:bg-ink/[0.04]', o.count === 0 && !isSelected ? 'text-muted' : 'text-ink')}
            >
              <span
                aria-hidden="true"
                data-checked={isSelected || undefined}
                data-touched={touched === o.value || undefined}
                className={cn(
                  'u-checkmark grid h-4 w-4 flex-none place-items-center rounded-[calc(4px*var(--lui-corner-fallback,1))] border',
                  isSelected ? 'border-ink bg-ink' : 'border-line-field bg-field group-hover/row:border-ink',
                )}
              >
                <svg viewBox="0 0 12 12" className="u-check h-2.5 w-2.5 text-on-ink">
                  <path className="u-check-tick" pathLength={1} d="M2.6 6.4 5 8.7 9.6 3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              <Count value={o.count} />
            </button>
          )
        })}
      </div>
      <div className="-mx-1 -mb-1 mt-1 flex items-center justify-between gap-2 border-t border-line p-1">
        <button
          type="button"
          disabled={value.length === 0}
          onClick={() => {
            onChange([])
            rows()[0]?.focus()
          }}
          className="u-press rounded-chip px-2.5 py-1.5 text-label font-medium text-muted hover:bg-ink/[0.04] hover:text-ink focus-visible:-outline-offset-2 disabled:pointer-events-none disabled:opacity-40"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => close('select')}
          className="u-press rounded-chip px-2.5 py-1.5 text-label font-semibold text-ink hover:bg-ink/[0.04] focus-visible:-outline-offset-2"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function Count({ value }: { value?: number }) {
  if (value === undefined) return null
  return <span className="flex-none text-caption tabular-nums text-muted">{value}</span>
}

function FilterTrigger({
  label,
  active,
  children,
  ...rest
}: { label: string; active: boolean; children: React.ReactNode } & React.HTMLAttributes<HTMLButtonElement>) {
  const open = rest['aria-expanded'] === true
  return (
    <button
      type="button"
      className={cn(
        'u-press group/filter inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-label focus-visible:outline-offset-2',
        open || active ? 'bg-raised text-ink shadow-hairline ring-1 ring-ink/10' : 'bg-ink/[0.04] text-ink hover:bg-ink/[0.07]',
      )}
      {...rest}
    >
      <span className="font-medium text-muted">{label}</span>
      <span className="font-semibold">{children}</span>
      <CaretDown
        size={12}
        weight="bold"
        aria-hidden="true"
        className={cn('text-muted transition-[rotate,translate] duration-200 ease-out', open ? 'rotate-180' : 'group-hover/filter:translate-y-px')}
      />
    </button>
  )
}
