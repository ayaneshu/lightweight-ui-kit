import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ArrowLeft, ArrowRight, CaretDown, Copy, Desktop, GithubLogo, List, MagnifyingGlass, Moon, Sun, X, type Icon } from 'lightweight-ui/icons'
import {
  Badge,
  cn,
  CommandMenu,
  HoverHighlight,
  IconButton,
  Kbd,
  Loader,
  Logo,
  modKey,
  PageLoader,
  ThemeSwitch,
  usePresence,
  useHotkey,
  useTheme,
  useToast,
  type CommandItem,
  type Theme,
} from 'lightweight-ui'
import { GROUPS, PAGES, type Group, type PageDef } from './pages'
import { loadDocEntries, loadIconEntries, pageEntries, type Entry } from './search'
import { PageRuler } from './ui/PageRuler'
import { REPO } from './ui/site'

/* ---------------------------------------------------------------- Routing */

/** '#/slug', '#/slug#section' or '#/slug?query' → its parts. */
function readRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [path, section] = raw.split('#')
  const slug = path.split('?')[0]
  return { slug: PAGES.some((p) => p.slug === slug) ? slug : 'overview', section }
}

/** Scroll to a section once the lazy page has rendered it, and point at it. */
function revealSection(id: string) {
  let tries = 0
  const tick = () => {
    const el = document.getElementById(id)
    if (!el) return void (++tries < 40 && setTimeout(tick, 50))
    el.scrollIntoView({ block: 'start' })
    const title = el.querySelector('h2')
    if (!title) return
    title.classList.remove('u-flash')
    void title.offsetWidth
    title.classList.add('u-flash', 'rounded-lg')
    setTimeout(() => title.classList.remove('u-flash'), 1000)
  }
  tick()
}

/** The same loaders React.lazy uses — calling one early just warms the chunk. */
const pageModules = import.meta.glob('./pages/**/*.tsx')

/** Page transitions ride the View Transitions API where it exists (see styles.css). */
const canTransition = typeof document !== 'undefined' && 'startViewTransition' in document
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Hash routing — the playground is a static build that must work from any path.
 *
 * Moving to another page first fetches its code (the top bar shows only if
 * that takes a moment), then swaps pages inside a view transition: the old
 * page lifts away, the new one settles in, and the sidebar's highlight glides
 * to the new item. Same-page section links just scroll.
 */
