import { useRef, useState } from 'react'
import {
  ArrowsOut,
  CopySimple,
  DeviceMobile,
  DeviceTablet,
  FlagCheckered,
  Microphone,
  Monitor,
  PencilSimple,
  Plus,
  Sparkle,
  SquareSplitHorizontal,
  Star,
  TextAa,
  TextAlignLeft,
  Trash,
  UploadSimple,
} from 'lightweight-ui/icons'
import {
  AddRow,
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  ChoiceTile,
  cn,
  ConfirmDialog,
  HERO_GRADIENTS,
  HeroPanel,
  HoverHighlight,
  IconButton,
  InlineInput,
  InlineTextarea,
  LetterBadge,
  Lightbox,
  Logo,
  MediaActionButton,
  MediaActions,
  Nudge,
  PeerDots,
  personColor,
  personName,
  PillTabs,
  PresenceBar,
  PropertyGroup,
  PropertyPanel,
  RailAction,
  RailGroup,
  RailItem,
  Rating,
  ResizeHandle,
  SlidingSwitch,
  StatusBadge,
  SuccessMark,
  Swatch,
  Text,
  Textarea,
  Toggle,
  Toolbar,
  useToast,
  VoiceRecorder,
  type Peer,
} from 'lightweight-ui'
import { Demo, PageHeader, Section } from '../../ui/Demo'

const ME = 'sara.k@example.com'
const OMAR = 'omar.h@example.com'
const LENA = 'lena.m@example.com'

const thumb = (n: number) => `./thumbnails/ascii-${n}.webp`

/* ------------------------------------------------------------------ Model */

type PageType = 'feedback' | 'static'
type InputType = 'text' | 'rating' | 'voice'
type Device = 'desktop' | 'tablet' | 'mobile'

interface Option {
  id: string
  name: string
  description: string
  src: string | null
}

interface FormPage {
  id: string
  type: PageType
  title: string
  body: string
  options: Option[]
  neutralOn: boolean
  neutralLabel: string
  input: InputType
  question: string
  questionHint: string
  required: boolean
  allowHalf: boolean
}

const PAGE_META: Record<PageType, { label: string; hint: string; icon: (size: number) => React.ReactNode }> = {
  feedback: { label: 'Get Vote', hint: 'Voters compare options and answer your questions.', icon: (s) => <SquareSplitHorizontal size={s} aria-hidden="true" /> },
  static: { label: 'Set Context', hint: 'Give voters background before they choose, such as the metric you’re targeting, constraints or what ships today.', icon: (s) => <TextAlignLeft size={s} aria-hidden="true" /> },
}

const INPUTS: { value: InputType; label: string; icon: React.ReactNode }[] = [
  { value: 'text', label: 'Text', icon: <TextAa size={14} aria-hidden="true" /> },
  { value: 'rating', label: 'Rating', icon: <Star size={14} aria-hidden="true" /> },
  { value: 'voice', label: 'Voice', icon: <Microphone size={14} aria-hidden="true" /> },
]

const DEVICES = [
  { value: 'desktop' as const, label: 'Desktop', icon: <Monitor size={16} aria-hidden="true" /> },
  { value: 'tablet' as const, label: 'Tablet', icon: <DeviceTablet size={16} aria-hidden="true" /> },
  { value: 'mobile' as const, label: 'Mobile', icon: <DeviceMobile size={16} aria-hidden="true" /> },
]

/** Scaled to the demo: the canvas column here is ~500px, not a laptop. */
const DEVICE_WIDTH: Record<Device, string> = { desktop: '100%', tablet: '440px', mobile: '340px' }

const MAX_OPTIONS = 4
const LETTERS = 'ABCD'

function blankPage(id: string): FormPage {
  return {
    id,
    type: 'feedback',
    title: '',
    body: '',
    options: [],
    neutralOn: true,
    neutralLabel: '',
    input: 'rating',
    question: 'How would you rate this?',
    questionHint: '',
    required: false,
    allowHalf: false,
  }
}

