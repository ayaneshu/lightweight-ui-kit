import { useRef, useState } from 'react'
import { DotsThreeVertical, ListBullets, PencilSimple, Plus, SlidersHorizontal, Sparkle, SquaresFour, Trash, X } from 'lightweight-ui/icons'
import {
  AppHeader,
  Avatar,
  Button,
  cn,
  ConfirmDialog,
  Count,
  EmptyState,
  Eyebrow,
  FilterMenu,
  FilterPills,
  Heading,
  HeroPanel,
  IconButton,
  IconToggleGroup,
  InlineInput,
  ListHeader,
  ListRow,
  Menu,
  MenuItem,
  NotificationBell,
  personName,
  SearchInput,
  StatusBadge,
  ThumbnailCard,
  UnderlineNav,
  useToast,
  type Notification as Update,
  type Status,
} from 'lightweight-ui'
import { Demo, PageHeader, Section } from '../../ui/Demo'

/* -------------------------------------------------------------- Sample data */

const ME = 'sara.k@example.com'
const OMAR = 'omar.h@example.com'
const LENA = 'lena.m@example.com'
const RAVI = 'ravi.p@example.com'
const MEI = 'mei.l@example.com'

const thumb = (n: number) => `./thumbnails/ascii-${n}.webp`

type Tab = 'mine' | 'team'
type View = 'card' | 'list'
type StatusFilter = 'all' | Status

interface FormItem {
  id: string
  title: string
  status: Status
  /** null → a fresh form, which shows its (empty) hero backdrop instead. */
  thumb: string | null
  owner: string
  /** Everyone else on the form. */
  people: string[]
  expires: string | null
  pod: string | null
  responses: number
}

const CHECKOUT: FormItem = { id: 'checkout', title: 'Checkout redesign', status: 'open', thumb: thumb(1), owner: ME, people: [OMAR, LENA], expires: '12 Oct', pod: 'Delivery', responses: 48 }
const FILTERS: FormItem = { id: 'filters', title: 'Search filters v2', status: 'closed', thumb: thumb(4), owner: ME, people: [LENA], expires: '14 Sep', pod: 'Customer', responses: 61 }

const MINE: FormItem[] = [
  CHECKOUT,
  { id: 'onboarding', title: 'Onboarding carousel — one screen or three?', status: 'draft', thumb: thumb(2), owner: ME, people: [], expires: null, pod: null, responses: 0 },
  { id: 'pdp', title: 'PDP gallery layout', status: 'open', thumb: thumb(3), owner: ME, people: [RAVI, MEI, OMAR], expires: '3 Oct', pod: 'Storefront', responses: 23 },
  FILTERS,
  { id: 'loyalty', title: 'Loyalty tier badges', status: 'draft', thumb: thumb(5), owner: ME, people: [MEI], expires: null, pod: null, responses: 0 },
  { id: 'upsell', title: 'Cart upsell module', status: 'open', thumb: thumb(2), owner: ME, people: [RAVI], expires: '28 Sep', pod: 'Growth', responses: 9 },
]

/** Everything the team has published — never drafts, which stay private. */
const TEAM: FormItem[] = [
  CHECKOUT,
  { id: 'returns', title: 'Returns flow copy', status: 'open', thumb: thumb(2), owner: OMAR, people: [MEI], expires: '9 Oct', pod: 'Customer', responses: 17 },
  { id: 'seller', title: 'Seller onboarding checklist', status: 'open', thumb: thumb(4), owner: RAVI, people: [], expires: '21 Oct', pod: 'Sales', responses: 9 },
  { id: 'referral', title: 'Referral banner', status: 'closed', thumb: thumb(5), owner: LENA, people: [OMAR, RAVI], expires: '2 Sep', pod: 'Growth', responses: 112 },
  { id: 'reviews', title: 'Review prompt timing', status: 'open', thumb: thumb(3), owner: MEI, people: [LENA], expires: '30 Sep', pod: 'Reviews', responses: 31 },
  FILTERS,
]