function useRoute() {
  const [route, setRoute] = useState(readRoute)
  const [loading, setLoading] = useState(false)
  const last = useRef(route.slug)
  const ticket = useRef(0)
  useEffect(() => {
    const on = async () => {
      const next = readRoute()
      const mine = ++ticket.current
      const changing = last.current !== next.slug
      if (changing) {
        const page = PAGES.find((p) => p.slug === next.slug)
        setLoading(true)
        await pageModules[page?.file ?? '']?.().catch(() => undefined)
        if (mine !== ticket.current) return // a newer navigation won
        setLoading(false)
      }
      const apply = () => {
        flushSync(() => setRoute(next))
        if (next.section) revealSection(next.section)
        else if (changing) window.scrollTo({ top: 0, behavior: 'instant' })
      }
      last.current = next.slug
      if (changing && canTransition && !reduceMotion()) document.startViewTransition(apply)
      else apply()
    }
    window.addEventListener('hashchange', on)
    const first = readRoute().section
    if (first) revealSection(first)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return { ...route, loading }
}

function go(href: string) {
  if (window.location.hash === href) {
    const section = href.split('#')[2]
    if (section) revealSection(section)
    return
  }
  window.location.hash = href
}

/* -------------------------------------------------------------------- App */

export default function App() {
  const { slug, loading } = useRoute()
  const [drawer, setDrawer] = useState(false)
  const { mounted: drawerMounted, closing: drawerClosing } = usePresence(drawer)
  // One theme state for the whole app, so every switch shows the same choice.
  const [theme, setTheme] = useTheme()
  const [searching, setSearching] = useState(false)
  const current = PAGES.find((p) => p.slug === slug) ?? PAGES[0]
  const index = PAGES.indexOf(current)
  const prev = PAGES[index - 1]
  const next = PAGES[index + 1]

  useHotkey('mod+k', () => setSearching((s) => !s))
  useHotkey('/', () => setSearching(true))

  useEffect(() => {
    document.title = `${current.title} · Lightweight UI`
    setDrawer(false)
  }, [current])

  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawer])

  const Page = current.Component
  const openSearch = () => {
    setDrawer(false)
    setSearching(true)
  }

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      {/* The sidebar is set apart by a faint fill, not a rule. */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[272px] flex-col bg-ink/[0.02] lg:flex">
        <Sidebar slug={slug} theme={theme} onTheme={setTheme} onSearch={openSearch} />
      </aside>

      {/* Mobile bar + drawer */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-bg/85 px-4 backdrop-blur lg:hidden">
        <Logo name="Lightweight UI" href="#/overview" />
        <div className="flex items-center gap-1">
          <IconButton label="Search" onClick={openSearch}>
            <MagnifyingGlass size={18} />
          </IconButton>
          <IconButton label={drawer ? 'Close navigation' : 'Open navigation'} aria-expanded={drawer} onClick={() => setDrawer((d) => !d)}>
            {drawer ? <X size={18} /> : <List size={18} />}
          </IconButton>
        </div>
      </header>
      {drawerMounted && (
        <div
          data-closing={drawerClosing || undefined}
          className="u-overlay fixed inset-0 top-14 z-30 bg-scrim backdrop-blur-sm lg:hidden"
          onMouseDown={() => setDrawer(false)}
        >
          <aside
            data-closing={drawerClosing || undefined}
            className="u-popover flex h-full w-[284px] max-w-[85vw] origin-top-left flex-col bg-bg shadow-modal rtl:origin-top-right"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Sidebar slug={slug} compact theme={theme} onTheme={setTheme} onSearch={openSearch} />
          </aside>
        </div>
      )}

      {/* clip, not hidden: the Overview's full-bleed field can't cause a sideways scroll, and sticky still works. */}
      <div className="overflow-x-clip lg:ps-[272px] lg:pe-8">
        <div className="mx-auto flex w-full max-w-[1180px] gap-10 px-5 py-10 sm:px-8 lg:py-14">
          {/* View transitions animate the swap; browsers without them get the CSS entrance. */}
          <main key={slug} className={cn('pg-page min-w-0 flex-1', !canTransition && 'u-view')}>
            <Suspense
              fallback={
                <div className="grid min-h-[50vh] place-items-center">
                  <Loader size="lg" label="Loading page" />
                </div>
              }
            >
              <Page />
            </Suspense>
            <nav aria-label="Pagination" className="mt-24 grid gap-3 sm:grid-cols-2">
              {prev ? <PagerLink page={prev} dir="prev" /> : <span />}
              {next && <PagerLink page={next} dir="next" />}
            </nav>
          </main>
          <OnThisPage slug={slug} />
        </div>
      </div>

      <Search open={searching} onOpenChange={setSearching} onTheme={setTheme} />
      <PageLoader active={loading} />
      <PageRuler />
    </div>
  )
}

/* ------------------------------------------------------------------ Search */

function Search({ open, onOpenChange, onTheme }: { open: boolean; onOpenChange: (o: boolean) => void; onTheme: (t: Theme) => void }) {
  const toast = useToast()
  const [docs, setDocs] = useState<Entry[]>([])
  const [icons, setIcons] = useState<Entry[]>([])
  const [glyphs, setGlyphs] = useState<Record<string, Icon> | null>(null)

  // Sections, exports and tokens load on the first open; icons on the first query.
  useEffect(() => {
    if (open && !docs.length) loadDocEntries().then(setDocs)
  }, [open, docs.length])
  const loadIcons = useCallback(() => {
    if (icons.length) return
    Promise.all([loadIconEntries(), import('lightweight-ui/icons')]).then(([entries, mod]) => {
      setGlyphs(mod as unknown as Record<string, Icon>)
      setIcons(entries)
    })
  }, [icons.length])

  const items = useMemo<CommandItem[]>(() => {
    const entries = [...pageEntries(), ...docs, ...icons]
    const fromEntry = (e: Entry): CommandItem => {
      const Glyph = e.kind === 'icon' ? glyphs?.[e.iconName!] : e.page?.icon
      return {
        id: e.id,
        label: e.label,
        group: e.group,
        hint: e.hint,
        keywords: e.keywords,
        searchOnly: e.kind !== 'page',
        icon: Glyph ? <Glyph size={16} /> : null,
        onSelect: () => go(e.href),
      }
    }
    const actions: CommandItem[] = [
      { id: 'act:light', label: 'Switch to light theme', group: 'Actions', icon: <Sun size={16} />, keywords: ['theme', 'mode', 'appearance'], searchOnly: true, onSelect: () => onTheme('light') },
      { id: 'act:dark', label: 'Switch to dark theme', group: 'Actions', icon: <Moon size={16} />, keywords: ['theme', 'mode', 'appearance', 'night'], searchOnly: true, onSelect: () => onTheme('dark') },
      { id: 'act:system', label: 'Match system theme', group: 'Actions', icon: <Desktop size={16} />, keywords: ['theme', 'mode', 'appearance', 'auto'], searchOnly: true, onSelect: () => onTheme('system') },
      {
        id: 'act:install',
        label: 'Copy install command',
        group: 'Actions',
        icon: <Copy size={16} />,
        hint: 'npm install',
        keywords: ['npm', 'install', 'setup'],
        searchOnly: true,
        onSelect: () => {
          navigator.clipboard.writeText(`npm install github:${REPO}`).then(
            () => toast('Install command copied'),
            () => toast('Couldn’t copy — the command is on the Installation page'),
          )
        },
      },
      {
        id: 'act:github',
        label: 'Open the repository on GitHub',
        group: 'Actions',
        icon: <GithubLogo size={16} />,
        keywords: ['github', 'source', 'repo', 'code'],
        searchOnly: true,
        onSelect: () => window.open(`https://github.com/${REPO}`, '_blank', 'noopener'),
      },
    ]
    return [...entries.map(fromEntry), ...actions]
  }, [docs, icons, glyphs, onTheme, toast])

  return (
    <CommandMenu
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      label="Search the docs"
      placeholder="Search components, tokens, icons…"
      limit={{ Pages: 6, Foundations: 6, Components: 8, Patterns: 4, Sections: 6, 'Hooks & utilities': 5, Tokens: 6, Icons: 12, Actions: 4 }}
      onQueryChange={(q) => q.trim().length > 1 && loadIcons()}
    />
  )
}

/* ----------------------------------------------------------------- Sidebar */

const COLLAPSE_KEY = 'pg-sidebar-collapsed'

function useCollapsed() {
  const [collapsed, setCollapsed] = useState<Group[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(COLLAPSE_KEY) ?? '[]')
    } catch {
      return []
    }
  })
  const toggle = (g: Group) =>
    setCollapsed((c) => {
      const next = c.includes(g) ? c.filter((x) => x !== g) : [...c, g]
      try {
        localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next))
      } catch {
        /* storage blocked — the choice lasts this visit */
      }
      return next
    })
  return [collapsed, toggle] as const
}

