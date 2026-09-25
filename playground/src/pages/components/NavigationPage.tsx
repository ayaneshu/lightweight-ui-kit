import { useRef, useState } from 'react'
import {
  Columns,
  CopySimple,
  FlagCheckered,
  Gear,
  HandWaving,
  ImageSquare,
  ListBullets,
  Plus,
  SquaresFour,
  Star,
  TextT,
  Trash,
  UsersThree,
} from 'lightweight-ui/icons'
import {
  AddRow,
  AppHeader,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ChoiceTile,
  Field,
  HoverHighlight,
  Input,
  Logo,
  NotificationBell,
  PeerDots,
  PillTabs,
  PresenceBar,
  PropertyGroup,
  PropertyPanel,
  RailAction,
  RailGroup,
  RailItem,
  ResizeHandle,
  Toggle,
  Toolbar,
  UnderlineNav,
  personColor,
  type Notification,
  type Peer,
} from 'lightweight-ui'
import { Caption, Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section, Specimen } from '../../ui/Demo'

/* ------------------------------------------------------------------ Data */

const NOTES: Notification[] = [
  { id: 'n1', title: 'Omar H commented on Checkout flow test', message: '“Option B’s button copy feels off.”', time: '4m ago' },
  { id: 'n2', title: 'Pricing page headline closed', message: '342 responses — the results are ready.', time: '2h ago' },
  { id: 'n3', title: 'Lena M joined your workspace', time: 'Yesterday', read: true },
]

const PEERS: Peer[] = [
  { person: 'sara.k@example.com', self: true, owner: true, where: 'on Introduction' },
  { person: 'omar.h@example.com', where: 'on Page 2' },
  { person: 'lena.m@example.com', where: 'on Results' },
]

type Kind = 'compare' | 'rating' | 'choice' | 'text' | 'image'

const KIND_ICON: Record<Kind, React.ReactNode> = {
  compare: <Columns size={12} />,
  rating: <Star size={12} />,
  choice: <ListBullets size={12} />,
  text: <TextT size={12} />,
  image: <ImageSquare size={12} />,
}

interface Page {
  id: string
  title: string
  kind: Kind
  done: boolean
  peer?: string
}

const START_PAGES: Page[] = [
  { id: 'p1', title: 'Which checkout is fastest?', kind: 'compare', done: true },
  { id: 'p2', title: 'Rate the winner', kind: 'rating', done: true, peer: 'omar.h@example.com' },
  { id: 'p3', title: 'What made it feel fast?', kind: 'choice', done: false },
]

/* ------------------------------------------------------------------ Page */

