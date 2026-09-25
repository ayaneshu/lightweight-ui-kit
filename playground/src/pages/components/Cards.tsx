import { useState } from 'react'
import { ChartBar, CopySimple, DotsThreeVertical, LinkSimple, PencilSimple, Plus, Trash } from 'lightweight-ui/icons'
import {
  Button,
  Card,
  ChartCard,
  Count,
  HeroFigure,
  IconButton,
  Menu,
  MenuDivider,
  MenuItem,
  MetaItem,
  ShareBar,
  ShareLegend,
  StatTile,
  ThumbnailCard,
  cn,
  optionColor,
  type Status,
} from 'lightweight-ui'
import { Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section, Specimen } from '../../ui/Demo'

type Variant = 'flat' | 'raised' | 'dashed'
type Radius = 'tile' | 'panel' | 'sheet'
type Padding = 'none' | 'sm' | 'md' | 'lg'

const PEOPLE = ['sara.k@example.com', 'omar.h@example.com', 'lena.m@example.com', 'ravi.p@example.com', 'mei.l@example.com']

const Thumb = ({ n }: { n: number }) => <img src={`./thumbnails/ascii-${n}.webp`} alt="" className="h-full w-full object-cover" />

export default function Cards() {
  const [variant, setVariant] = useState<Variant>('flat')
  const [radius, setRadius] = useState<Radius>('panel')
  const [padding, setPadding] = useState<Padding>('md')
  const [interactive, setInteractive] = useState(false)

  const props = [
    variant !== 'flat' && `variant="${variant}"`,
    radius !== 'panel' && `radius="${radius}"`,
    padding !== 'md' && `padding="${padding}"`,
    interactive && 'interactive',
  ].filter(Boolean)
  const code = `<Card${props.length ? ' ' + props.join(' ') : ''}>
  <h3 className="text-title font-semibold tracking-tight">Checkout flow test</h3>
  <p className="mt-1 text-ui text-muted">Which of three checkout layouts do shoppers finish fastest?</p>
  <div className="mt-4 grid grid-cols-2 gap-3">
    <MetaItem label="Responses">128</MetaItem>
    <MetaItem label="Closes">Oct 3</MetaItem>
  </div>
</Card>`

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Cards & stats"
        description="Cards hold related content together, and stat components show the numbers in a report. Cards are flat by default, because a thin border is enough on a plain page. Save shadows for things that float. On hover, a card's border darkens instead of the card lifting. A report leads with one big number."
      />

      <Section id="playground" title="Playground">
        <Demo
          code={code}
          codeOpen
          controls={
            <>
              <KnobSegment label="variant" value={variant} options={['flat', 'raised', 'dashed'] as const} onChange={setVariant} />
              <KnobSegment label="radius" value={radius} options={['tile', 'panel', 'sheet'] as const} onChange={setRadius} />
              <KnobSegment label="padding" value={padding} options={['none', 'sm', 'md', 'lg'] as const} onChange={setPadding} />
              <KnobToggle label="interactive" checked={interactive} onChange={setInteractive} />
            </>
          }
        >
          <Card variant={variant} radius={radius} padding={padding} interactive={interactive} className="w-full max-w-sm">
            <h3 className="text-title font-semibold tracking-tight">Checkout flow test</h3>
            <p className="mt-1 text-ui text-muted">Which of three checkout layouts do shoppers finish fastest?</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetaItem label="Responses">128</MetaItem>
              <MetaItem label="Closes">Oct 3</MetaItem>
            </div>
          </Card>
        </Demo>
      </Section>

      <Section
        id="variants"
        title="Variants"
        description="Flat has a thin border and nothing else. Raised adds a soft shadow, for something that floats above the page. Dashed marks an empty space that's waiting to be filled."
      >
        <Demo
          code={`<Card>…</Card>
<Card variant="raised">…</Card>
<Card variant="dashed">…</Card>`}
        >
          <div className="w-full @container">
            <div className="grid gap-4 @lg:grid-cols-3">
              <Card>
                <p className="text-label text-muted">Flat</p>
                <p className="mt-1 text-ui font-medium">Sits on the page, with a thin border.</p>
              </Card>
              <Card variant="raised">
                <p className="text-label text-muted">Raised</p>
                <p className="mt-1 text-ui font-medium">Floats above the page, like an invite or a pinned summary.</p>
              </Card>
              <Card variant="dashed" className="flex flex-col items-center justify-center text-center">
                <Plus size={18} className="text-muted" aria-hidden="true" />
                <p className="mt-1.5 text-ui font-medium">New form</p>
                <p className="text-label text-muted">An empty slot to fill.</p>
              </Card>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        id="radius"
        title="Radius & hover"
        description="Three corner sizes, named for where they're used: `tile` for dashboard cards, `panel` for chart cards, and `sheet` for feature cards and empty states. On hover, an interactive card darkens its border and background. It doesn't gain a shadow, because that would make it look more important than the cards around it."
      >
        <Demo
          code={`<Card radius="tile" interactive>…</Card>   // 20px
<Card radius="panel" interactive>…</Card>  // 22px
<Card radius="sheet" interactive>…</Card>  // 26px`}
          className="items-end gap-6"
        >
          {(
            [
              ['tile', '20px'],
              ['panel', '22px'],
              ['sheet', '26px'],
            ] as const
          ).map(([r, px]) => (
            <Specimen key={r} label={r} sub={px}>
              <Card radius={r} interactive className="grid h-28 w-36 place-items-center">
                <span className="text-label text-muted">Hover me</span>
              </Card>
            </Specimen>
          ))}
        </Demo>
      </Section>

      <Section
        id="thumbnail-card"
        title="Thumbnail card"
        description="A card for one item on a dashboard, such as a form. It shows artwork, the people involved, a status, a title, two facts and one action. Avatars overlap the bottom edge of the artwork, which ties the image to the details below."
      >
        <ThumbnailPlayground />
        <Demo
          title="On a dashboard"
          description="The ⋮ button sits on a frosted-glass background, so it stays visible on any artwork. While the menu is open, set raised on the card so the menu appears above the card below it."
          code={`const [open, setOpen] = useState(false)

<ThumbnailCard
  thumbnail={<img src={form.thumbnail} alt="" className="h-full w-full object-cover" />}
  title="Checkout flow test"
  href="/forms/checkout"
  status="open"
  people={[{ person: 'sara.k@example.com' }, { person: 'omar.h@example.com' }]}
  meta={[
    { label: 'Created', value: 'Sep 12' },
    { label: 'Closes', value: 'Oct 3' },
  ]}
  footer={<Count value={128} unit="responses" />}
  action={<Button variant="soft" size="sm">Results</Button>}
  raised={open}
  menu={
    <Menu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <IconButton label="More actions" variant="glass" size="md">
          <DotsThreeVertical size={16} weight="bold" />
        </IconButton>
      }
    >
      <MenuItem icon={<PencilSimple size={15} />}>Edit</MenuItem>
      <MenuItem icon={<CopySimple size={15} />}>Duplicate</MenuItem>
      <MenuDivider />
      <MenuItem icon={<Trash size={15} />} tone="danger">Delete</MenuItem>
    </Menu>
  }
/>`}
        >
          <div className="w-full @container">
            <div className="grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
              <DashboardCard
                thumb={1}
                title="Checkout flow test"
                status="open"
                people={PEOPLE.slice(0, 2)}
                meta={[
                  { label: 'Created', value: 'Sep 12' },
                  { label: 'Closes', value: 'Oct 3' },
                ]}
                count={128}
                action="Results"
              />
              <DashboardCard
                thumb={4}
                title="Onboarding illustration, round two"
                status="draft"
                people={PEOPLE.slice(2, 3)}
                meta={[
                  { label: 'Created', value: 'Sep 20' },
                  { label: 'Pages', value: '4' },
                ]}
                count={0}
                action="Edit"
              />
              <DashboardCard
                thumb={5}
                title="Pricing page headline"
                status="closed"
                people={PEOPLE}
                meta={[
                  { label: 'Created', value: 'Aug 2' },
                  { label: 'Closed', value: 'Aug 16' },
                ]}
                count={342}
                action="Results"
              />
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        id="numbers"
        title="Hero figure & stat tiles"
        description="A report leads with one number. HeroFigure sets it as the headline, at 52px in the display typeface. StatTile shows the supporting numbers beside it, in Geist."
      >
        <Demo
          code={`<HeroFigure label="Responses" value="1,284" sub="+86 since yesterday" />

<StatTile label="Completion" value="82%" sub="of everyone who opened it" />
<StatTile label="Median time" value="1m 48s" />
<StatTile label="Leading" value="Option B" sub="by 14 points" />`}
        >
          <div className="w-full @container">
            <div className="grid items-end gap-6 @2xl:grid-cols-[auto_minmax(0,1fr)]">
              <HeroFigure label="Responses" value="1,284" sub="+86 since yesterday" />
              <div className="grid gap-3 @md:grid-cols-3">
                <StatTile label="Completion" value="82%" sub="of everyone who opened it" />
                <StatTile label="Median time" value="1m 48s" sub="start to submit" />
                <StatTile label="Leading" value="Option B" sub="by 14 points" />
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section
        id="facts"
        title="Meta items & counts"
        description="MetaItem shows a label above a value. Put two side by side and they read like the columns of a list view. Count shows a large number next to its unit, for the single total in a card's footer."
      >
        <Demo
          code={`<div className="grid grid-cols-2 gap-3">
  <MetaItem label="Created">Sep 12, 2026</MetaItem>
  <MetaItem label="Owner">Sara K</MetaItem>
</div>

<Count value={128} unit="responses" />`}
          className="gap-10"
        >
          <Card className="w-full max-w-xs">
            <div className="grid grid-cols-2 gap-3">
              <MetaItem label="Created">Sep 12, 2026</MetaItem>
              <MetaItem label="Owner">Sara K</MetaItem>
              <MetaItem label="Pages">6</MetaItem>
              <MetaItem label="Link">
                <span className="truncate">forms.example.com/f/checkout-flow-test</span>
              </MetaItem>
            </div>
          </Card>
          <div className="space-y-3">
            <Count value={128} unit="responses" />
            <Count value={6} unit="pages" />
            <Count value={1} unit="collaborator" />
          </div>
        </Demo>
      </Section>

      <Section
        id="chart-card"
        title="Chart card"
        description="A card that holds a chart, with a title on the left and one small fact on the right. It's flat, so a report with several charts reads as one document, not a stack of floating boxes."
      >
        <Demo
          code={`<ChartCard title="Which checkout felt fastest?" meta="128 responses">
  <ShareBar slices={slices} />
  <ShareLegend slices={slices} className="mt-4" />
</ChartCard>`}
        >
          <ChartCard title="Which checkout felt fastest?" meta="128 responses" className="w-full max-w-md">
            <ShareBar slices={SLICES} />
            <ShareLegend slices={SLICES} className="mt-4" />
          </ChartCard>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Card"
          rows={[
            { name: 'variant', type: "'flat' | 'raised' | 'dashed'", default: "'flat'", description: 'A thin border only, a border with a shadow, or a dashed empty slot.' },
            { name: 'radius', type: "'tile' | 'panel' | 'sheet'", default: "'panel'", description: '20, 22 or 26px.' },
            { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '0, 16, 20 or 24px.' },
            { name: 'interactive', type: 'boolean', default: 'false', description: 'On hover, darkens the border and background. No shadow is added.' },
            { name: '…rest', type: 'HTMLAttributes<HTMLDivElement>', description: 'Passed to the underlying <div>.' },
          ]}
        />
        <PropsTable
          title="ThumbnailCard"
          rows={[
            { name: 'thumbnail', type: 'ReactNode', description: 'The artwork, such as an <img> or a HeroPanel. Cropped to 17:6, with rounded top corners.' },
            { name: 'title', type: 'ReactNode', description: 'Cut off after two lines.' },
            { name: 'href', type: 'string', description: 'Turns the title and artwork into a link.' },
            { name: 'status', type: "'draft' | 'open' | 'closed'", description: 'Shows a StatusBadge above the title.' },
            { name: 'people', type: '{ person: string; label?: string }[]', description: 'Avatars that overlap the bottom edge of the artwork. Shows three, then +N for the rest.' },
            { name: 'meta', type: '{ label; value }[]', description: 'Two labelled facts along the bottom.' },
            { name: 'footer', type: 'ReactNode', description: 'The left side of the footer, usually a <Count>.' },
            { name: 'action', type: 'ReactNode', description: 'One action on the right side of the footer.' },
            { name: 'menu', type: 'ReactNode', description: 'Sits over the top-right corner of the artwork.' },
            { name: 'raised', type: 'boolean', default: 'false', description: 'Brings the card to the front while its menu is open, so the card below doesn’t cover the menu.' },
          ]}
        />
        <PropsTable
          title="ChartCard"
          rows={[
            { name: 'title', type: 'ReactNode', description: 'The question the chart answers.' },
            { name: 'meta', type: 'ReactNode', description: 'One small fact on the right, such as "128 responses".' },
            { name: 'children', type: 'ReactNode', description: 'The chart.' },
          ]}
        />
        <PropsTable
          title="HeroFigure · StatTile"
          rows={[
            { name: 'label', type: 'ReactNode', description: 'Uppercase label above the value.' },
            { name: 'value', type: 'ReactNode', description: 'HeroFigure uses the 52px pixel display typeface. StatTile uses 17px Geist.' },
            { name: 'sub', type: 'ReactNode', description: 'A muted note below the value.' },
          ]}
        />
        <PropsTable
          title="MetaItem · Count"
          rows={[
            { name: 'label', type: 'ReactNode', description: 'MetaItem: the muted line above the value. Pass the value as children.' },
            { name: 'value', type: 'ReactNode', description: 'Count: the number, at 19px with equal-width digits.' },
            { name: 'unit', type: 'ReactNode', description: 'Count: the muted word beside the number.' },
          ]}
        />
      </Section>
    </>
  )
}