const UPDATES: Update[] = [
  { id: 'u1', title: 'Checkout redesign', message: '5 new responses since yesterday.', time: '2h ago' },
  { id: 'u2', title: 'PDP gallery layout', message: 'Ravi P added you as an editor.', time: '5h ago' },
  { id: 'u3', title: 'Search filters v2', message: 'Closed with 61 responses. Results are ready.', time: '3d ago', read: true },
]

const STATUS_ORDER: Record<Status, number> = { draft: 0, open: 1, closed: 2 }
const STATUS_LABEL: Record<StatusFilter, string> = { all: 'All', draft: 'Draft', open: 'Active', closed: 'Closed' }

const VIEW_ITEMS = [
  { value: 'list' as const, label: 'List view', icon: <ListBullets size={15} aria-hidden="true" /> },
  { value: 'card' as const, label: 'Card view', icon: <SquaresFour size={15} aria-hidden="true" /> },
]

/**
 * The list's grid template changes in step with which cells are hidden — a
 * display:none cell takes no track, so the counts have to match per width.
 * Container queries, so the list answers to the demo frame, not the window.
 */
const ROW_GRID: Record<Tab, string> = {
  mine: 'grid-cols-[84px_minmax(0,1fr)_76px_132px] @2xl:grid-cols-[84px_minmax(0,1fr)_88px_88px_132px]',
  team: 'grid-cols-[84px_minmax(0,1fr)_88px_76px_132px] @3xl:grid-cols-[84px_minmax(0,1fr)_88px_132px_88px_132px]',
}

/* ------------------------------------------------------------------- Page */

export default function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Dashboard"
        description="Where creators manage their forms. There’s a header with two tabs, a title that tells you where you are, a filter bar that stays in place as you scroll, and your forms as a grid or a list. Both demos work: you can filter, search, switch views, and rename or delete a form."
      />

      <Section
        id="workspace"
        title="Your workspace"
        description="Forms show as cards by default, because people recognise a form by its thumbnail and a list has no room for one. There’s only one filter, status, so every option fits on screen as a pill with a count."
      >
        <Demo
          stage="none"
          title="My forms"
          description="Search applies first, so the status counts only include forms that match your search. Forms are sorted by status: drafts, then active, then closed."
          code={WORKSPACE_CODE}
        >
          <DashboardScreen initialTab="mine" />
        </Demo>
        <Notes
          items={[
            'The filter bar sticks directly under the 56px header (top-14). Its background is opaque, because rows scrolling under a see-through bar show through it.',
            'Each card has one main action in its footer: Edit while the form is a draft, since there are no results yet, and Results once it’s live. Other actions are in the ⋮ menu on the thumbnail.',
            'The ⋮ menu sits on the thumbnail and appears on hover. On touch screens it’s always visible. u-stagger makes each card its own stacking context, so a card raises itself (ThumbnailCard `raised`) while its menu is open. Otherwise the menu would slide under the next card.',
            'Create form adds a draft to the top of the list with its name ready to edit. There’s no dialog asking for a name first.',
          ]}
        />
      </Section>

      <Section
        id="team"
        title="Team workspace"
        description="Every form your team has published. There are two filters here, pod and status, and two rows of pills won’t fit in one bar. So each filter is a FilterMenu whose button shows its current value. Reset appears once a filter is set."
      >
        <Demo
          stage="none"
          title="Team"
          description="The pod filter applies before status, so the status counts only cover the pod you picked. Search matches people as well as form titles, because you often look for a form by who made it."
          code={TEAM_CODE}
        >
          <DashboardScreen initialTab="team" />
        </Demo>
      </Section>
    </>
  )
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-ui leading-relaxed text-muted marker:text-line-strong">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

/* ----------------------------------------------------------------- Screen */