export default function NavigationPage() {
  const [tab, setTab] = useState<'forms' | 'templates' | 'team'>('forms')
  const [notes, setNotes] = useState(NOTES)
  const [view, setView] = useState<'editor' | 'preview' | 'results'>('editor')

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Headers & rails"
        description="The frame around the work. One header runs across the workspace. One toolbar stays the same across every view of an item. A rail of pages sits on the left, and a panel of settings on the right. Each stays quiet, so the canvas gets the attention."
      />

      <Section
        id="app-header"
        title="App header"
        description="The top bar of the workspace. It's 56px tall with a thin line underneath, and blurs the page behind it when sticky. UnderlineNav fills the bar's full height, so the active tab's underline sits on the header's bottom line instead of floating above it."
      >
        <Demo
          stage="none"
          code={`<AppHeader
  brand={<Logo href="/" />}
  nav={
    <UnderlineNav
      label="Workspace"
      value={tab}
      onChange={setTab}
      items={[
        { value: 'forms', label: 'Forms', href: '/forms' },
        { value: 'templates', label: 'Templates', href: '/templates' },
        { value: 'team', label: 'Team', href: '/team' },
      ]}
    />
  }
  actions={
    <>
      <NotificationBell items={notifications} onMarkAllRead={markAllRead} />
      <Avatar person={user.email} />
    </>
  }
/>`}
        >
          <AppHeader
            sticky={false}
            contained={false}
            className="relative"
            nav={
              <UnderlineNav
                label="Workspace"
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'forms', label: 'Forms' },
                  { value: 'templates', label: 'Templates' },
                  { value: 'team', label: 'Team' },
                ]}
              />
            }
            actions={
              <>
                <NotificationBell
                  items={notes}
                  onMarkAllRead={() => setNotes((ns) => ns.map((n) => ({ ...n, read: true })))}
                  onItemClick={(item) => setNotes((ns) => ns.map((n) => (n.id === item.id ? { ...n, read: true } : n)))}
                />
                <Avatar person="sara.k@example.com" className="ml-1" />
              </>
            }
          />
          <div className="pg-stage h-[340px] p-6">
            <p className="text-label font-medium text-muted">{tab === 'forms' ? 'Your forms' : tab === 'templates' ? 'Templates' : 'Your team'}</p>
            <div key={tab} className="u-view mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: tab === 'team' ? 2 : 3 }, (_, i) => (
                <div key={i} className="h-24 rounded-tile bg-card shadow-card" />
              ))}
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="logo" title="Logo" description="A letter tile and the product name. Pass name={null} to show only the tile, for a collapsed rail or another small space.">
        <Demo
          code={`<Logo />
<Logo name={null} />
<Logo badge={<Badge size="sm">Demo</Badge>} />
<Logo letter="A" name="Acme Research" href="/" />`}
          className="gap-10"
        >
          <Specimen label="default">
            <Logo />
          </Specimen>
          <Specimen label="tile only">
            <Logo name={null} />
          </Specimen>
          <Specimen label="with badge">
            <Logo badge={<Badge size="sm">Demo</Badge>} />
          </Specimen>
          <Specimen label="custom">
            <Logo letter="A" name="Acme Research" />
          </Specimen>
        </Demo>
      </Section>

      <Section
        id="toolbar"
        title="Toolbar"
        description="A full-width bar for working on one item. The breadcrumb sits on the left, the view switch in the centre, and people and the main action on the right. It stays the same across every view of the item, so only the content below it changes."
      >
        <Demo
          stage="none"
          code={`<Toolbar
  start={
    <Breadcrumb
      items={[
        { label: 'Forms', href: '/forms' },
        { label: form.title },
      ]}
    />
  }
  center={
    <PillTabs
      label="View"
      value={view}
      onChange={setView}
      items={[
        { value: 'editor', label: 'Editor' },
        { value: 'preview', label: 'Preview' },
        { value: 'results', label: 'Results' },
      ]}
    />
  }
  end={
    <>
      <PresenceBar peers={peers} max={3} />
      <Button size="md">Publish</Button>
    </>
  }
/>`}
        >
          <Toolbar
            sticky={false}
            start={<Breadcrumb label="Breadcrumb, toolbar demo" items={[{ label: 'Forms', onClick: () => setView('editor') }, { label: 'Checkout flow test' }]} />}
            center={
              <PillTabs
                label="View"
                value={view}
                onChange={setView}
                items={[
                  { value: 'editor', label: 'Editor' },
                  { value: 'preview', label: 'Preview' },
                  { value: 'results', label: 'Results' },
                ]}
              />
            }
            end={
              <>
                <PresenceBar peers={PEERS} max={3} />
                <Button size="md">Publish</Button>
              </>
            }
          />
          <div className="pg-stage grid h-52 place-items-center">
            <div key={view} className="u-view rounded-tile bg-card px-5 py-3 text-ui text-muted shadow-card">
              The {view} view. The bar above didn’t move.
            </div>
          </div>
        </Demo>
        <Caption>
          The centre slot is centred on the whole bar, not on the space between the sides. It’s hidden below 768px, so give phones another way to
          switch views.
        </Caption>
      </Section>

      <Section
        id="breadcrumb"
        title="Breadcrumb"
        description="Shows where the current page sits. Parent pages are muted, the current page uses the main text colour, and a small caret separates each one. Only the current page's name gets shortened, because it's the page you're already looking at."
      >
        <Demo
          code={`<Breadcrumb
  items={[
    { label: 'Workspace', href: '/' },
    { label: 'Forms', href: '/forms' },
    { label: 'Checkout flow test' },  // last: aria-current="page"
  ]}
/>`}
          className="flex-col"
        >
          <Breadcrumb items={[{ label: 'Workspace', onClick: () => {} }, { label: 'Forms', onClick: () => {} }, { label: 'Checkout flow test' }]} />
          <div className="w-[260px] rounded-xl border border-dashed border-line-strong px-3 py-2">
            <Breadcrumb label="Breadcrumb, long title" items={[{ label: 'Forms', onClick: () => {} }, { label: 'Onboarding illustration, round two — final copy' }]} />
          </div>
          <Caption>In a 260px space, the current page’s name is shortened first.</Caption>
        </Demo>
      </Section>

      <Section
        id="hover-highlight"
        title="Hover highlight"
        description="One soft background that slides to whichever item you point at, instead of each item having its own hover background. The movement shows that the items belong together. Mark each item with data-hl, and don't give items a hover background of their own."
      >
        <HoverPlayground />
      </Section>

      <Section
        id="rail"
        title="Rail"
        description="The left column of the builder, listing every page. The introduction and end screens are fixed, so they're flat rows. The pages between them sit in a soft group, where the active page shows as a white card. A page's icon turns green once the page is ready."
      >
        <BuilderRail />
        <RailPlayground />
      </Section>

      <Section
        id="property-panel"
        title="Property panel"
        description="The right column of the builder, with settings for the selected page. A quiet header sits above groups of settings, separated by lines. Use a Toggle row for each on/off setting, and a grid of ChoiceTiles for picking a type."
      >
        <PropertyDemo />
      </Section>

      <Section
        id="resize-handle"
        title="Resize handle"
        description="A handle on a panel's inner edge for changing its width. A thicker line appears over the border when you hover, drag or focus it. Arrow keys move it 16px at a time, and a double-click resets it. onResize runs as you drag. onCommit runs once when you let go, which is when to save the width."
      >
        <ResizeDemo />
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="AppHeader"
          rows={[
            { name: 'brand', type: 'ReactNode', default: '<Logo />', description: 'Shown at the left edge.' },
            { name: 'nav', type: 'ReactNode', description: 'Next to the brand, usually an UnderlineNav.' },
            { name: 'actions', type: 'ReactNode', description: 'The right side, such as notifications and an avatar.' },
            { name: 'contained', type: 'boolean', default: 'true', description: 'Keeps the content within the 1100px workspace width. Set false to span the full width.' },
            { name: 'sticky', type: 'boolean', default: 'true', description: 'Sticks to the top of the page, with a translucent, blurred background.' },
          ]}
        />
        <PropsTable
          title="Logo"
          rows={[
            { name: 'letter', type: 'string', default: "'L'", description: 'The letter in the tile.' },
            { name: 'name', type: 'ReactNode | null', default: "'Lightweight UI'", description: 'The product name next to the tile. Pass null to show only the tile.' },
            { name: 'href', type: 'string', description: 'Renders the logo as a link.' },
            { name: 'badge', type: 'ReactNode', description: 'A small tag after the name.' },
          ]}
        />
        <PropsTable
          title="Toolbar"
          rows={[
            { name: 'start', type: 'ReactNode', description: 'The left side, usually a Breadcrumb.' },
            { name: 'center', type: 'ReactNode', description: 'Centred on the bar. Hidden below 768px.' },
            { name: 'end', type: 'ReactNode', description: 'The right side, usually who’s here and the main action.' },
            { name: 'sticky', type: 'boolean', default: 'true', description: 'Sticks to the top of the page, with a translucent, blurred background.' },
          ]}
        />
        <PropsTable
          title="Breadcrumb"
          rows={[
            { name: 'items', type: 'Crumb[]', description: '{ label, href?, onClick? }. The last item is the current page.' },
          ]}
        />
        <PropsTable
          title="HoverHighlight"
          rows={[
            { name: 'children', type: 'ReactNode', description: 'Any content. The highlight follows items marked with data-hl.' },
            { name: 'radius', type: 'number', default: '12', description: 'Corner radius of the highlight, in px.' },
            { name: 'tone', type: 'string', default: "'rgba(0,0,0,0.05)'", description: 'Any CSS colour.' },
          ]}
        />
        <PropsTable
          title="RailItem"
          rows={[
            { name: 'icon', type: 'ReactNode', description: 'A 12px icon, shown in an IconTile.' },
            { name: 'label', type: 'ReactNode', description: 'Shortened with an ellipsis if it’s too long.' },
            { name: 'variant', type: "'flat' | 'raised'", default: "'flat'", description: "'flat' for a row on its own, 'raised' for a row inside a RailGroup." },
            { name: 'active', type: 'boolean', default: 'false', description: 'Flat rows get a darker background. Raised rows become a white card.' },
            { name: 'done', type: 'boolean', default: 'false', description: 'Turns the icon tile green to show the page is ready.' },
            { name: 'actions', type: 'ReactNode', description: 'RailActions that appear on hover or focus.' },
            { name: 'trailing', type: 'ReactNode', description: 'Always visible, such as PeerDots or a count.' },
            { name: 'onDragStart / onDrop', type: '(e: DragEvent) => void', description: 'Raised only. Shows a drag handle and accepts drops.' },
            { name: 'onClick', type: '() => void', description: 'Selects the row.' },
          ]}
        />
        <PropsTable
          title="RailGroup · RailAction · AddRow"
          rows={[
            { name: 'RailGroup footer', type: 'ReactNode', description: 'Shown under the rows, usually an AddRow.' },
            { name: 'RailAction label', type: 'string', description: 'The name for screen readers, also shown as a tooltip.' },
            { name: 'RailAction tone', type: "'default' | 'danger'", default: "'default'", description: 'danger turns the icon red on hover.' },
            { name: 'RailAction disabled', type: 'boolean', description: 'Faded and can’t be pressed, for example when the last page can’t be deleted.' },
            { name: 'AddRow icon', type: 'ReactNode', description: 'Shown before the label.' },
          ]}
        />
        <PropsTable
          title="PropertyPanel · PropertyGroup"
          rows={[
            { name: 'PropertyPanel title', type: 'ReactNode', default: "'Properties'", description: 'The muted header at the top.' },
            { name: 'PropertyGroup title', type: 'ReactNode', description: 'Optional section heading.' },
            { name: 'children', type: 'ReactNode', description: 'Fields, toggles or tiles, spaced 12px apart.' },
          ]}
        />
        <PropsTable
          title="ResizeHandle"
          rows={[
            { name: 'width', type: 'number', description: 'The panel’s current width.' },
            { name: 'onResize', type: '(width) => void', description: 'Runs on every move while dragging.' },
            { name: 'onCommit', type: '(width) => void', description: 'Runs on release, or after an arrow-key move. Save the width here.' },
            { name: 'min / max', type: 'number', description: 'The smallest and largest allowed width.' },
            { name: 'defaultWidth', type: 'number', description: 'The width a double-click resets to.' },
            { name: 'side', type: "'left' | 'right'", description: 'Which edge of the layout the panel is on.' },
            { name: 'label', type: 'string', default: "'Resize panel'", description: 'The handle’s name for screen readers.' },
          ]}
        />
      </Section>
    </>
  )
}