const SLICES = [
  { id: 'a', label: 'A · One page', value: 38, color: optionColor(0) },
  { id: 'b', label: 'B · Two steps', value: 61, color: optionColor(1) },
  { id: 'c', label: 'C · Express pay', value: 29, color: optionColor(2) },
]

function CardMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    // The card doesn't hide its menu slot itself, so reveal it on the card's hover here.
    <div className={cn('transition-opacity', open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100')}>
      <Menu
        open={open}
        onOpenChange={onOpenChange}
        trigger={
          <IconButton label="More actions" variant="glass" size="md">
            <DotsThreeVertical size={16} weight="bold" />
          </IconButton>
        }
      >
        <MenuItem icon={<PencilSimple size={15} />}>Edit</MenuItem>
        <MenuItem icon={<ChartBar size={15} />}>Results</MenuItem>
        <MenuItem icon={<CopySimple size={15} />}>Duplicate</MenuItem>
        <MenuItem icon={<LinkSimple size={15} />}>Copy voter link</MenuItem>
        <MenuDivider />
        <MenuItem icon={<Trash size={15} />} tone="danger">
          Delete
        </MenuItem>
      </Menu>
    </div>
  )
}

function DashboardCard({
  thumb,
  title,
  status,
  people,
  meta,
  count,
  action,
}: {
  thumb: number
  title: string
  status: Status
  people: string[]
  meta: { label: string; value: string }[]
  count: number
  action: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <ThumbnailCard
      thumbnail={<Thumb n={thumb} />}
      title={title}
      status={status}
      people={people.map((person) => ({ person }))}
      meta={meta}
      footer={<Count value={count} unit={count === 1 ? 'response' : 'responses'} />}
      action={
        <Button variant="soft" size="sm">
          {action}
        </Button>
      }
      raised={open}
      menu={<CardMenu open={open} onOpenChange={setOpen} />}
    />
  )
}