function Sidebar({
  slug,
  compact = false,
  theme,
  onTheme,
  onSearch,
}: {
  slug: string
  compact?: boolean
  theme: Theme
  onTheme: (t: Theme) => void
  onSearch: () => void
}) {
  const [collapsed, toggle] = useCollapsed()
  const navRef = useRef<HTMLElement>(null)
  const activeGroup = PAGES.find((p) => p.slug === slug)?.group

  // Keep the current page in view as you move through the docs.
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  }, [slug])

  return (
    <>
      {!compact && (
        <div className="flex h-14 flex-none items-center justify-between px-4">
          <Logo name="Lightweight UI" href="#/overview" />
          <Badge size="sm">v0.1</Badge>
        </div>
      )}
      <div className={cn('flex-none px-3 pb-2', compact && 'pt-3')}>
        <SearchTrigger onClick={onSearch} />
      </div>

      <nav ref={navRef} aria-label="Documentation" className="min-h-0 flex-1">
        {/* The list scrolls under a soft fade, so the cut-off reads as "more below". */}
        <HoverHighlight
          radius={10}
          className="h-full overflow-y-auto overscroll-contain px-3 pb-10 [mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {GROUPS.map((group) => {
            const pages = PAGES.filter((p) => p.group === group)
            // The group you're in never hides itself.
            const open = !collapsed.includes(group) || group === activeGroup
            return (
              <SidebarGroup
                key={group}
                group={group}
                pages={pages}
                slug={slug}
                open={open}
                onToggle={() => toggle(group)}
                canCollapse={group !== 'Get started'}
              />
            )
          })}
        </HoverHighlight>
      </nav>

      <div className="flex flex-none items-center justify-between gap-2 px-3 py-3">
        <a
          href={`https://github.com/${REPO}`}
          target="_blank"
          rel="noreferrer"
          className="u-press inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-label font-medium text-muted hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2"
        >
          <GithubLogo size={16} aria-hidden="true" />
          GitHub
        </a>
        <ThemeSwitch value={theme} onChange={onTheme} label="Theme" />
      </div>
    </>
  )
}