const INITIAL_PAGES: FormPage[] = [
  {
    ...blankPage('p1'),
    title: 'Which checkout feels faster?',
    body: 'Both flows use the same cart and the same address. Pick the one you’d rather pay with.',
    options: [
      { id: 'o1', name: 'One-page checkout', description: 'Address, delivery and payment on one scroll.', src: thumb(2) },
      { id: 'o2', name: 'Two-step checkout', description: 'Address first, then delivery and payment.', src: thumb(4) },
    ],
  },
  {
    ...blankPage('p2'),
    type: 'static',
    title: 'What we’re measuring',
    body: 'Time from cart to paid, and how often people go back a step. Both versions ship behind the same flag.',
    options: [{ id: 'o3', name: '', description: '', src: thumb(5) }],
  },
  {
    ...blankPage('p3'),
    title: 'Which confirmation reads clearer?',
    options: [
      { id: 'o4', name: 'Order summary first', description: '', src: thumb(1) },
      { id: 'o5', name: 'Delivery date first', description: '', src: null },
    ],
    input: 'text',
    question: 'Anything we missed?',
    required: true,
  },
]

const pageLabel = (p: FormPage) => p.title.trim() || PAGE_META[p.type].label
const pageReady = (p: FormPage) =>
  Boolean(p.title.trim()) && (p.type === 'static' || (p.options.length >= 2 && p.options.every((o) => o.src && o.name.trim())))
const neutralDefault = (n: number) => (n === 2 ? 'Both feel equal' : 'They all feel equal')

/* ------------------------------------------------------------------- Page */