function ThumbnailPlayground() {
  const [status, setStatus] = useState<Status | 'none'>('open')
  const [people, setPeople] = useState<'0' | '1' | '3' | '5'>('3')
  const [meta, setMeta] = useState(true)
  const [footer, setFooter] = useState(true)
  const [menu, setMenu] = useState(true)
  const [open, setOpen] = useState(false)
  const n = Number(people)

  const code = `<ThumbnailCard
  thumbnail={<img src="/thumbs/checkout.webp" alt="" className="h-full w-full object-cover" />}
  title="Checkout flow test"${status !== 'none' ? `\n  status="${status}"` : ''}${
    n ? `\n  people={[${PEOPLE.slice(0, n)
      .map((p) => `{ person: '${p}' }`)
      .join(', ')}]}` : ''
  }${meta ? `\n  meta={[{ label: 'Created', value: 'Sep 12' }, { label: 'Closes', value: 'Oct 3' }]}` : ''}${
    footer ? `\n  footer={<Count value={128} unit="responses" />}\n  action={<Button variant="soft" size="sm">Results</Button>}` : ''
  }${menu ? `\n  menu={<Menu trigger={<IconButton label="More actions" variant="glass" size="md">…</IconButton>}>…</Menu>}` : ''}
/>`

  return (
    <Demo
      code={code}
      controls={
        <>
          <KnobSegment label="status" value={status} options={['draft', 'open', 'closed', 'none'] as const} onChange={setStatus} />
          <KnobSegment label="people" value={people} options={['0', '1', '3', '5'] as const} onChange={setPeople} />
          <div>
            <KnobToggle label="meta" checked={meta} onChange={setMeta} />
            <KnobToggle label="footer + action" checked={footer} onChange={setFooter} />
            <KnobToggle label="menu" checked={menu} onChange={setMenu} />
          </div>
        </>
      }
    >
      <div className="w-full max-w-[300px]">
        <ThumbnailCard
          thumbnail={<Thumb n={1} />}
          title="Checkout flow test"
          status={status === 'none' ? undefined : status}
          people={PEOPLE.slice(0, n).map((person) => ({ person }))}
          meta={
            meta
              ? [
                  { label: 'Created', value: 'Sep 12' },
                  { label: 'Closes', value: 'Oct 3' },
                ]
              : undefined
          }
          footer={footer ? <Count value={128} unit="responses" /> : undefined}
          action={
            footer ? (
              <Button variant="soft" size="sm">
                Results
              </Button>
            ) : undefined
          }
          raised={open}
          menu={menu ? <CardMenu open={open} onOpenChange={setOpen} /> : undefined}
        />
      </div>
    </Demo>
  )
}
