import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowElbowDownLeft, ArrowDown, ArrowUp, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { useDismiss, useFocusTrap } from '../lib/hooks'

/* -------------------------------------------------------------------- Kbd */

/** A key, as it's printed on the keyboard — for shortcuts beside a label. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 cursor-default select-none items-center justify-center rounded-md border border-line bg-ink/[0.03] px-1 font-sans text-micro font-medium text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

/** '⌘' on Apple platforms, 'Ctrl' everywhere else — for printing a shortcut. */
export function modKey(): '⌘' | 'Ctrl' {
  if (typeof navigator === 'undefined') return '⌘'
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? ''
  return /mac|iphone|ipad|ipod/i.test(platform) ? '⌘' : 'Ctrl'
}

/**
 * A global keyboard shortcut. `mod` is ⌘ on a Mac and Ctrl elsewhere:
 * `useHotkey('mod+k', open)`. Bare keys (`'/'`) are ignored while the user is
 * typing in a field; chords with a modifier fire anywhere.
 */
export function useHotkey(combo: string, handler: (e: KeyboardEvent) => void, { enabled = true }: { enabled?: boolean } = {}) {
  const cb = useRef(handler)
  cb.current = handler
  useEffect(() => {
    if (!enabled) return
    const parts = combo.toLowerCase().split('+')
    const key = parts[parts.length - 1]
    const want = { mod: parts.includes('mod'), shift: parts.includes('shift'), alt: parts.includes('alt') }
    function onKey(e: KeyboardEvent) {
      const mac = modKey() === '⌘'
      const mod = mac ? e.metaKey : e.ctrlKey
      if (e.key.toLowerCase() !== key || mod !== want.mod || e.shiftKey !== want.shift || e.altKey !== want.alt) return
      if (!want.mod) {
        const t = e.target as HTMLElement | null
        if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return
      }
      e.preventDefault()
      cb.current(e)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [combo, enabled])
}

/* --------------------------------------------------------------- Scoring */

function termScore(text: string, term: string): number {
  const t = text.toLowerCase()
  if (!t) return 0
  if (t === term) return 100
  if (t.startsWith(term)) return 80 - Math.min(20, (t.length - term.length) * 0.2)
  const at = t.indexOf(term)
  if (at > 0) {
    // The start of a word ("Dialog" in "ConfirmDialog", "date" in "Date picker").
    const prev = text[at - 1]
    const wordStart = /[\s\-_./·]/.test(prev) || (text[at] !== t[at] && prev === prev.toLowerCase())
    return (wordStart ? 60 : 40) - Math.min(10, at * 0.2)
  }
  // Letters in order, anywhere — "dlg" finds "Dialog". Tight runs score higher.
  let from = 0
  let gaps = 0
  for (const ch of term) {
    const i = t.indexOf(ch, from)
    if (i < 0) return 0
    gaps += i - from
    from = i + 1
  }
  return Math.max(1, 20 - gaps)
}

/**
 * How well `query` matches an item: every word of the query has to be found in
 * the label or a keyword. Exact beats prefix beats word-start beats substring
 * beats letters-in-order; keywords count for a little less than the label.
 * 0 means no match.
 */
export function commandScore(label: string, query: string, keywords: readonly string[] = []): number {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return 1
  let total = 0
  for (const term of terms) {
    let best = termScore(label, term)
    for (const k of keywords) best = Math.max(best, termScore(k, term) * 0.85)
    if (!best) return 0
    total += best
  }
  return total / terms.length
}

/** The label with each query word's first occurrence marked. */
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return <>{text}</>
  const lower = text.toLowerCase()
  const marks = new Array(text.length).fill(false)
  for (const term of terms) {
    const i = lower.indexOf(term)
    if (i >= 0) for (let j = i; j < i + term.length; j++) marks[j] = true
  }
  const out: React.ReactNode[] = []
  let i = 0
  while (i < text.length) {
    const on = marks[i]
    let j = i
    while (j < text.length && marks[j] === on) j++
    const part = text.slice(i, j)
    out.push(on ? <mark key={i} className="bg-transparent font-semibold text-ink">{part}</mark> : part)
    i = j
  }
  return <>{out}</>
}

/* ----------------------------------------------------------- CommandMenu */

export interface CommandItem {
  id: string
  label: string
  /** Results are grouped under this heading, in the order groups first appear. */
  group?: string
  /** Quieter text after the label — where it lives, what kind of thing it is. */
  hint?: React.ReactNode
  icon?: React.ReactNode
  /** Other words it should be found by. */
  keywords?: readonly string[]
  /** Offered only once there's a query — for long tails, like every icon. */
  searchOnly?: boolean
  onSelect: () => void
}

export interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly CommandItem[]
  placeholder?: string
  /** The dialog's accessible name. */
  label?: string
  /** Most results shown per group while searching. A number, or per group name. */
  limit?: number | Record<string, number>
  /** Called as the query changes — to load more items on demand. */
  onQueryChange?: (query: string) => void
  /** Show the key hints along the bottom. */
  footer?: boolean
  className?: string
}

interface Group {
  name: string
  items: { item: CommandItem; score: number }[]
}

/**
 * Search anything, from anywhere — the ⌘K palette.
 *
 * It opens instantly, with no entrance animation: it's summoned from the
 * keyboard, many times a day, and anything between the keypress and typing
 * is in the way. Results are ranked (exact, prefix, word-start, substring,
 * letters in order), grouped, and capped per group so a long tail can't bury
 * the pages. Arrow keys move, Enter picks, Escape clears the query and then
 * closes. It follows the APG combobox pattern: focus stays in the field, and
 * `aria-activedescendant` points at the highlighted option.
 */
