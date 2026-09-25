import { Fragment, useEffect, useRef, useState } from 'react'
import { CaretRight, DotsSixVertical } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { IconTile } from './Badge'

/* ------------------------------------------------------------------- Logo */

/** The monogram tile and wordmark. */
export function Logo({
  letter = 'L',
  name = 'Lightweight UI',
  href,
  badge,
  className,
}: {
  letter?: string
  /** Pass `null` for the tile alone. */
  name?: React.ReactNode
  href?: string
  /** A small tag after the name — "Demo". */
  badge?: React.ReactNode
  className?: string
}) {
  const content = (
    <>
      <span className="grid h-6 w-6 flex-none select-none place-items-center rounded-lg bg-ink text-label font-bold text-on-ink" aria-hidden={name ? true : undefined}>
        {letter}
      </span>
      {name}
      {badge}
    </>
  )
  const cls = cn('flex cursor-default items-center gap-2 text-body font-semibold tracking-tight [a&]:cursor-pointer', className)
  return href ? (
    <a href={href} className={cls}>
      {content}
    </a>
  ) : (
    <span className={cls}>{content}</span>
  )
}

/* -------------------------------------------------------------- AppHeader */

export interface AppHeaderProps {
  brand?: React.ReactNode
  /** Beside the brand — usually an UnderlineNav. */
  nav?: React.ReactNode
  /** Right side — bell, avatar. */
  actions?: React.ReactNode
  /** Constrain the content to the workspace width (1100px) or run full-bleed. */
  contained?: boolean
  /** Stick to the top with a translucent blur. */
  sticky?: boolean
  className?: string
}

/**
 * The workspace's top bar: at least 56px, hairline under, blurred when sticky.
 * On a narrow screen the nav scrolls sideways rather than pushing the actions
 * off the edge; it reaches 1px down so an UnderlineNav's bar can sit on the
 * header's own hairline without being clipped.
 */
export function AppHeader({ brand = <Logo />, nav, actions, contained = true, sticky = true, className }: AppHeaderProps) {
  return (
    <header className={cn('z-40 border-b border-line bg-bg/80 backdrop-blur', sticky ? 'sticky top-0' : 'relative', className)}>
      <div className={cn('flex min-h-14 w-full items-center justify-between gap-3 px-4 sm:px-6', contained && 'mx-auto max-w-[1100px]')}>
        <div className="flex min-w-0 flex-1 items-center gap-4 self-stretch sm:gap-7">
          <div className="flex-none">{brand}</div>
          {nav && <div className="-mb-px flex min-w-0 self-stretch overflow-x-auto overscroll-x-contain [scrollbar-width:none]">{nav}</div>}
        </div>
        <div className="flex flex-none items-center gap-1.5">{actions}</div>
      </div>
    </header>
  )
}

/* ----------------------------------------------------------------- Toolbar */

export interface ToolbarProps {
  start?: React.ReactNode
  /** Centred on the bar itself, not on whatever space the sides leave. */
  center?: React.ReactNode
  end?: React.ReactNode
  sticky?: boolean
  className?: string
}

/**
 * A full-width working bar — breadcrumb left, view switch dead centre, actions
 * right. One bar across every view of the same object, so its identity stays
 * put while only the body changes.
 *
 * It measures itself, not the window: when the bar is too narrow to centre the
 * switch without colliding, the switch drops to a row of its own underneath.
 */
export function Toolbar({ start, center, end, sticky = true, className }: ToolbarProps) {
  return (
    <header className={cn('@container z-20 border-b border-line bg-bg/80 backdrop-blur', sticky ? 'sticky top-0' : 'relative', className)}>
      <div className="relative flex min-h-14 w-full items-center justify-between gap-3 px-3.5">
        <div className="flex min-w-0 items-center gap-3">{start}</div>
        {center && <div className="absolute left-1/2 hidden -translate-x-1/2 @3xl:block">{center}</div>}
        <div className="flex flex-none items-center gap-3 text-ui">{end}</div>
      </div>
      {center && <div className="flex justify-center overflow-x-auto border-t border-line px-3.5 py-2 @3xl:hidden">{center}</div>}
    </header>
  )
}