function DashboardScreen({ initialTab }: { initialTab: Tab }) {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [mine, setMine] = useState(MINE)
  const [view, setView] = useState<View>('card')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [pod, setPod] = useState('all')
  const [query, setQuery] = useState('')
  const [updates, setUpdates] = useState(UPDATES)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<FormItem | null>(null)
  const created = useRef(0)

  // Your own published forms appear on Team too — read from your list, so a rename or delete shows up in both.
  const team = TEAM.flatMap((f) => (f.owner === ME ? mine.filter((m) => m.id === f.id && m.status !== 'draft') : [f]))
  const items = tab === 'mine' ? mine : team
  const q = query.trim().toLowerCase()

  // 1 · search, 2 · pod (Team), 3 · status — each count describes what's left after the step before it.
  const matching = q
    ? items.filter((f) => f.title.toLowerCase().includes(q) || (tab === 'team' && personName(f.owner).toLowerCase().includes(q)))
    : items
  const podCounts = new Map<string, number>()
  for (const f of matching) podCounts.set(f.pod ?? '', (podCounts.get(f.pod ?? '') ?? 0) + 1)
  const inPod = tab === 'team' && pod !== 'all' ? matching.filter((f) => (f.pod ?? '') === pod) : matching
  const counts = { all: inPod.length, draft: 0, open: 0, closed: 0 }
  for (const f of inPod) counts[f.status] += 1
  const visible = (status === 'all' ? inPod : inPod.filter((f) => f.status === status)).toSorted(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  )

  const statusValues: StatusFilter[] = tab === 'mine' ? ['all', 'draft', 'open', 'closed'] : ['all', 'open', 'closed']
  const filtered = status !== 'all' || pod !== 'all'

  function switchTab(next: Tab) {
    setTab(next)
    setStatus('all')
    setPod('all')
    setQuery('')
  }

  function createForm() {
    created.current += 1
    const id = `new-${created.current}`
    setMine((list) => [{ id, title: 'Untitled form', status: 'draft', thumb: null, owner: ME, people: [], expires: null, pod: null, responses: 0 }, ...list])
    setStatus('all')
    setQuery('')
    setRenaming(id)
  }

  function rename(id: string, next: string | null) {
    setRenaming(null)
    if (next) setMine((list) => list.map((f) => (f.id === id ? { ...f, title: next } : f)))
  }

  function primaryAction(f: FormItem) {
    if (tab === 'team' && f.owner !== ME) return f.status === 'open' ? 'Vote' : 'Results'
    return f.status === 'draft' ? 'Edit' : 'Results'
  }

  function open(f: FormItem, action: string) {
    const where = action === 'Edit' ? 'the builder' : action === 'Vote' ? 'the voter link' : 'results'
    toast(`Opening ${where} for “${f.title}”`)
  }

  const faces = (f: FormItem) => [{ person: f.owner, label: f.owner === ME ? 'You' : undefined }, ...f.people.map((person) => ({ person }))]

  const rowMenu = (f: FormItem, onThumbnail: boolean) =>
    tab === 'mine' ? (
      <Menu
        open={menuOpen === f.id}
        onOpenChange={(o) => setMenuOpen(o ? f.id : null)}
        trigger={
          <IconButton
            label="More actions"
            variant={onThumbnail ? 'glass' : 'ghost'}
            size="md"
            // ThumbnailCard reveals its own menu on hover; a list row doesn't, so the row's button does it itself.
            className={onThumbnail ? undefined : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 max-sm:opacity-100'}
          >
            <DotsThreeVertical size={16} weight="bold" aria-hidden="true" />
          </IconButton>
        }
      >
        <MenuItem icon={<SlidersHorizontal size={15} />} onSelect={() => open(f, 'Edit')}>
          Edit
        </MenuItem>
        <MenuItem icon={<PencilSimple size={15} />} onSelect={() => setRenaming(f.id)}>
          Rename
        </MenuItem>
        <MenuItem icon={<Trash size={15} />} tone="danger" onSelect={() => setDeleting(f)}>
          Delete
        </MenuItem>
      </Menu>
    ) : undefined

  // Keyed on the filters, so changing one replays the cascade; typing in search doesn't.
  const listKey = `${tab}-${view}-${status}-${pod}`

  return (
    <div className="@container h-[640px] overflow-y-auto bg-bg">
      <AppHeader
        nav={
          <UnderlineNav
            label="Dashboard views"
            items={[
              { value: 'mine', label: 'My forms' },
              { value: 'team', label: 'Team' },
            ]}
            value={tab}
            onChange={switchTab}
          />
        }
        actions={
          <>
            <NotificationBell
              items={updates}
              onItemClick={(u) => setUpdates((all) => all.map((x) => (x.id === u.id ? { ...x, read: true } : x)))}
              onMarkAllRead={() => setUpdates((all) => all.map((x) => ({ ...x, read: true })))}
            />
            <Avatar person={ME} className="ml-1" />
          </>
        }
      />

      <div className="mx-auto w-full max-w-[1100px] px-6 pb-12 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{tab === 'mine' ? 'Your workspace' : 'Shared workspace'}</Eyebrow>
            <Heading size="display-lg" level={2} className="mt-1">
              {tab === 'mine' ? 'Forms' : 'Team'}
            </Heading>
          </div>
          {/* Forms are made in your own workspace, never from Team. */}
          {tab === 'mine' && (
            <Button leadingIcon={<Plus size={15} aria-hidden="true" />} onClick={createForm}>
              Create form
            </Button>
          )}
        </div>

        {tab === 'mine' && mine.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={<Sparkle size={22} aria-hidden="true" />}
            title="No forms yet"
            description="Create a form to show voters a few options and collect their feedback."
            action={
              <Button leadingIcon={<Plus size={15} aria-hidden="true" />} onClick={createForm}>
                Create form
              </Button>
            }
          />
        ) : (
          <>
            <div className="mt-7 border-t border-line" />
            <div className="sticky top-14 z-30 -mx-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg px-6 py-4">
              {tab === 'mine' ? (
                <FilterPills
                  label="Filter by status"
                  items={statusValues.map((v) => ({ value: v, label: STATUS_LABEL[v], count: counts[v] }))}
                  value={status}
                  onChange={setStatus}
                />
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <FilterMenu
                    label="Pod"
                    value={pod}
                    onChange={setPod}
                    options={[
                      { value: 'all', label: 'All pods', count: matching.length },
                      ...[...podCounts.keys()].sort().map((p) => ({ value: p, label: p || 'No pod', count: podCounts.get(p) ?? 0 })),
                    ]}
                  />
                  <FilterMenu
                    label="Status"
                    value={status}
                    onChange={(v) => setStatus(v as StatusFilter)}
                    options={statusValues.map((v) => ({ value: v, label: STATUS_LABEL[v], count: counts[v] }))}
                  />
                  {filtered && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={<X size={12} weight="bold" aria-hidden="true" />}
                      onClick={() => {
                        setPod('all')
                        setStatus('all')
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder={tab === 'team' ? 'Search forms or people' : 'Search forms'}
                  className="w-[176px] @xl:w-[200px]"
                />
                <IconToggleGroup label="Layout" items={VIEW_ITEMS} value={view} onChange={setView} />
              </div>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                compact
                className="mt-8"
                title={q ? `No forms match “${query.trim()}”` : `No ${STATUS_LABEL[status].toLowerCase()} forms`}
                description={q ? 'Try a shorter search, or clear the filters.' : 'Forms with this status will appear here.'}
                action={
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setQuery('')
                      setStatus('all')
                      setPod('all')
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : view === 'card' ? (
              <div key={listKey} className="u-stagger mt-5 grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-3">
                {visible.map((f) => {
                  const action = primaryAction(f)
                  return (
                    <ThumbnailCard
                      key={f.id}
                      thumbnail={<Thumbnail form={f} />}
                      title={
                        renaming === f.id ? (
                          // The card's title slot is a line-clamped (overflow-hidden) h2, so the editor
                          // keeps inside it and draws its focus ring inset.
                          <RenameField value={f.title} onDone={(next) => rename(f.id, next)} className="px-1.5 py-0.5 focus:ring-inset" />
                        ) : (
                          f.title
                        )
                      }
                      status={f.status}
                      people={faces(f)}
                      meta={[
                        { label: 'Expires on', value: f.expires ?? '—' },
                        { label: 'Pod', value: f.pod ?? '—' },
                      ]}
                      footer={<Count value={f.responses} unit={f.responses === 1 ? 'response' : 'responses'} />}
                      action={
                        <Button variant="soft" size="sm" onClick={() => open(f, action)}>
                          {action}
                        </Button>
                      }
                      menu={rowMenu(f, true)}
                      raised={menuOpen === f.id}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="mt-5">
                <ListHeader className={cn('-mx-3', ROW_GRID[tab])}>
                  <span>Status</span>
                  <span>Form</span>
                  {tab === 'team' && <span>Pod</span>}
                  {tab === 'team' && <span className="hidden @3xl:block">Creator</span>}
                  {tab === 'mine' && <span className="hidden text-right @2xl:block">Expires</span>}
                  <span className="text-right">Responses</span>
                  <span aria-hidden="true" />
                </ListHeader>
                <div key={listKey} className="u-stagger divide-y divide-line border-t border-line">
                  {visible.map((f) => {
                    const action = primaryAction(f)
                    return (
                      <ListRow key={f.id} className={cn('-mx-3', ROW_GRID[tab], menuOpen === f.id && 'z-[100]')}>
                        <div className="min-w-0">
                          <StatusBadge status={f.status} />
                        </div>
                        <div className="min-w-0">
                          {renaming === f.id ? (
                            <RenameField value={f.title} onDone={(next) => rename(f.id, next)} className="-mx-1.5 px-1.5 py-0.5 text-body font-semibold tracking-tight" />
                          ) : (
                            <p className="truncate text-body font-semibold tracking-tight">{f.title}</p>
                          )}
                          {tab === 'mine' ? (
                            <p className="mt-0.5 truncate text-label text-muted @2xl:hidden">{f.expires ? `Expires ${f.expires}` : 'No expiry date yet'}</p>
                          ) : (
                            <p className="mt-0.5 flex items-center gap-1.5 text-label text-muted @3xl:hidden">
                              <Avatar person={f.owner} size="xs" tone="neutral" />
                              <span className="truncate">{f.owner === ME ? 'You' : personName(f.owner)}</span>
                            </p>
                          )}
                        </div>
                        {tab === 'team' && <div className="truncate text-label text-muted">{f.pod ?? '—'}</div>}
                        {tab === 'team' && (
                          <div className="hidden min-w-0 items-center gap-1.5 text-label text-muted @3xl:flex">
                            <Avatar person={f.owner} size="xs" tone="neutral" />
                            <span className="truncate">{f.owner === ME ? 'You' : personName(f.owner)}</span>
                          </div>
                        )}
                        {tab === 'mine' && <div className="hidden text-right text-label tabular-nums text-muted @2xl:block">{f.expires ?? '—'}</div>}
                        <div className="text-right text-body font-semibold tabular-nums">{f.responses}</div>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="soft" size="sm" onClick={() => open(f, action)}>
                            {action}
                          </Button>
                          {rowMenu(f, false)}
                        </div>
                      </ListRow>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={deleting ? `Delete “${deleting.title}”?` : ''}
        body={
          deleting && deleting.responses > 0
            ? `Its ${deleting.responses} ${deleting.responses === 1 ? 'response' : 'responses'} will be deleted too. This can’t be undone.`
            : 'This can’t be undone.'
        }
        confirmLabel="Delete form"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return
          setMine((list) => list.filter((f) => f.id !== deleting.id))
          toast(`Deleted “${deleting.title}”`)
          setDeleting(null)
        }}
      />
    </div>
  )
}

/** The form's own artwork — or, for a brand-new form, its default backdrop. */
function Thumbnail({ form }: { form: FormItem }) {
  if (!form.thumb) return <HeroPanel bg="g-violet" padding={0} className="h-full" />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={form.thumb} alt="" className="h-full w-full object-cover" />
}

/**
 * Rename in place. Enter and blur commit, Escape reverts; an emptied field
 * counts as "no change", so a stray click-away can't blank a form's name.
 */
function RenameField({ value, onDone, className }: { value: string; onDone: (next: string | null) => void; className?: string }) {
  const [draft, setDraft] = useState(value)
  const settled = useRef(false)
  const finish = (next: string | null) => {
    if (settled.current) return
    settled.current = true
    onDone(next && next !== value ? next : null)
  }
  return (
    <InlineInput
      autoFocus
      value={draft}
      onChange={setDraft}
      aria-label="Form name"
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish(draft.trim())
        if (e.key === 'Escape') finish(null)
      }}
      onBlur={() => finish(draft.trim())}
      className={className}
    />
  )
}

/* ------------------------------------------------------------------- Code */

const WORKSPACE_CODE = `<AppHeader
  nav={<UnderlineNav items={[{ value: 'mine', label: 'My forms' }, { value: 'team', label: 'Team' }]} value={tab} onChange={setTab} />}
  actions={<><NotificationBell items={updates} onMarkAllRead={markAllRead} /><Avatar person={me} /></>}
/>

<Eyebrow>Your workspace</Eyebrow>
<Heading size="display-lg">Forms</Heading>
<Button leadingIcon={<Plus size={15} />} onClick={createForm}>Create form</Button>

{/* Sticky under the 56px header, opaque so rows don't ghost through */}
<div className="sticky top-14 z-30 flex justify-between border-b border-line bg-bg py-4">
  <FilterPills items={[{ value: 'all', label: 'All', count: 6 }, …]} value={status} onChange={setStatus} />
  <SearchInput value={query} onChange={setQuery} placeholder="Search forms" />
  <IconToggleGroup items={[{ value: 'list', label: 'List view', icon: <ListBullets /> }, …]} value={view} onChange={setView} />
</div>

{visible.length === 0 ? (
  <EmptyState compact title={\`No forms match “\${query}”\`} action={<Button variant="secondary">Clear filters</Button>} />
) : view === 'card' ? (
  <div className="u-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {visible.map((form) => (
      <ThumbnailCard
        thumbnail={<img src={form.thumb} alt="" className="h-full w-full object-cover" />}
        title={form.title}
        status={form.status}
        people={[{ person: form.owner, label: 'You' }, ...collaborators]}
        meta={[{ label: 'Expires on', value: form.expires }, { label: 'Pod', value: form.pod }]}
        footer={<Count value={form.responses} unit="responses" />}
        action={<Button variant="soft" size="sm">{form.status === 'draft' ? 'Edit' : 'Results'}</Button>}
        raised={menuOpen === form.id}
        menu={
          <Menu open={menuOpen === form.id} onOpenChange={…} trigger={
            <IconButton label="More actions" variant="glass" size="md"><DotsThreeVertical /></IconButton>
          }>
            <MenuItem icon={<SlidersHorizontal />}>Edit</MenuItem>
            <MenuItem icon={<PencilSimple />}>Rename</MenuItem>
            <MenuItem icon={<Trash />} tone="danger">Delete</MenuItem>
          </Menu>
        }
      />
    ))}
  </div>
) : (
  <>
    <ListHeader className={GRID}>…</ListHeader>
    <div className="u-stagger divide-y divide-line">
      {visible.map((form) => <ListRow className={GRID}>…</ListRow>)}
    </div>
  </>
)}`

const TEAM_CODE = `<div className="flex items-center gap-2">
  <FilterMenu
    label="Pod"
    value={pod}
    onChange={setPod}
    options={[{ value: 'all', label: 'All pods', count: 6 }, { value: 'Customer', label: 'Customer', count: 2 }, …]}
  />
  <FilterMenu
    label="Status"
    value={status}
    onChange={setStatus}
    options={[{ value: 'all', label: 'All', count }, { value: 'open', label: 'Active', count }, …]}
  />
  {(pod !== 'all' || status !== 'all') && (
    <Button variant="ghost" size="sm" leadingIcon={<X size={12} weight="bold" />} onClick={reset}>Reset</Button>
  )}
</div>
<SearchInput value={query} onChange={setQuery} placeholder="Search forms or people" />`