export default function Builder() {
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Builder"
        description="The three-column editor. On the left are the screens, in the order voters see them. In the middle is the selected screen on a canvas, and on the right are that screen’s settings. You edit text directly on the canvas, so there’s no separate column of form fields."
      />

      <Section
        id="editor"
        title="Rail, canvas, properties"
        description="Select a screen in the rail to open it on the canvas and in the settings panel. Edit a title in place and its rail label updates as you type. Drag the rail’s edge to resize it, and hover a page row to duplicate or delete it."
      >
        <Demo stage="none" code={BUILDER_CODE}>
          <div className="overflow-x-auto">
            <BuilderScreen />
          </div>
        </Demo>
        <Notes
          items={[
            'The pages you add sit in a RailGroup between the two fixed screens, Introduction and End screen. Only the part that changes length gets a container around it.',
            'A row’s icon turns green once its screen is ready to publish, so the rail also works as a checklist. Coloured dots show which screen each collaborator is on.',
            'The canvas shows only the selected screen. You move between screens with the rail, not by scrolling. The device switch narrows the canvas and leaves the rest of the editor as it is.',
            'Every field on the canvas is an InlineInput or InlineTextarea. It looks like the text it edits and shows a soft highlight on focus, so what you type is what voters see.',
            'Page type and input type are the same kind of choice, so both use a grid of ChoiceTiles instead of two different controls.',
            'Once a page is complete, a Nudge rises from the bottom of the canvas to suggest the next step. It’s sticky, not fixed, so it stays inside the canvas column rather than the window.',
          ]}
        />
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

function BuilderScreen() {
  const toast = useToast()
  const [pages, setPages] = useState(INITIAL_PAGES)
  const [screen, setScreen] = useState<string>('p1')
  const [welcome, setWelcome] = useState({
    title: 'Which checkout feels faster?',
    body: 'We rebuilt checkout two ways. Look at both, pick the one you’d rather pay with, and tell us how it felt.',
    hero: 'g-violet',
    showTime: true,
  })
  const [end, setEnd] = useState({ headline: 'Thanks — your feedback’s in.', message: '', showResults: true })
  const [rail, setRail] = useState(200)
  const [device, setDevice] = useState<Device>('desktop')
  const [published, setPublished] = useState(false)
  const [confirming, setConfirming] = useState<FormPage | null>(null)
  const [dismissed, setDismissed] = useState<string[]>([])
  const [zoom, setZoom] = useState<Option | null>(null)
  const [preview, setPreview] = useState(0)
  const nextId = useRef(10)
  const newId = (prefix: string) => `${prefix}${++nextId.current}`

  const page = pages.find((p) => p.id === screen) ?? null
  const pageIndex = page ? pages.indexOf(page) : -1

  // Where the collaborators are — the rail marks the screens you're not looking at.
  const whereIs: Record<string, string> = { [OMAR]: 'p1', [LENA]: 'welcome' }
  const omarOn = pages.find((p) => p.id === whereIs[OMAR])
  const peers: Peer[] = [
    { person: ME, self: true, owner: true },
    { person: OMAR, where: omarOn ? `on ${pageLabel(omarOn)}` : undefined },
    { person: LENA, where: 'on Introduction' },
  ]
  const dots = (id: string) => Object.entries(whereIs).filter(([, s]) => s === id).map(([person]) => personColor(person))

  function patchPage(id: string, patch: Partial<FormPage>) {
    setPages((all) => all.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  function patchOption(pageId: string, optionId: string, patch: Partial<Option>) {
    setPages((all) =>
      all.map((p) => (p.id === pageId ? { ...p, options: p.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)) } : p)),
    )
  }

  function addPage() {
    const id = newId('p')
    setPages((all) => [...all, blankPage(id)])
    setScreen(id)
  }
  function duplicatePage(p: FormPage) {
    const id = newId('p')
    const copy: FormPage = { ...p, id, title: p.title ? `${p.title} (copy)` : '', options: p.options.map((o) => ({ ...o, id: newId('o') })) }
    setPages((all) => {
      const at = all.findIndex((x) => x.id === p.id)
      return [...all.slice(0, at + 1), copy, ...all.slice(at + 1)]
    })
    setScreen(id)
  }
  function deletePage(p: FormPage) {
    const at = pages.findIndex((x) => x.id === p.id)
    const rest = pages.filter((x) => x.id !== p.id)
    setPages(rest)
    if (screen === p.id) setScreen(rest[Math.min(at, rest.length - 1)]?.id ?? 'welcome')
    toast(`Deleted “${pageLabel(p)}”`)
  }
  function reorder(from: number, to: number) {
    setPages((all) => {
      const next = [...all]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }
  function publish() {
    setPublished(true)
    toast('Published — the voter link is ready')
  }

  const screenLabel =
    screen === 'welcome' ? 'Introduction' : screen === 'end' ? 'End screen' : page ? `${PAGE_META[page.type].label} · Page ${pageIndex + 1}` : ''
  const showNudge = page && page.type === 'feedback' && pageReady(page) && !published && !dismissed.includes(page.id)

  return (
    <div className="@container/builder flex h-[700px] min-w-[1000px] flex-col bg-bg">
      <Toolbar
        sticky={false}
        start={
          <>
            <Logo name={null} />
            <Breadcrumb items={[{ label: 'Forms', href: '#/dashboard' }, { label: 'Checkout redesign' }]} />
            <StatusBadge status={published ? 'open' : 'draft'} />
          </>
        }
        center={
          <PillTabs
            label="Form views"
            value="edit"
            items={[
              { value: 'edit', label: 'Editor' },
              { value: 'preview', label: 'Preview', href: '#/voting' },
              // Nothing to read on a draft — the tab is there, but shut.
              published ? { value: 'results', label: 'Results', href: '#/results' } : { value: 'results', label: 'Results', disabled: true },
            ]}
          />
        }
        end={
          <>
            {/* A passive note, so it reads before the actions — and it's the first thing to go when the bar is short. */}
            <span className="hidden text-muted @min-[1240px]/builder:inline">All changes autosaved</span>
            <SlidingSwitch iconOnly label="Preview device" items={DEVICES} value={device} onChange={setDevice} />
            {/* A click jumps to that person's screen. (Persistent following — and the
                "Following Omar" chip it adds — is on the Results pattern; at this
                width the chip would run into the centred tabs.) */}
            <PresenceBar
              peers={peers}
              onFollow={(person) => {
                const target = whereIs[person]
                if (target === 'welcome' || target === 'end' || pages.some((p) => p.id === target)) {
                  setScreen(target)
                  toast(`Jumped to ${personName(person)}’s screen`)
                }
              }}
            />
            <Button size="md" onClick={published ? () => toast('No changes to publish') : publish}>
              {published ? 'Published' : 'Publish'}
            </Button>
          </>
        }
      />

      <div className="relative grid min-h-0 flex-1" style={{ gridTemplateColumns: `${rail}px minmax(0, 1fr) 272px` }}>
        <ResizeHandle width={rail} onResize={setRail} min={176} max={300} defaultWidth={200} side="left" label="Resize page list" />

        {/* ------------------------------------------------------------ Rail */}
        <div className="flex min-h-0 flex-col border-e border-line p-2">
          <HoverHighlight className="flex min-h-0 flex-1 flex-col gap-2">
            <RailItem
              icon={<Sparkle size={13} aria-hidden="true" />}
              label="Introduction"
              active={screen === 'welcome'}
              done={Boolean(welcome.title.trim() && welcome.body.trim())}
              onClick={() => setScreen('welcome')}
              trailing={<PeerDots colors={dots('welcome')} />}
            />
            <RailGroup footer={<AddRow icon={<Plus size={13} aria-hidden="true" />} onClick={addPage}>Add page</AddRow>}>
              {pages.map((p, i) => (
                <RailItem
                  key={p.id}
                  variant="raised"
                  icon={PAGE_META[p.type].icon(13)}
                  label={pageLabel(p)}
                  active={screen === p.id}
                  done={pageReady(p)}
                  onClick={() => setScreen(p.id)}
                  trailing={<PeerDots colors={dots(p.id)} />}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
                  onDrop={(e) => {
                    e.preventDefault()
                    const from = Number(e.dataTransfer.getData('text/plain'))
                    if (!Number.isNaN(from) && from !== i) reorder(from, i)
                  }}
                  actions={
                    <>
                      <RailAction label="Duplicate" onClick={() => duplicatePage(p)}>
                        <CopySimple size={13} aria-hidden="true" />
                      </RailAction>
                      <RailAction label="Delete" tone="danger" disabled={pages.length === 1} onClick={() => setConfirming(p)}>
                        <Trash size={13} aria-hidden="true" />
                      </RailAction>
                    </>
                  }
                />
              ))}
            </RailGroup>
            <RailItem
              icon={<FlagCheckered size={13} aria-hidden="true" />}
              label="End screen"
              active={screen === 'end'}
              done
              onClick={() => setScreen('end')}
            />
          </HoverHighlight>
        </div>

        {/* ---------------------------------------------------------- Canvas */}
        <section className="min-h-0 overflow-y-auto bg-ink/[0.015] px-6 py-6">
          <div className="mx-auto w-full transition-[max-width] duration-300" style={{ maxWidth: DEVICE_WIDTH[device] }}>
            <div className="mb-3 flex items-center justify-between gap-3 px-1 text-label">
              <span className="truncate font-medium text-muted">{screenLabel}</span>
              <span className="flex-none text-muted @min-[1240px]/builder:hidden">All changes autosaved</span>
            </div>

            <div key={screen} className="u-view @container rounded-canvas border border-line bg-card px-6 pb-8 pt-12 shadow-card">
              {screen === 'welcome' && (
                <div className="space-y-2">
                  <InlineTextarea
                    value={welcome.title}
                    onChange={(title) => setWelcome((w) => ({ ...w, title }))}
                    placeholder="What are you testing?"
                    aria-label="Introduction title"
                    className="px-2 py-1 font-pixel text-3xl font-medium leading-tight tracking-tight"
                  />
                  <InlineTextarea
                    value={welcome.body}
                    onChange={(body) => setWelcome((w) => ({ ...w, body }))}
                    placeholder="Explain what voters are comparing and why"
                    aria-label="Introduction context"
                    className="px-2 py-1 text-body leading-relaxed text-muted"
                  />
                  <div className="px-2 pt-4">
                    <HeroPanel bg={welcome.hero} src={thumb(1)} alt="Welcome screen artwork" padding={28} className="h-[220px] rounded-2xl" />
                  </div>
                </div>
              )}

              {screen === 'end' && (
                <div className="flex flex-col items-center py-6 text-center">
                  <SuccessMark size={56} />
                  <InlineTextarea
                    value={end.headline}
                    onChange={(headline) => setEnd((e) => ({ ...e, headline }))}
                    placeholder="Thanks for your feedback"
                    aria-label="End screen headline"
                    className="mt-6 px-2 py-1 text-center font-pixel text-2xl font-medium tracking-tight"
                  />
                  <InlineTextarea
                    value={end.message}
                    onChange={(message) => setEnd((e) => ({ ...e, message }))}
                    placeholder="Add a closing message (optional)"
                    aria-label="End screen message"
                    className="px-2 py-1 text-center text-body leading-relaxed text-muted"
                  />
                  {end.showResults && (
                    <Text size="label" tone="muted" className="mt-6 rounded-full bg-ink/[0.04] px-3 py-1">
                      Voters see live results below this
                    </Text>
                  )}
                </div>
              )}

              {page && (
                <PageCanvas
                  page={page}
                  preview={preview}
                  onPreview={setPreview}
                  onChange={(patch) => patchPage(page.id, patch)}
                  onOption={(optionId, patch) => patchOption(page.id, optionId, patch)}
                  onAddOption={() =>
                    patchPage(page.id, {
                      options: [...page.options, { id: newId('o'), name: '', description: '', src: thumb(((page.options.length + 2) % 5) + 1) }],
                    })
                  }
                  onDeleteOption={(optionId) => patchPage(page.id, { options: page.options.filter((o) => o.id !== optionId) })}
                  onZoom={setZoom}
                  onEditMedia={() => toast('Opening the media editor')}
                />
              )}
            </div>

            {showNudge && (
              <Nudge
                sticky
                title="Page ready"
                body="Add another comparison or publish."
                cta="Publish"
                onAct={publish}
                onDismiss={() => setDismissed((d) => [...d, page.id])}
              />
            )}
          </div>
        </section>

        {/* ------------------------------------------------------ Properties */}
        <PropertyPanel as="div" className="min-h-0 overflow-y-auto border-s border-line">
          {screen === 'welcome' && (
            <>
              <PropertyGroup title="Introduction">
                <div className="-mx-1">
                  <Toggle
                    checked={welcome.showTime}
                    onChange={(showTime) => setWelcome((w) => ({ ...w, showTime }))}
                    label="Show time to complete"
                    hint="Shows “Takes about 2 minutes” under the Start button."
                  />
                </div>
              </PropertyGroup>
              <PropertyGroup title="Media backdrop">
                <div className="flex flex-wrap gap-2">
                  {HERO_GRADIENTS.slice(0, 7).map((g) => (
                    <Swatch
                      key={g.value}
                      background={g.css}
                      label={g.label}
                      size={28}
                      selected={welcome.hero === g.value}
                      onClick={() => setWelcome((w) => ({ ...w, hero: g.value }))}
                    />
                  ))}
                </div>
              </PropertyGroup>
            </>
          )}

          {screen === 'end' && (
            <PropertyGroup title="After submitting">
              <div className="-mx-1">
                <Toggle
                  checked={end.showResults}
                  onChange={(showResults) => setEnd((e) => ({ ...e, showResults }))}
                  label="Let voters see results"
                  hint="Voters see the live results on this screen after they submit."
                />
              </div>
            </PropertyGroup>
          )}

          {page && (
            <>
              <PropertyGroup title="Page type">
                <div className="grid grid-cols-2 gap-1.5">
                  {(['feedback', 'static'] as const).map((t) => (
                    <ChoiceTile
                      key={t}
                      icon={PAGE_META[t].icon(14)}
                      label={PAGE_META[t].label}
                      selected={page.type === t}
                      onClick={() => patchPage(page.id, { type: t })}
                    />
                  ))}
                </div>
                <Text size="label" tone="muted" relaxed>
                  {PAGE_META[page.type].hint}
                </Text>
              </PropertyGroup>

              {page.type === 'feedback' && (
                <PropertyGroup title="Feedback inputs">
                  <div className="grid grid-cols-3 gap-1.5">
                    {INPUTS.map((t) => (
                      <ChoiceTile
                        key={t.value}
                        icon={t.icon}
                        label={t.label}
                        selected={page.input === t.value}
                        onClick={() => patchPage(page.id, { input: t.value })}
                      />
                    ))}
                  </div>
                  <div className="-mx-1">
                    <Toggle
                      checked={page.required}
                      onChange={(required) => patchPage(page.id, { required })}
                      label="Required"
                      hint="Voters must answer before submitting."
                    />
                    {page.input === 'rating' && (
                      <Toggle
                        checked={page.allowHalf}
                        onChange={(allowHalf) => {
                          patchPage(page.id, { allowHalf })
                          if (!allowHalf) setPreview((v) => Math.ceil(v))
                        }}
                        label="Allow half stars"
                        hint="Voters can give half-star ratings, like 3.5."
                      />
                    )}
                  </div>
                </PropertyGroup>
              )}

              <PropertyGroup>
                <Button
                  variant="danger-outline"
                  size="sm"
                  leadingIcon={<Trash size={14} aria-hidden="true" />}
                  disabled={pages.length === 1}
                  onClick={() => setConfirming(page)}
                >
                  Delete page
                </Button>
                {pages.length === 1 && (
                  <Text size="label" tone="muted" relaxed>
                    A form needs at least one page. Add another page to delete this one.
                  </Text>
                )}
              </PropertyGroup>
            </>
          )}
        </PropertyPanel>
      </div>

      <ConfirmDialog
        open={confirming !== null}
        title={confirming ? `Delete “${pageLabel(confirming)}”?` : ''}
        body={confirming ? deleteSummary(confirming) : undefined}
        confirmLabel="Delete page"
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          if (confirming) deletePage(confirming)
          setConfirming(null)
        }}
      />
      <Lightbox open={zoom !== null} onClose={() => setZoom(null)} src={zoom?.src ?? ''} alt={zoom?.name || 'Media'} caption={zoom?.name || 'Media'} />
    </div>
  )
}

/** Name what goes with the page, so the confirmation is worth reading. */
function deleteSummary(p: FormPage): string {
  const parts: string[] = []
  const noun = p.type === 'feedback' ? 'option' : 'media item'
  if (p.options.length) parts.push(`${p.options.length} ${p.options.length === 1 ? noun : `${noun}s`}`)
  if (p.type === 'feedback') parts.push('1 feedback input')
  if (!parts.length) return 'This can’t be undone.'
  return `Its ${parts.join(' and ')} will be deleted too. This can’t be undone.`
}

/* ------------------------------------------------------------ Page canvas */

function PageCanvas({
  page,
  preview,
  onPreview,
  onChange,
  onOption,
  onAddOption,
  onDeleteOption,
  onZoom,
  onEditMedia,
}: {
  page: FormPage
  preview: number
  onPreview: (v: number) => void
  onChange: (patch: Partial<FormPage>) => void
  onOption: (optionId: string, patch: Partial<Option>) => void
  onAddOption: () => void
  onDeleteOption: (optionId: string) => void
  onZoom: (o: Option) => void
  onEditMedia: () => void
}) {
  const feedback = page.type === 'feedback'
  const neutral = page.neutralLabel.trim() || neutralDefault(page.options.length)

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <InlineTextarea
          value={page.title}
          onChange={(title) => onChange({ title })}
          placeholder={feedback ? 'What are you comparing?' : 'What should voters know first?'}
          aria-label="Page title"
          className="px-2 py-1 font-pixel text-2xl font-medium tracking-tight"
        />
        <InlineTextarea
          value={page.body}
          onChange={(body) => onChange({ body })}
          placeholder="Add details for this page (optional)"
          aria-label="Page context"
          className="px-2 py-1 text-body leading-relaxed text-muted"
        />
      </div>

      <section>
        <p className="mb-3 px-1 text-label font-medium text-muted">
          {feedback ? `Options to compare · ${page.options.length}/${MAX_OPTIONS}` : `Media · ${page.options.length}`}
        </p>
        <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2">
          {page.options.map((o, i) => (
            <div key={o.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-line-strong">
              {feedback && (
                <div className="flex items-start gap-2 border-b border-line px-3 py-2.5">
                  <LetterBadge letter={LETTERS[i]} className="mt-1" />
                  <div className="min-w-0 flex-1">
                    <InlineInput
                      value={o.name}
                      onChange={(name) => onOption(o.id, { name })}
                      placeholder="Option name"
                      aria-label={`Option ${LETTERS[i]} name`}
                      className="px-1.5 py-0.5 text-body font-semibold tracking-tight"
                    />
                    <InlineInput
                      value={o.description}
                      onChange={(description) => onOption(o.id, { description })}
                      placeholder="One line on what’s different"
                      aria-label={`Option ${LETTERS[i]} description`}
                      className="px-1.5 py-0.5 text-label leading-relaxed text-muted"
                    />
                  </div>
                  <IconButton
                    label="Delete option"
                    size="xs"
                    shape="square"
                    className="mt-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => onDeleteOption(o.id)}
                  >
                    <Trash size={13} aria-hidden="true" />
                  </IconButton>
                </div>
              )}
              {o.src ? (
                <MediaActions
                  className="flex-1"
                  actions={
                    <>
                      <MediaActionButton label="Expand" onClick={() => onZoom(o)}>
                        <ArrowsOut size={16} aria-hidden="true" />
                      </MediaActionButton>
                      <MediaActionButton label="Edit" onClick={onEditMedia}>
                        <PencilSimple size={16} aria-hidden="true" />
                      </MediaActionButton>
                      <MediaActionButton label="Delete" onClick={() => (feedback ? onOption(o.id, { src: null }) : onDeleteOption(o.id))}>
                        <Trash size={16} aria-hidden="true" />
                      </MediaActionButton>
                    </>
                  }
                >
                  <div className="flex min-h-40 w-full items-center justify-center bg-ink/[0.015] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.src} alt="" className="max-h-[180px] max-w-full rounded-lg" />
                  </div>
                </MediaActions>
              ) : (
                <button
                  type="button"
                  onClick={() => onOption(o.id, { src: thumb(3) })}
                  className="flex min-h-40 w-full flex-1 flex-col items-center justify-center gap-1.5 bg-ink/[0.015] text-label font-medium text-muted transition-colors hover:text-ink"
                >
                  <UploadSimple size={18} aria-hidden="true" />
                  Upload media
                </button>
              )}
            </div>
          ))}
          {page.options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={onAddOption}
              className={cn(
                'u-press flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong text-ui font-medium text-muted transition-colors hover:border-ink hover:text-ink',
                page.options.length === 0 ? 'min-h-[140px]' : 'min-h-[220px]',
              )}
            >
              <Plus size={18} aria-hidden="true" />
              <span className="mt-1.5">{feedback ? 'Add option' : 'Add media'}</span>
            </button>
          )}
        </div>

        {/* The neutral answer: its wording is editable in place, so the row isn't a <label> — the checkbox and the status text toggle it. */}
        {feedback && page.options.length >= 2 && (
          <div
            className={cn(
              'mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition',
              page.neutralOn ? 'border-line bg-card text-ink' : 'border-dashed border-line-strong bg-ink/[0.015] text-muted',
            )}
          >
            <Checkbox
              checked={page.neutralOn}
              onChange={(e) => onChange({ neutralOn: e.target.checked })}
              aria-label={`Offer “${neutral}” to voters`}
            />
            <InlineInput
              value={page.neutralLabel}
              onChange={(neutralLabel) => onChange({ neutralLabel })}
              placeholder={neutralDefault(page.options.length)}
              aria-label="Neutral answer wording"
              // u-placeholder-strong alone loses to InlineInput's own placeholder utility (it lives in
              // @layer components), so the same colour is restated as an !important utility.
              className="u-placeholder-strong min-w-0 flex-1 px-1.5 py-0.5 text-ui font-medium placeholder:text-ink/70!"
            />
            <button
              type="button"
              onClick={() => onChange({ neutralOn: !page.neutralOn })}
              className="flex-none text-caption text-muted transition-colors hover:text-ink"
            >
              {page.neutralOn ? 'Visible to voters' : 'Hidden from voters'}
            </button>
          </div>
        )}
      </section>

      {feedback && (
        <section className="rounded-2xl border border-line p-4 transition-colors hover:border-line-strong">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <InlineTextarea
                value={page.question}
                onChange={(question) => onChange({ question })}
                placeholder="What do you want to ask?"
                aria-label="Question"
                className="px-2 py-1 text-title font-semibold tracking-tight"
              />
              <InlineInput
                value={page.questionHint}
                onChange={(questionHint) => onChange({ questionHint })}
                placeholder="Add a hint (optional)"
                aria-label="Question description"
                className="mt-0.5 px-2 py-1 text-label leading-relaxed text-muted"
              />
            </div>
            {page.required && (
              <Badge size="sm" tone="outline" className="mt-1.5">
                Required
              </Badge>
            )}
          </div>
          <div className="mt-3 px-2">
            {page.input === 'rating' && <Rating value={preview} onChange={onPreview} allowHalf={page.allowHalf} />}
            {page.input === 'text' && (
              <div className="pointer-events-none">
                <Textarea placeholder="Share your thoughts…" rows={3} readOnly tabIndex={-1} aria-hidden="true" />
              </div>
            )}
            {page.input === 'voice' && (
              <div className="pointer-events-none">
                <VoiceRecorder value="" onChange={() => {}} disabled />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------- Code */

const BUILDER_CODE = `<Toolbar
  start={<><Logo name={null} /><Breadcrumb items={[{ label: 'Forms', href }, { label: 'Checkout redesign' }]} /><StatusBadge status="draft" /></>}
  center={<PillTabs items={[{ value: 'edit', label: 'Editor' }, { value: 'preview', label: 'Preview', href }, { value: 'results', label: 'Results', disabled: true }]} value="edit" />}
  end={
    <>
      <span className="text-muted">All changes autosaved</span>
      <SlidingSwitch iconOnly items={[{ value: 'desktop', label: 'Desktop', icon: <Monitor /> }, …]} value={device} onChange={setDevice} />
      <PresenceBar peers={peers} onFollow={jumpToTheirScreen} />
      <Button size="md">Publish</Button>
    </>
  }
/>

<div className="relative grid" style={{ gridTemplateColumns: \`\${rail}px 1fr 272px\` }}>
  <ResizeHandle width={rail} onResize={setRail} min={176} max={300} defaultWidth={200} side="left" />

  <aside className="border-r border-line p-2">
    <HoverHighlight className="flex flex-col gap-2">
      <RailItem icon={<Sparkle />} label="Introduction" done active={screen === 'welcome'} onClick={…} />
      <RailGroup footer={<AddRow icon={<Plus />} onClick={addPage}>Add page</AddRow>}>
        {pages.map((p) => (
          <RailItem
            variant="raised" icon={<SquareSplitHorizontal />} label={p.title} done={ready(p)}
            active={screen === p.id} onClick={() => setScreen(p.id)}
            trailing={<PeerDots colors={colorsOfPeopleHere} />}
            actions={<>
              <RailAction label="Duplicate"><CopySimple /></RailAction>
              <RailAction label="Delete" tone="danger" onClick={() => setConfirming(p)}><Trash /></RailAction>
            </>}
          />
        ))}
      </RailGroup>
      <RailItem icon={<FlagCheckered />} label="End screen" … />
    </HoverHighlight>
  </aside>

  <section className="overflow-y-auto bg-ink/[0.015] px-6 py-6">
    <div className="rounded-canvas border border-line bg-card px-6 pb-8 pt-12 shadow-card">
      <InlineTextarea value={title} onChange={setTitle} className="font-pixel text-2xl font-medium" />
      <InlineTextarea value={body} onChange={setBody} className="text-body text-muted" />
      <p className="text-label text-muted">Options to compare · 2/4</p>
      {options.map((o, i) => (
        <div className="rounded-2xl border border-line">
          <LetterBadge letter={'AB'[i]} />
          <InlineInput value={o.name} … /> <InlineInput value={o.description} … />
          <MediaActions actions={<>
            <MediaActionButton label="Expand"><ArrowsOut /></MediaActionButton>
            <MediaActionButton label="Edit"><PencilSimple /></MediaActionButton>
            <MediaActionButton label="Delete"><Trash /></MediaActionButton>
          </>}>
            <img src={o.src} alt="" />
          </MediaActions>
        </div>
      ))}
      <div className="rounded-2xl border px-4 py-3.5">
        <Checkbox checked={neutralOn} onChange={…} aria-label="Offer “Both feel equal”" />
        <InlineInput value={neutralLabel} placeholder="Both feel equal" className="u-placeholder-strong" />
      </div>
      <div className="rounded-2xl border p-4">
        <InlineTextarea value={question} … />
        <Rating value={0} onChange={…} allowHalf={allowHalf} />
      </div>
    </div>
    <Nudge sticky title="Page ready" body="Add another comparison or publish." cta="Publish" onAct={publish} onDismiss={dismiss} />
  </section>

  <PropertyPanel className="border-l border-line">
    <PropertyGroup title="Page type">
      <div className="grid grid-cols-2 gap-1.5">
        <ChoiceTile icon={<SquareSplitHorizontal />} label="Get Vote" selected />
        <ChoiceTile icon={<TextAlignLeft />} label="Set Context" />
      </div>
    </PropertyGroup>
    <PropertyGroup title="Feedback inputs">
      <div className="grid grid-cols-3 gap-1.5">{/* Text · Rating · Voice ChoiceTiles */}</div>
      <Toggle label="Required" hint="Voters must answer before submitting." checked={required} onChange={setRequired} />
      <Toggle label="Allow half stars" checked={allowHalf} onChange={setAllowHalf} />
    </PropertyGroup>
    <PropertyGroup>
      <Button variant="danger-outline" size="sm" leadingIcon={<Trash />}>Delete page</Button>
    </PropertyGroup>
  </PropertyPanel>
</div>

<ConfirmDialog open={…} title="Delete “Which checkout feels faster?”" body="Its 2 options and 1 feedback input go with it. This can’t be undone." confirmLabel="Delete page" … />`
