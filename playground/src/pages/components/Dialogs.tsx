import { useEffect, useState } from 'react'
import { ChartBar, Copy, FilePlus, LinkSimple, Moon, PencilSimple, Trash, UsersThree } from 'lightweight-ui/icons'
import {
  Button,
  CommandMenu,
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  Kbd,
  Lightbox,
  modKey,
  Toggle,
  useToast,
  type CommandItem,
  type DialogSize,
} from 'lightweight-ui'
import { Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function Dialogs() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState<DialogSize>('md')
  const [divided, setDivided] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [light, setLight] = useState(false)
  const [results, setResults] = useState(true)
  const [palette, setPalette] = useState(false)
  const [mod, setMod] = useState('⌘')
  useEffect(() => setMod(modKey()), [])
  const say = (what: string) => () => toast(what)
  const commands: CommandItem[] = [
    { id: 'new', label: 'New form', group: 'Create', icon: <FilePlus size={16} />, keywords: ['add', 'create'], onSelect: say('New form') },
    { id: 'dup', label: 'Duplicate form', group: 'Create', icon: <Copy size={16} />, keywords: ['copy', 'clone'], onSelect: say('Duplicated') },
    { id: 'rename', label: 'Rename…', group: 'This form', icon: <PencilSimple size={16} />, hint: 'Checkout redesign', onSelect: say('Rename') },
    { id: 'results', label: 'See results', group: 'This form', icon: <ChartBar size={16} />, keywords: ['report', 'votes'], onSelect: say('Results') },
    { id: 'share', label: 'Share & access', group: 'This form', icon: <UsersThree size={16} />, keywords: ['invite', 'people', 'collaborators'], onSelect: say('Share') },
    { id: 'delete', label: 'Delete form', group: 'This form', icon: <Trash size={16} />, keywords: ['remove'], onSelect: say('Deleted') },
    { id: 'dark', label: 'Toggle dark mode', group: 'Preferences', icon: <Moon size={16} />, keywords: ['theme', 'night'], searchOnly: true, onSelect: say('Dark mode') },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Dialogs"
        description="A card that opens over the page and holds attention until you're done. It closes when you press Escape or click the blurred backdrop. While it's open, Tab stays inside it. When it closes, focus goes back to where it was. It renders in a portal, so a parent element's CSS transform can't trap it."
      />

      <Section id="dialog" title="Dialog" description="For a short, focused task, such as publishing a form. Build it from DialogHeader, DialogBody and DialogFooter.">
        <Demo
          code={`<Dialog open={open} onClose={close} size="${size}">
  <DialogHeader${divided ? ' divided' : ''} title="Publish form" description="A few details, then you get a link to share." />
  <DialogBody>…fields…</DialogBody>
  <DialogFooter note="Complete every page to publish.">
    <Button onClick={publish}>Publish form</Button>
  </DialogFooter>
</Dialog>`}
          controls={
            <>
              <KnobSegment label="size" value={size} options={['sm', 'md', 'lg', 'xl'] as const} onChange={setSize} />
              <KnobToggle label="header divided" checked={divided} onChange={setDivided} />
            </>
          }
        >
          <Button onClick={() => setOpen(true)}>Open dialog</Button>
        </Demo>
        <Dialog open={open} onClose={() => setOpen(false)} size={size}>
          <DialogHeader
            divided={divided}
            title="Publish form"
            description={divided ? undefined : 'A few details, then you get a link to share.'}
            actions={
              divided ? (
                <Button variant="link" leadingIcon={<LinkSimple size={16} />} onClick={() => toast('Link copied')}>
                  Copy link
                </Button>
              ) : undefined
            }
          />
          <DialogBody className="space-y-4">
            <Field subtle label="Form name">
              <Input defaultValue="Checkout redesign" />
            </Field>
            <div className="-mx-1">
              <Toggle checked={results} onChange={setResults} label="Let voters see results" />
            </div>
          </DialogBody>
          <DialogFooter note="Complete every page to publish.">
            <Button
              onClick={() => {
                setOpen(false)
                toast('Published. Link copied.')
              }}
            >
              Publish form
            </Button>
          </DialogFooter>
        </Dialog>
      </Section>

      <Section id="confirm" title="ConfirmDialog" description="Asks people to confirm before something that can't be undone. For a destructive action, focus starts on Cancel, so a stray Enter never deletes anything. Escape cancels. This is the one place a solid red button belongs.">
        <Demo
          code={`<ConfirmDialog
  open={asking}
  title="Delete this page?"
  body="Its 2 options and 1 input go with it. This can’t be undone."
  confirmLabel="Delete page"
  onConfirm={remove}
  onCancel={() => setAsking(false)}
/>`}
        >
          <Button variant="danger-outline" size="sm" onClick={() => setConfirm(true)}>
            Delete page
          </Button>
        </Demo>
        <ConfirmDialog
          open={confirm}
          title="Delete this page?"
          body="Its 2 options and 1 input go with it. This can’t be undone."
          confirmLabel="Delete page"
          onConfirm={() => {
            setConfirm(false)
            toast('Page deleted')
          }}
          onCancel={() => setConfirm(false)}
        />
      </Section>

      <Section id="lightbox" title="Lightbox" description="Shows an image or video across the whole window, uncropped. The backdrop is darker than a dialog's, so the media stands out. Clicking the media doesn't close it, so video controls and embeds keep working.">
        <Demo code={`<Lightbox open={open} onClose={close} caption="Option A" src="/option-a.png" alt="Checkout, option A" />`}>
          <button type="button" onClick={() => setLight(true)} className="cursor-zoom-in overflow-hidden rounded-2xl bg-ink/[0.03]">
            <img src="./thumbnails/ascii-3.webp" alt="Option A" className="h-40 w-auto" />
          </button>
        </Demo>
        <Lightbox open={light} onClose={() => setLight(false)} caption="Option A · Checkout" src="./thumbnails/ascii-3.webp" alt="Option A" />
      </Section>

      <Section
        id="command"
        title="Command menu"
        description="A searchable list of commands that opens from the keyboard. Press ⌘K on a Mac, or Ctrl+K elsewhere, to try the one on this site. It opens instantly, with no animation, because people use it many times a day and any delay gets in the way of typing. Results are grouped, capped and ranked: exact matches first, then matches at the start, at the start of a word, anywhere, and letters in order. Matched letters are highlighted."
      >
        <Demo
          code={`const items: CommandItem[] = [
  { id: 'new', label: 'New form', group: 'Create', icon: <FilePlus />, onSelect: create },
  { id: 'results', label: 'See results', group: 'This form', keywords: ['report'], onSelect: open },
  { id: 'dark', label: 'Toggle dark mode', group: 'Preferences', searchOnly: true, onSelect: toggle },
]

useHotkey('mod+k', () => setOpen((o) => !o))   // ⌘K on a Mac, Ctrl+K elsewhere

<CommandMenu open={open} onOpenChange={setOpen} items={items} placeholder="Type a command…" />`}
        >
          <Button variant="secondary" onClick={() => setPalette(true)} trailingIcon={<span className="flex gap-0.5"><Kbd>{mod}</Kbd><Kbd>K</Kbd></span>}>
            Open command menu
          </Button>
          <CommandMenu open={palette} onOpenChange={setPalette} items={commands} label="Commands" placeholder="Type a command or search…" />
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Dialog"
          rows={[
            { name: 'open / onClose', type: 'boolean / () => void', description: 'You control the open state.' },
            { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Width: 400, 460, 520 or 640px.' },
            { name: 'placement', type: "'top' | 'center'", default: "'top'", description: "'top' suits tall content that scrolls. 'center' suits short content." },
            { name: 'role', type: "'dialog' | 'alertdialog'", default: "'dialog'", description: '' },
            { name: 'initialFocus', type: 'RefObject<HTMLElement>', description: 'The element to focus when it opens. Defaults to the first focusable element.' },
          ]}
        />
        <PropsTable
          title="DialogHeader · DialogBody · DialogFooter"
          rows={[
            { name: 'DialogHeader.title / description', type: 'ReactNode', description: 'The title names the dialog for screen readers, through aria-labelledby.' },
            { name: 'DialogHeader.actions', type: 'ReactNode', description: 'Actions next to the close button, such as "Copy link".' },
            { name: 'DialogHeader.divided / hideClose', type: 'boolean', description: 'divided adds a thin line under the header. hideClose removes the close button.' },
            { name: 'DialogFooter.note', type: 'ReactNode', description: 'Text before the actions, such as why an action is unavailable.' },
            { name: 'DialogFooter.divided', type: 'boolean', default: 'true', description: '' },
          ]}
        />
        <PropsTable
          title="ConfirmDialog · Lightbox"
          rows={[
            { name: 'ConfirmDialog.title / body', type: 'ReactNode', description: '' },
            { name: 'ConfirmDialog.confirmLabel / cancelLabel', type: 'string', default: "'Delete' / 'Cancel'", description: '' },
            { name: 'ConfirmDialog.tone', type: "'danger' | 'default'", default: "'danger'", description: '' },
            { name: 'Lightbox.src / alt / caption', type: 'string / string / ReactNode', description: 'For an image. For a video or an embed, pass children instead.' },
          ]}
        />
        <PropsTable
          title="CommandMenu · useHotkey · Kbd"
          rows={[
            { name: 'open / onOpenChange', type: 'boolean / (open: boolean) => void', description: 'You control the open state.' },
            { name: 'items', type: 'CommandItem[]', description: '{ id, label, group?, hint?, icon?, keywords?, searchOnly?, onSelect }. searchOnly items appear only once someone types.' },
            { name: 'limit', type: 'number | Record<group, number>', default: '8', description: 'The most results to show per group while searching.' },
            { name: 'placeholder / label', type: 'string', default: "'Search…' / 'Search'", description: 'The search field’s placeholder, and the dialog’s name for screen readers.' },
            { name: 'onQueryChange', type: '(q: string) => void', description: 'Runs as the query changes, so you can load more items on demand, such as a full icon set.' },
            { name: 'useHotkey(combo, fn)', type: "'mod+k' | '/' | …", description: 'mod is ⌘ on a Mac and Ctrl elsewhere. Keys without a modifier are ignored while someone types in a field.' },
            { name: 'commandScore(label, query, keywords?)', type: 'number', description: 'The same ranking, for your own lists.' },
            { name: '<Kbd>', type: 'ReactNode', description: 'Shows a keyboard key. Use modKey() to show ⌘ or Ctrl for the current platform.' },
          ]}
        />
      </Section>
    </>
  )
}