function SidebarGroup({
  group,
  pages,
  slug,
  open,
  onToggle,
  canCollapse,
}: {
  group: Group
  pages: PageDef[]
  slug: string
  open: boolean
  onToggle: () => void
  canCollapse: boolean
}) {
  const id = `nav-${group.replace(/\s+/g, '-').toLowerCase()}`
  const sections = [...new Set(pages.map((p) => p.section))]
  return (
    <div className="mt-5 first:mt-1">
      {canCollapse ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          data-static
          className="group/head flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-start focus-visible:-outline-offset-2"
        >
          <span className="flex-1 text-micro font-semibold uppercase tracking-[0.08em] text-muted transition-colors group-hover/head:text-ink">{group}</span>
          <span className="text-caption tabular-nums text-muted">{pages.length}</span>
          <CaretDown
            size={11}
            weight="bold"
            aria-hidden="true"
            className={cn('text-muted transition-[rotate] duration-200 ease-out', !open && '-rotate-90 rtl:rotate-90')}
          />
        </button>
      ) : (
        <p className="sr-only">{group}</p>
      )}
      {open && (
        <div id={id} className="mt-1">
          {sections.map((section) => (
            <div key={section ?? 'all'} className={cn(section && 'mt-2.5 first:mt-0')}>
              {section && <p className="px-2.5 pb-1 pt-0.5 text-caption font-medium text-muted">{section}</p>}
              <ul className={cn(section && 'ps-3')}>
                {pages
                  .filter((p) => p.section === section)
                  .map((p) => (
                    <li key={p.slug}>
                      <NavLink page={p} active={p.slug === slug} withIcon={!section} />
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NavLink({ page, active, withIcon }: { page: PageDef; active: boolean; withIcon: boolean }) {
  const Glyph = page.icon
  return (
    <a
      href={`#/${page.slug}`}
      data-hl
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/link relative flex items-center gap-2.5 rounded-chip px-2.5 py-[7px] text-ui transition-colors focus-visible:-outline-offset-2',
        active ? 'font-medium text-ink' : 'text-muted hover:text-ink',
      )}
    >
      {/* Its own element, named for view transitions, so it glides between items. */}
      {active && <span aria-hidden="true" className="pg-nav-pill absolute inset-0 -z-10 rounded-chip bg-ink/[0.06]" />}
      {withIcon && (
        <Glyph
          size={16}
          weight={active ? 'duotone' : 'regular'}
          aria-hidden="true"
          className={cn('flex-none transition-colors', active ? 'text-ink' : 'text-muted group-hover/link:text-ink')}
        />
      )}
      <span className="min-w-0 truncate">{page.title}</span>
    </a>
  )
}

function SearchTrigger({ onClick }: { onClick: () => void }) {
  const [mod, setMod] = useState<string>('⌘')
  useEffect(() => setMod(modKey()), [])
  return (
    <button
      type="button"
      onClick={onClick}
      aria-keyshortcuts="Meta+K Control+K"
      data-static
      className="group flex h-9 w-full items-center gap-2 rounded-xl border border-line bg-ink/[0.025] ps-3 pe-1.5 text-label text-muted transition-colors hover:border-line-control hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-offset-2"
    >
      <MagnifyingGlass size={14} aria-hidden="true" className="transition-[scale] duration-200 ease-out group-hover:scale-110" />
      <span className="flex-1 text-start">Search…</span>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        <Kbd>{mod}</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  )
}

/* ---------------------------------------------------------------- Pager */

function PagerLink({ page, dir }: { page: PageDef; dir: 'prev' | 'next' }) {
  return (
    <a
      href={`#/${page.slug}`}
      className={cn(
        'group rounded-2xl bg-ink/[0.03] px-4 py-3 transition-[background-color,translate] duration-200 ease-out hover:-translate-y-0.5 hover:bg-ink/[0.05] focus-visible:outline-offset-2',
        dir === 'next' && 'sm:col-start-2 sm:text-end',
      )}
    >
      <span className={cn('flex items-center gap-1.5 text-label text-muted', dir === 'next' && 'sm:justify-end')}>
        {dir === 'prev' && <ArrowLeft size={13} aria-hidden="true" className="transition-[translate] duration-200 ease-out group-hover:-translate-x-0.5" />}
        {dir === 'prev' ? 'Previous' : 'Next'}
        {dir === 'next' && <ArrowRight size={13} aria-hidden="true" className="transition-[translate] duration-200 ease-out group-hover:translate-x-0.5" />}
      </span>
      <span className="mt-0.5 block text-ui font-semibold">{page.title}</span>
    </a>
  )
}

/** Section links for the current page, read from the rendered `data-section` markers. */
function OnThisPage({ slug }: { slug: string }) {
  const [sections, setSections] = useState<{ id: string; title: string }[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    // Drop the last page's sections at once, then poll briefly until this
    // (lazily loaded) page's sections exist.
    setSections([])
    setActive(null)
    let tries = 0
    const t = setInterval(() => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('main [data-section]'))
      if (nodes.length || ++tries > 20) {
        clearInterval(t)
        setSections(nodes.map((n) => ({ id: n.id, title: n.dataset.section ?? n.id })))
      }
    }, 100)
    return () => clearInterval(t)
  }, [slug])

  useEffect(() => {
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [sections])

  if (slug === 'overview') return null
  if (sections.length < 2) return <div className="hidden w-[180px] flex-none xl:block" />

  return (
    <nav aria-label="On this page" className="hidden w-[180px] flex-none xl:block">
      <div className="sticky top-14">
        <p className="mb-2 text-micro font-semibold uppercase tracking-[0.06em] text-muted">On this page</p>
        <ul className="space-y-0.5">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#/${slug}#${s.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  // Smooth unless reduced motion is on — the html rule decides.
                  document.getElementById(s.id)?.scrollIntoView({ block: 'start' })
                }}
                className={cn(
                  // The current section gets a short ink tick, not a rail running the whole list.
                  'relative block rounded-md py-1 ps-3 text-label transition-colors before:absolute before:start-0 before:top-1/2 before:h-3.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-colors',
                  active === s.id ? 'font-medium text-ink before:bg-ink' : 'text-muted before:bg-transparent hover:text-ink',
                )}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