export function CommandMenu({
  open,
  onOpenChange,
  items,
  placeholder = 'Search…',
  label = 'Search',
  limit = 8,
  onQueryChange,
  footer = true,
  className,
}: CommandMenuProps) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const [active, setActive] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const byKeyboard = useRef(false)
  const uid = useId()
  const close = () => onOpenChange(false)

  useFocusTrap(panelRef, open, inputRef)
  useDismiss(open, panelRef, (reason) => reason === 'escape' && close(), { outside: false })

  // A fresh palette every time it opens.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
  }, [open])

  const groups = useMemo<Group[]>(() => {
    const q = deferred.trim()
    const map = new Map<string, Group>()
    items.forEach((item) => {
      if (!q && item.searchOnly) return
      const score = q ? commandScore(item.label, q, item.keywords) : 1
      if (!score) return
      const name = item.group ?? ''
      if (!map.has(name)) map.set(name, { name, items: [] })
      map.get(name)!.items.push({ item, score })
    })
    const list = [...map.values()]
    if (!q) return list
    for (const g of list) {
      g.items.sort((a, b) => b.score - a.score)
      const cap = typeof limit === 'number' ? limit : (limit[g.name] ?? 8)
      g.items = g.items.slice(0, cap)
    }
    // The group holding the best match leads.
    return list.sort((a, b) => b.items[0].score - a.items[0].score)
  }, [items, deferred, limit])

  const flat = useMemo(() => groups.flatMap((g) => g.items.map((r) => r.item)), [groups])
  const current = flat[Math.min(active, flat.length - 1)]
  const optionId = (i: number) => `${uid}-o${i}`

  useEffect(() => setActive(0), [deferred])

  useEffect(() => {
    if (!byKeyboard.current) return
    byKeyboard.current = false
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function pick(item: CommandItem | undefined) {
    if (!item) return
    close()
    item.onSelect()
  }

  function onKey(e: React.KeyboardEvent) {
    const n = flat.length
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!n) return
      byKeyboard.current = true
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + n) % n)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(current)
    } else if (e.key === 'Escape' && query) {
      // Clear, don't close — and keep this Escape from reaching the layer below.
      e.preventDefault()
      e.stopPropagation()
      setQuery('')
      onQueryChange?.('')
    }
  }

  if (!open || typeof document === 'undefined') return null

  let index = -1
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center overscroll-contain bg-scrim px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={close}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn('flex w-full max-w-[600px] flex-col overflow-hidden rounded-sheet border border-line bg-card shadow-modal', className)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <MagnifyingGlass size={18} aria-hidden="true" className="flex-none text-muted" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={current ? optionId(Math.min(active, flat.length - 1)) : undefined}
            aria-autocomplete="list"
            aria-label={label}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onQueryChange?.(e.target.value)
            }}
            onKeyDown={onKey}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink caret-ink outline-hidden placeholder:text-muted"
          />
          <Kbd className="flex-none">esc</Kbd>
        </div>

        <div
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          aria-label="Results"
          className="max-h-[min(60vh,440px)] overflow-y-auto overscroll-contain p-2"
        >
          {groups.map((g) => (
            <div key={g.name} role="group" aria-labelledby={g.name ? `${uid}-${g.name}` : undefined} className="pb-1">
              {g.name && (
                <div id={`${uid}-${g.name}`} className="px-2.5 pb-1 pt-2 text-micro font-semibold uppercase tracking-[0.06em] text-muted">
                  {g.name}
                </div>
              )}
              {g.items.map(({ item }) => {
                index++
                const i = index
                const on = i === Math.min(active, flat.length - 1)
                return (
                  <div
                    key={item.id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={on}
                    data-index={i}
                    // Move, not enter: a list scrolling under a still pointer
                    // shouldn't steal the highlight from the keyboard.
                    onMouseMove={() => i !== active && setActive(i)}
                    onClick={() => pick(item)}
                    className={cn('flex min-h-10 cursor-pointer items-center gap-3 rounded-chip px-2.5 py-2', on && 'bg-ink/[0.06]')}
                  >
                    {item.icon && (
                      <span className={cn('grid h-5 w-5 flex-none place-items-center', on ? 'text-ink' : 'text-muted')} aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-ui text-ink">
                      <Highlight text={item.label} query={deferred} />
                    </span>
                    {item.hint && <span className="max-w-[45%] flex-none truncate text-label text-muted">{item.hint}</span>}
                    {on && <ArrowElbowDownLeft size={14} aria-hidden="true" className="flex-none text-muted" />}
                  </div>
                )
              })}
            </div>
          ))}
          {flat.length === 0 && (
            <p className="px-3 py-10 text-center text-ui text-muted">
              No results for “<span className="text-ink">{deferred.trim()}</span>”
            </p>
          )}
        </div>

        {footer && (
          <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-label text-muted" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <Kbd>
                <ArrowUp size={11} weight="bold" />
              </Kbd>
              <Kbd>
                <ArrowDown size={11} weight="bold" />
              </Kbd>
              to move
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>
                <ArrowElbowDownLeft size={11} weight="bold" />
              </Kbd>
              to open
            </span>
            <span className="ms-auto flex items-center gap-1.5">
              <Kbd>esc</Kbd>
              {query ? 'to clear' : 'to close'}
            </span>
          </div>
        )}
        <span role="status" className="sr-only">
          {deferred.trim() ? `${flat.length} ${flat.length === 1 ? 'result' : 'results'}` : ''}
        </span>
      </div>
    </div>,
    document.body,
  )
}