/* -------------------------------------------------------------- Breadcrumb */

export interface Crumb {
  label: React.ReactNode
  href?: string
  onClick?: () => void
}

/**
 * Muted ancestors, ink current page, a small caret between. Give `label` a
 * distinct name when a page has more than one trail.
 */
export function Breadcrumb({ items, label = 'Breadcrumb', className }: { items: Crumb[]; label?: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn('flex min-w-0 items-center gap-2 text-ui', className)}>
      {items.map((c, i) => {
        const last = i === items.length - 1
        const cls = cn(
          'min-w-0 truncate rounded-md font-medium focus-visible:outline-offset-2',
          last ? 'text-ink' : 'flex-none text-muted decoration-line-control underline-offset-4 transition-colors hover:text-ink hover:underline',
        )
        // Truncated crumbs keep their full name a hover away.
        const title = typeof c.label === 'string' ? c.label : undefined
        return (
          <Fragment key={i}>
            {i > 0 && <CaretRight size={12} weight="bold" aria-hidden="true" className="flex-none text-muted rtl:-scale-x-100" />}
            {last || (!c.href && !c.onClick) ? (
              <span className={cls} title={title} aria-current={last ? 'page' : undefined}>
                {c.label}
              </span>
            ) : c.href ? (
              <a href={c.href} title={title} className={cls}>
                {c.label}
              </a>
            ) : (
              <button type="button" onClick={c.onClick} title={title} className={cls}>
                {c.label}
              </button>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

/* ---------------------------------------------------------- HoverHighlight */

interface Box {
  x: number
  y: number
  w: number
  h: number
}

/**
 * One soft box that slides and morphs to whichever child you hover, instead of
 * each item toggling its own background. Mark hoverable children with
 * `data-hl`. Mouse only — a finger has no hover, and a box chasing a scroll
 * gesture would be noise. The default tone is the ink wash, so it follows the
 * theme.
 */
export function HoverHighlight({
  children,
  className,
  radius = 12,
  tone = 'color-mix(in oklab, var(--color-ink) 5%, transparent)',
}: {
  children: React.ReactNode
  className?: string
  radius?: number
  tone?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const last = useRef<HTMLElement | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [on, setOn] = useState(false)

  function track(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return
    const target = (e.target as HTMLElement).closest('[data-hl]') as HTMLElement | null
    const container = ref.current
    if (!target || !container || !container.contains(target)) {
      last.current = null
      setOn(false)
      return
    }
    if (target === last.current) {
      if (!on) setOn(true)
      return // same item — skip the state churn from every pointer move
    }
    last.current = target
    // The box is positioned inside the container's border and scrolls with its
    // content, so measure from the padding edge and add the scroll offset.
    const c = container.getBoundingClientRect()
    const t = target.getBoundingClientRect()
    setBox({
      x: t.left - c.left - container.clientLeft + container.scrollLeft,
      y: t.top - c.top - container.clientTop + container.scrollTop,
      w: t.width,
      h: t.height,
    })
    setOn(true)
  }

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerLeave={() => {
        last.current = null
        setOn(false)
      }}
      className={cn('relative', className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0"
        style={{
          borderRadius: radius,
          background: tone,
          width: box?.w ?? 0,
          height: box?.h ?? 0,
          transform: `translate(${box?.x ?? 0}px, ${box?.y ?? 0}px)`,
          opacity: on && box ? 1 : 0,
          // Seen tens of times a minute, so it's quick. It sits out of flow,
          // so its size change costs no one else a layout.
          transition:
            'transform 150ms var(--ease-out), width 150ms var(--ease-out), height 150ms var(--ease-out), opacity 150ms var(--ease-out)',
        }}
      />
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- Rail */

export interface RailItemProps {
  icon: React.ReactNode
  label: React.ReactNode
  active?: boolean
  /** Tints the icon tile green — the row's readiness indicator. */
  done?: boolean
  onClick?: () => void
  /** Revealed on hover, after the label — duplicate, delete. */
  actions?: React.ReactNode
  /** Always-visible trailing content — presence dots, a count. */
  trailing?: React.ReactNode
  /** Show a drag handle and make the row draggable. */
  onDragStart?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  /**
   * The keyboard's way to reorder: with the handle focused, ↑ and ↓ call this
   * with -1 or 1. Give it whenever the row can be dragged — a drag handle
   * alone leaves keyboard users stuck.
   */
  onMove?: (direction: -1 | 1) => void
  /**
   * `flat` — a row in a column (active is a darker wash).
   * `raised` — a row inside a RailGroup (active lifts to a white card).
   */
  variant?: 'flat' | 'raised'
  className?: string
}

/** Revealed on hover where hover exists; always there on touch; kept while focused inside. */
const REVEAL = 'transition-opacity duration-150 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'

/**
 * A sidebar row: icon tile, label, optional hover actions. Mark it `data-hl`
 * so a surrounding HoverHighlight slides to it.
 */
export function RailItem({
  icon,
  label,
  active = false,
  done = false,
  onClick,
  actions,
  trailing,
  onDragStart,
  onDrop,
  onMove,
  variant = 'flat',
  className,
}: RailItemProps) {
  const movable = Boolean(onDragStart || onMove)
  const name = typeof label === 'string' ? label : undefined
  return (
    <div
      data-hl
      onDragOver={onDrop ? (e) => e.preventDefault() : undefined}
      onDrop={onDrop}
      className={cn(
        'group relative flex items-center gap-0.5 rounded-xl transition-colors',
        variant === 'raised' ? 'px-0.5 py-1' : 'px-0 py-0',
        active && (variant === 'raised' ? 'bg-raised shadow-pill' : 'bg-ink/[0.06]'),
        className,
      )}
    >
      {variant === 'raised' &&
        (movable ? (
          <button
            type="button"
            draggable={Boolean(onDragStart)}
            onDragStart={onDragStart}
            onKeyDown={(e) => {
              if (!onMove || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return
              e.preventDefault()
              onMove(e.key === 'ArrowUp' ? -1 : 1)
            }}
            aria-label={name ? `Reorder ${name}` : 'Reorder'}
            aria-keyshortcuts={onMove ? 'ArrowUp ArrowDown' : undefined}
            data-static
            className={cn(
              'grid h-6 w-4 flex-none cursor-grab place-items-center rounded-md text-muted focus-visible:-outline-offset-1 active:cursor-grabbing',
              REVEAL,
            )}
          >
            <DotsSixVertical size={12} aria-hidden="true" />
          </button>
        ) : (
          <span aria-hidden="true" className="w-4 flex-none" />
        ))}
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        data-static
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 rounded-[10px] text-start focus-visible:-outline-offset-2',
          variant === 'flat' && 'px-2 py-1.5',
        )}
      >
        <IconTile size="sm" done={done}>
          {icon}
        </IconTile>
        <span className="min-w-0 flex-1 truncate text-label font-medium" title={name}>
          {label}
          {done && <span className="sr-only">, ready</span>}
        </span>
        {trailing}
      </button>
      {actions && <div className={cn('flex flex-none items-center', REVEAL)}>{actions}</div>}
    </div>
  )
}

/** The soft panel that groups the rows that vary — the pages between two fixed screens. */
export function RailGroup({ children, footer, className }: { children: React.ReactNode; footer?: React.ReactNode; className?: string }) {
  return (
    // p-1 keeps the rows' 12px corners concentric with the group's 16px.
    <div className={cn('flex min-h-0 flex-col rounded-2xl bg-ink/[0.05] p-1', className)}>
      <div className="min-h-0 space-y-0.5 overflow-y-auto">{children}</div>
      {footer && <div className="mt-1">{footer}</div>}
    </div>
  )
}

/** A tiny icon action inside a rail row. */
export function RailAction({
  label,
  onClick,
  tone = 'default',
  disabled,
  children,
}: {
  label: string
  onClick?: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        'grid h-6 w-6 place-items-center rounded-md text-muted transition-colors focus-visible:-outline-offset-1 not-disabled:hover:bg-ink/[0.06] disabled:cursor-not-allowed disabled:opacity-30',
        tone === 'danger' ? 'not-disabled:hover:text-danger' : 'not-disabled:hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

/** Dashed "add" row at the foot of a list. */
export function AddRow({ onClick, icon, children, className }: { onClick?: () => void; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-static
      className={cn(
        // The + turns a quarter on hover — a small "yes, this adds one".
        'u-press flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong py-1.5 text-label font-medium text-muted hover:border-line-control hover:bg-ink/[0.03] hover:text-ink focus-visible:outline-offset-2 [&>svg]:transition-[rotate] [&>svg]:duration-300 [&>svg]:ease-out hover:[&>svg]:rotate-90',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

/* ---------------------------------------------------------- Property panel */

/**
 * A column of settings with a quiet header — the builder's right-hand panel.
 * An `aside` by default, which is a landmark: use `as="div"` when it's nested
 * inside `main` or another landmark rather than beside it.
 */
export function PropertyPanel({
  title = 'Properties',
  as: Tag = 'aside',
  className,
  children,
}: {
  title?: React.ReactNode
  as?: 'aside' | 'div'
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tag className={cn('bg-card', className)} aria-label={Tag === 'aside' && typeof title === 'string' ? title : undefined}>
      <p className="border-b border-line px-4 py-3.5 text-label font-medium text-muted">{title}</p>
      {children}
    </Tag>
  )
}

/** One section of settings, ruled off from the next. */
export function PropertyGroup({ title, className, children }: { title?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('border-b border-line px-4 py-4 last:border-b-0', className)}>
      {title && <p className="mb-3 text-ui font-semibold tracking-tight">{title}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/* ---------------------------------------------------------- ResizeHandle */

export interface ResizeHandleProps {
  /** The panel's current width. */
  width: number
  onResize: (width: number) => void
  /** Called on release — the moment to persist. */
  onCommit?: (width: number) => void
  min: number
  max: number
  /** Reset target for double-click. */
  defaultWidth?: number
  /** Which edge of the layout the panel is on. */
  side: 'left' | 'right'
  label?: string
  className?: string
}

/**
 * A drag handle on a panel's inner edge. Draws a heavier line over the panel's
 * border while hovered, dragged or focused; arrows nudge 16px; double-click
 * resets. Position it absolutely against the layout.
 */
export function ResizeHandle({ width, onResize, onCommit, min, max, defaultWidth, side, label = 'Resize panel', className }: ResizeHandleProps) {
  const start = useRef<{ x: number; w: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const grow = side === 'left' ? 1 : -1
  const clamp = (w: number) => Math.min(max, Math.max(min, Math.round(w)))

  useEffect(() => {
    if (!dragging) return
    const prev = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.userSelect = prev
    }
  }, [dragging])

  function nudge(delta: number) {
    const next = clamp(width + delta)
    onResize(next)
    onCommit?.(next)
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onDoubleClick={() => defaultWidth !== undefined && nudge(defaultWidth - width)}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        e.preventDefault()
        nudge((e.key === 'ArrowLeft' ? -16 : 16) * grow)
      }}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, w: width }
        setDragging(true)
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!start.current) return
        onResize(clamp(start.current.w + (e.clientX - start.current.x) * grow))
      }}
      onPointerUp={(e) => {
        if (!start.current) return
        start.current = null
        setDragging(false)
        e.currentTarget.releasePointerCapture(e.pointerId)
        onCommit?.(width)
      }}
      className={cn(
        // Focus draws the line in full ink — the handle's own indicator, at
        // well over 3:1, in place of an outline that would sit off the edge.
        'absolute inset-y-0 z-10 w-2 cursor-col-resize after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:transition-colors hover:after:bg-ink/20 focus-visible:outline-none focus-visible:after:bg-ink',
        side === 'left' ? '-translate-x-1/2' : 'translate-x-1/2',
        dragging ? 'after:bg-ink/40' : 'after:bg-transparent',
        className,
      )}
      style={side === 'left' ? { left: width } : { right: width }}
    />
  )
}