/* ---------------------------------------------------------- Hover highlight */

const TONES = { wash: 'rgba(0,0,0,0.05)', deeper: 'rgba(0,0,0,0.08)', tint: 'rgba(42,120,214,0.12)' }

function HoverPlayground() {
  const [radius, setRadius] = useState<'8' | '12' | '16'>('12')
  const [tone, setTone] = useState<keyof typeof TONES>('wash')
  const items = [
    { icon: <SquaresFour size={16} />, label: 'Forms' },
    { icon: <Star size={16} />, label: 'Templates' },
    { icon: <UsersThree size={16} />, label: 'Team' },
    { icon: <Gear size={16} />, label: 'Settings' },
  ]
  return (
    <Demo
      code={`<HoverHighlight${radius !== '12' ? ` radius={${radius}}` : ''}${tone !== 'wash' ? ` tone="${TONES[tone]}"` : ''}>
  {links.map((link) => (
    <a key={link.href} href={link.href} data-hl className="flex items-center gap-2.5 px-3 py-2 text-ui font-medium">
      {link.icon}
      {link.label}
    </a>
  ))}
</HoverHighlight>`}
      controls={
        <>
          <KnobSegment label="radius" value={radius} options={['8', '12', '16'] as const} onChange={setRadius} />
          <KnobSegment label="tone" value={tone} options={['wash', 'deeper', 'tint'] as const} onChange={setTone} />
        </>
      }
      className="gap-10"
    >
      {/* The border sits on a wrapper: the highlight is measured from the container's border box. */}
      <div className="w-48 rounded-2xl bg-card p-1.5 shadow-card">
        <HoverHighlight radius={Number(radius)} tone={TONES[tone]}>
          {items.map((it) => (
            <button key={it.label} type="button" data-hl className="relative flex w-full items-center gap-2.5 px-3 py-2 text-left text-ui font-medium text-ink">
              <span className="text-muted">{it.icon}</span>
              {it.label}
            </button>
          ))}
        </HoverHighlight>
      </div>
      <div className="rounded-full bg-card p-1 shadow-card">
        <HoverHighlight radius={Number(radius)} tone={TONES[tone]} className="flex items-center gap-1">
          {['Day', 'Week', 'Month', 'Year'].map((l) => (
            <button key={l} type="button" data-hl className="relative px-3.5 py-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
              {l}
            </button>
          ))}
        </HoverHighlight>
      </div>
    </Demo>
  )
}

/* ------------------------------------------------------------ Builder rail */

function BuilderRail() {
  const [pages, setPages] = useState(START_PAGES)
  const [active, setActive] = useState('p1')
  const dragFrom = useRef<number | null>(null)
  const nextId = useRef(4)

  const current =
    active === 'intro' ? 'Introduction' : active === 'end' ? 'End screen' : (pages.find((p) => p.id === active)?.title ?? 'Introduction')

  function duplicate(i: number) {
    const copy = { ...pages[i], id: `p${nextId.current++}`, title: `${pages[i].title} (copy)`, peer: undefined }
    setPages((ps) => [...ps.slice(0, i + 1), copy, ...ps.slice(i + 1)])
    setActive(copy.id)
  }

  function remove(i: number) {
    const gone = pages[i]
    const rest = pages.filter((p) => p.id !== gone.id)
    setPages(rest)
    if (active === gone.id) setActive(rest[Math.max(0, i - 1)]?.id ?? 'intro')
  }

  function add() {
    const page: Page = { id: `p${nextId.current++}`, title: 'Untitled page', kind: 'text', done: false }
    setPages((ps) => [...ps, page])
    setActive(page.id)
  }

  function move(to: number) {
    const from = dragFrom.current
    dragFrom.current = null
    if (from === null || from === to) return
    setPages((ps) => {
      const next = [...ps]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  return (
    <Demo
      title="A builder sidebar"
      description="Hover over a page to duplicate or delete it. Drag its handle to reorder. One HoverHighlight wraps the whole rail, so the hover background moves smoothly between flat and grouped rows."
      code={`<HoverHighlight className="space-y-1.5">
  <RailItem icon={<HandWaving size={12} />} label="Introduction" done active={active === 'intro'} onClick={() => setActive('intro')} />

  <RailGroup footer={<AddRow icon={<Plus size={12} />} onClick={addPage}>Add page</AddRow>}>
    {pages.map((page, i) => (
      <RailItem
        key={page.id}
        variant="raised"
        icon={iconFor(page.kind)}
        label={page.title}
        done={page.ready}
        active={active === page.id}
        onClick={() => setActive(page.id)}
        trailing={<PeerDots colors={peersOn(page.id).map(personColor)} />}
        onDragStart={(e) => startDrag(e, i)}
        onDrop={() => dropAt(i)}
        actions={
          <>
            <RailAction label="Duplicate" onClick={() => duplicate(i)}><CopySimple size={12} /></RailAction>
            <RailAction label="Delete" tone="danger" disabled={pages.length === 1} onClick={() => remove(i)}>
              <Trash size={12} />
            </RailAction>
          </>
        }
      />
    ))}
  </RailGroup>

  <RailItem icon={<FlagCheckered size={12} />} label="End screen" active={active === 'end'} onClick={() => setActive('end')} />
</HoverHighlight>`}
      className="items-stretch gap-6"
    >
      <div className="w-[256px] flex-none rounded-panel bg-card p-2.5 shadow-card">
        <HoverHighlight className="space-y-1.5">
          <RailItem icon={<HandWaving size={12} />} label="Introduction" done active={active === 'intro'} onClick={() => setActive('intro')} />
          <RailGroup
            footer={
              <AddRow icon={<Plus size={12} aria-hidden="true" />} onClick={add}>
                Add page
              </AddRow>
            }
          >
            {pages.map((p, i) => (
              <RailItem
                key={p.id}
                variant="raised"
                icon={KIND_ICON[p.kind]}
                label={p.title}
                done={p.done}
                active={active === p.id}
                onClick={() => setActive(p.id)}
                trailing={p.peer ? <PeerDots colors={[personColor(p.peer)]} className="mr-1" /> : undefined}
                onDragStart={(e) => {
                  dragFrom.current = i
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', p.id)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  move(i)
                }}
                actions={
                  <>
                    <RailAction label="Duplicate" onClick={() => duplicate(i)}>
                      <CopySimple size={12} />
                    </RailAction>
                    <RailAction label="Delete" tone="danger" disabled={pages.length === 1} onClick={() => remove(i)}>
                      <Trash size={12} />
                    </RailAction>
                  </>
                }
              />
            ))}
          </RailGroup>
          <RailItem icon={<FlagCheckered size={12} />} label="End screen" active={active === 'end'} onClick={() => setActive('end')} />
        </HoverHighlight>
      </div>
      <div className="flex min-w-[200px] flex-1 flex-col items-center justify-center rounded-canvas bg-card p-6 text-center shadow-card">
        <p className="text-label text-muted">Editing</p>
        <p key={current} className="u-swap mt-1 text-title font-semibold tracking-tight">
          {current}
        </p>
      </div>
    </Demo>
  )
}

function RailPlayground() {
  const [variant, setVariant] = useState<'flat' | 'raised'>('raised')
  const [active, setActive] = useState(true)
  const [done, setDone] = useState(false)
  const [actions, setActions] = useState(true)
  const [trailing, setTrailing] = useState(true)

  const code = `<RailItem${variant === 'raised' ? ' variant="raised"' : ''}
  icon={<Star size={12} />}
  label="Rate the winner"${active ? '\n  active' : ''}${done ? '\n  done' : ''}${
    trailing ? `\n  trailing={<PeerDots colors={[personColor('omar.h@example.com')]} />}` : ''
  }${actions ? `\n  actions={<RailAction label="Delete" tone="danger" onClick={remove}><Trash size={12} /></RailAction>}` : ''}
/>`

  const item = (
    <RailItem
      variant={variant}
      icon={<Star size={12} />}
      label="Rate the winner"
      active={active}
      done={done}
      trailing={trailing ? <PeerDots colors={[personColor('omar.h@example.com'), personColor('lena.m@example.com')]} className="mr-1" /> : undefined}
      actions={
        actions ? (
          <RailAction label="Delete" tone="danger">
            <Trash size={12} />
          </RailAction>
        ) : undefined
      }
    />
  )

  return (
    <Demo
      title="RailItem"
      description="Use flat for a row on its own and raised for a row inside a RailGroup. Trailing content is always visible. Actions appear only on hover or focus, so the rail shows just page names until you need more."
      code={code}
      controls={
        <>
          <KnobSegment label="variant" value={variant} options={['flat', 'raised'] as const} onChange={setVariant} />
          <div>
            <KnobToggle label="active" checked={active} onChange={setActive} />
            <KnobToggle label="done" checked={done} onChange={setDone} />
            <KnobToggle label="trailing" checked={trailing} onChange={setTrailing} />
            <KnobToggle label="actions" checked={actions} onChange={setActions} />
          </div>
        </>
      }
    >
      <div className="w-[240px] rounded-panel bg-card p-2.5 shadow-card">
        {variant === 'raised' ? <RailGroup>{item}</RailGroup> : item}
      </div>
    </Demo>
  )
}

/* ---------------------------------------------------------- Property panel */

const ANSWER_TYPES: { value: Kind; label: string }[] = [
  { value: 'compare', label: 'Compare' },
  { value: 'rating', label: 'Rating' },
  { value: 'choice', label: 'Choice' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
]

function PropertyDemo() {
  const [title, setTitle] = useState('Rate the winner')
  const [kind, setKind] = useState<Kind>('rating')
  const [required, setRequired] = useState(true)
  const [shuffle, setShuffle] = useState(false)

  return (
    <Demo
      stage="none"
      code={`<PropertyPanel>
  <PropertyGroup title="Page">
    <Field label="Title" subtle>
      <Input size="sm" value={page.title} onChange={(e) => update({ title: e.target.value })} />
    </Field>
  </PropertyGroup>
  <PropertyGroup title="Answer type">
    <div className="grid grid-cols-3 gap-2">
      {TYPES.map((t) => (
        <ChoiceTile key={t.value} icon={t.icon} label={t.label} selected={page.kind === t.value} onClick={() => update({ kind: t.value })} />
      ))}
    </div>
  </PropertyGroup>
  <PropertyGroup title="Settings">
    <Toggle label="Required" hint="Voters can’t skip this page." checked={page.required} onChange={(required) => update({ required })} />
  </PropertyGroup>
</PropertyPanel>`}
    >
      <div className="pg-stage flex flex-col gap-4 p-6 sm:flex-row">
        <div className="flex min-h-[240px] min-w-0 flex-1 flex-col items-center justify-center rounded-canvas bg-card p-6 text-center shadow-card">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink/[0.06] text-muted" aria-hidden="true">
            {KIND_ICON[kind]}
          </span>
          <p className="mt-3 text-title font-semibold tracking-tight">{title || 'Untitled page'}</p>
          <p className="mt-1 text-label text-muted">
            {ANSWER_TYPES.find((t) => t.value === kind)?.label} · {required ? 'Required' : 'Optional'}
            {shuffle ? ' · Shuffled' : ''}
          </p>
        </div>
        <PropertyPanel as="div" className="w-full flex-none overflow-hidden rounded-panel sm:w-[280px] bg-ink/[0.03]">
          <PropertyGroup title="Page">
            <Field label="Title" subtle>
              <Input size="sm" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
          </PropertyGroup>
          <PropertyGroup title="Answer type">
            <div className="grid grid-cols-3 gap-2">
              {ANSWER_TYPES.map((t) => (
                <ChoiceTile key={t.value} icon={KIND_ICON[t.value]} label={t.label} selected={kind === t.value} onClick={() => setKind(t.value)} />
              ))}
            </div>
          </PropertyGroup>
          <PropertyGroup title="Settings">
            <Toggle label="Required" hint="Voters can’t skip this page." checked={required} onChange={setRequired} />
            <Toggle label="Shuffle options" hint="Shows options in a random order, so their position doesn’t sway votes." checked={shuffle} onChange={setShuffle} />
          </PropertyGroup>
        </PropertyPanel>
      </div>
    </Demo>
  )
}

/* ----------------------------------------------------------- Resize handle */

function ResizeDemo() {
  const [side, setSide] = useState<'left' | 'right'>('left')
  const [width, setWidth] = useState(220)
  const [committed, setCommitted] = useState(220)

  const panel = (
    <div
      style={{ width }}
      className={side === 'left' ? 'flex-none overflow-hidden border-r border-line bg-card p-2.5' : 'flex-none overflow-hidden border-l border-line bg-card'}
    >
      {side === 'left' ? (
        <div className="space-y-0.5">
          <RailItem icon={<HandWaving size={12} />} label="Introduction" done />
          <RailItem icon={<Columns size={12} />} label="Which checkout is fastest?" active />
          <RailItem icon={<Star size={12} />} label="Rate the winner" />
          <RailItem icon={<FlagCheckered size={12} />} label="End screen" />
        </div>
      ) : (
        <PropertyPanel>
          <PropertyGroup title="Settings">
            <Toggle label="Required" checked onChange={() => {}} />
          </PropertyGroup>
        </PropertyPanel>
      )}
    </div>
  )

  return (
    <Demo
      code={`const [width, setWidth] = useState(saved ?? 240)

<div className="relative flex">
  <aside style={{ width }} className="flex-none border-r border-line">…</aside>
  <main className="min-w-0 flex-1">…</main>
  <ResizeHandle
    side="${side}"
    width={width}
    onResize={setWidth}
    onCommit={(w) => localStorage.setItem('rail-width', String(w))}
    min={180}
    max={340}
    defaultWidth={220}
    label="Resize ${side === 'left' ? 'pages' : 'properties'} panel"
  />
</div>`}
      controls={
        <>
          <KnobSegment
            label="side"
            value={side}
            options={['left', 'right'] as const}
            onChange={(s) => {
              setSide(s)
              setWidth(220)
              setCommitted(220)
            }}
          />
          <div className="space-y-1 text-label">
            <p className="flex justify-between">
              <span className="text-muted">onResize</span>
              <span className="font-mono tabular-nums">{width}px</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">onCommit</span>
              <span className="font-mono tabular-nums">{committed}px</span>
            </p>
          </div>
          <Caption>Drag the edge, or focus it and press ← or →. Double-click to reset to 220px.</Caption>
        </>
      }
      stage="none"
    >
      <div className="p-6">
        <div className="relative flex h-[300px] overflow-hidden rounded-panel bg-card shadow-card">
          {side === 'left' && panel}
          <div className="pg-stage grid min-w-0 flex-1 place-items-center p-4 text-center text-label text-muted">Canvas</div>
          {side === 'right' && panel}
          <ResizeHandle
            side={side}
            width={width}
            onResize={setWidth}
            onCommit={setCommitted}
            min={180}
            max={340}
            defaultWidth={220}
            label={`Resize ${side === 'left' ? 'pages' : 'properties'} panel`}
          />
        </div>
      </div>
    </Demo>
  )
}
