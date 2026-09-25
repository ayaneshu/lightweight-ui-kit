import { useRef, useState } from 'react'
import { Check, LinkSimple, Plus, Trash, UserPlus, X } from 'lightweight-ui/icons'
import {
  Avatar,
  Breadcrumb,
  Button,
  ConfirmDialog,
  CopyField,
  DatePicker,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Field,
  FieldError,
  Heading,
  IconButton,
  Input,
  Logo,
  personName,
  PresenceBar,
  PropertyGroup,
  PropertyPanel,
  Select,
  StatusBadge,
  Text,
  toDayString,
  Toggle,
  Toolbar,
  useToast,
  type Peer,
  type Status,
} from 'lightweight-ui'
import { Demo, PageHeader, Section } from '../../ui/Demo'

const ME = 'sara.k@example.com'
const OMAR = 'omar.h@example.com'
const LENA = 'lena.m@example.com'

const PODS = ['Checkout', 'Customer', 'Delivery', 'Growth', 'Loyalty', 'Reviews', 'Sales', 'Storefront']
const VOTER_LINK = 'https://forms.example.com/f/checkout-redesign'
const PEERS: Peer[] = [
  { person: ME, self: true, owner: true },
  { person: OMAR, where: 'on Which checkout feels faster?' },
]

type Role = 'edit' | 'view'

/* ------------------------------------------------------------------- Page */

export default function Publish() {
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Publish & share"
        description="Two dialogs that open over the builder. One publishes the form to voters, and the other controls who else can work on it. Both open from the builder’s toolbar. Use the buttons in the toolbars below to try them."
      />

      <Section
        id="publish"
        title="Publish"
        description="Publishing asks for a few details: a name your team will recognise, the pod the form belongs to, and when it stops taking responses. They’re asked for at the last moment, when they’re easiest to answer, because they describe the release rather than the content."
      >
        <Demo stage="none" code={PUBLISH_CODE}>
          <PublishDemo />
        </Demo>
        <Notes
          items={[
            'No errors show when the dialog first opens. They appear only after you try to publish, each under the field it belongs to.',
            'Fields use `subtle` labels, which are 13px and muted. In a dialog that’s all fields, bold labels would compete with the values.',
            'Pod and expiry date are both short answers, so they share a row and the dialog fits on one screen.',
            'The button shows where you are: Publish form before the first publish, then Published — up to date, then Publish changes as soon as anything differs from the live version. Pressing it with nothing to publish shows a message saying so.',
            'The voter link appears after the first publish. Before that, there’s nothing live to link to.',
          ]}
        />
      </Section>

      <Section
        id="share"
        title="Share & access"
        description="Controls who can work on the form. The dialog is wider (xl) because each row holds an avatar, a name, an email address, an access level and a remove button."
      >
        <Demo stage="none" code={SHARE_CODE}>
          <ShareDemo />
        </Demo>
        <Notes
          items={[
            'A thin line divides the header from the body, because the body is its own section: an invite row, then a list. Copy link sits next to the close button as a header action.',
            'Inviting takes one row: email, access level and Invite. Pressing Enter sends the invite. If an email is invalid or already has access, the reason appears under the row.',
            'The owner’s row has no controls. This dialog can’t change ownership, so the row just says “Owner” instead of showing a select that does nothing.',
          ]}
        />
      </Section>

      <Section
        id="confirm"
        title="Confirm before deleting"
        description="A short pause before an action that can’t be undone. The title names what you’re deleting and the body says what goes with it. Focus starts on Cancel, so a stray Enter never deletes anything. Escape cancels."
      >
        <Demo stage="none" code={CONFIRM_CODE}>
          <ConfirmDemo />
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

/* ------------------------------------------------------------ Editor frame */

/** The builder's toolbar over a quiet canvas — the context both dialogs open from. */
function EditorFrame({ status, end, caption, trail = 'Breadcrumb' }: { status: Status; end: React.ReactNode; caption: React.ReactNode; trail?: string }) {
  return (
    <div className="bg-bg">
      <Toolbar
        sticky={false}
        start={
          <>
            <Logo name={null} />
            <Breadcrumb label={trail} items={[{ label: 'Forms', href: '#/dashboard' }, { label: 'Checkout redesign' }]} />
            <StatusBadge status={status} />
          </>
        }
        end={end}
      />
      <div className="flex flex-col items-center bg-ink/[0.015] px-6 py-10">
        <div className="w-full max-w-[440px] rounded-canvas border border-line bg-card px-7 py-9 shadow-card">
          <Heading size="display-sm" level={3}>
            Which checkout feels faster?
          </Heading>
          <Text size="body" tone="muted" relaxed className="mt-2">
            Both flows use the same cart. Pick the one you’d rather pay with.
          </Text>
          <div className="mt-6 grid grid-cols-2 gap-3" aria-hidden="true">
            <div className="h-20 rounded-2xl border border-line bg-ink/[0.02]" />
            <div className="h-20 rounded-2xl border border-line bg-ink/[0.02]" />
          </div>
        </div>
        <Text size="label" tone="muted" className="mt-4">
          {caption}
        </Text>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Publish */

function PublishDemo() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [pod, setPod] = useState('')
  const [expiry, setExpiry] = useState('')
  const [showResults, setShowResults] = useState(true)
  const [attempted, setAttempted] = useState(false)
  /** What's live, as a snapshot — so "changes since publishing" is a comparison, not a flag. */
  const [live, setLive] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const snapshot = JSON.stringify({ name: name.trim(), pod, expiry, showResults })
  const published = live !== null
  const dirty = published && live !== snapshot
  const nameError = attempted && !name.trim()
  const podError = attempted && !pod
  const expiryError = attempted && !expiry

  function publish() {
    if (published && !dirty) {
      toast('No changes to publish')
      return
    }
    if (!name.trim() || !pod || !expiry) {
      setAttempted(true)
      return
    }
    setLive(snapshot)
    setAttempted(false)
    toast(published ? 'Changes are live' : 'Published — the voter link is ready')
  }

  return (
    <>
      <EditorFrame
        status={published ? 'open' : 'draft'}
        caption={published ? 'The form is live. Open the dialog again to copy the link or unpublish.' : 'Select Publish to open the dialog.'}
        end={
          <>
            <PresenceBar peers={PEERS} />
            <Button size="md" onClick={() => setOpen(true)}>
              {published ? 'Published' : 'Publish'}
            </Button>
          </>
        }
      />

      <Dialog open={open} onClose={() => setOpen(false)} size="md" initialFocus={nameRef}>
        <DialogHeader
          title={published ? 'Published' : 'Publish form'}
          description={published ? 'Your form is live. Send the link to voters.' : 'Add a few details to get a link you can share.'}
        />
        <DialogBody className="space-y-4">
          <Field subtle label="Form name" error={nameError ? 'Add a name to publish.' : undefined}>
            <Input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Checkout redesign" invalid={nameError} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field subtle label="Pod" error={podError ? 'Choose a pod.' : undefined}>
              <Select value={pod} onChange={(e) => setPod(e.target.value)} placeholder="Choose a pod" invalid={podError}>
                {PODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field subtle label="Expiry date" error={expiryError ? 'Choose an expiry date.' : undefined}>
              <DatePicker value={expiry} onChange={setExpiry} min={toDayString(new Date())} invalid={expiryError} />
            </Field>
          </div>
          <div className="-mx-1">
            <Toggle checked={showResults} onChange={setShowResults} label="Let voters see results" />
          </div>
          {published && (
            <div className="u-swap">
              <p className="mb-1.5 text-label font-medium text-muted">Voter link</p>
              <CopyField value={VOTER_LINK} inputLabel="Voter link" />
            </div>
          )}
        </DialogBody>
        <DialogFooter
          note={
            published ? (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setLive(null)
                  toast('Unpublished. The form is a draft again and the voter link no longer works.')
                }}
              >
                Unpublish
              </Button>
            ) : attempted && (nameError || podError || expiryError) ? (
              <span className="text-danger">Fill in the missing fields to publish.</span>
            ) : null
          }
        >
          <Button size="md" onClick={publish}>
            {!published ? 'Publish form' : dirty ? 'Publish changes' : 'Published — up to date'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}

/* ------------------------------------------------------------------ Share */

function ShareDemo() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('edit')
  const [people, setPeople] = useState<{ email: string; role: Role }[]>([
    { email: OMAR, role: 'edit' },
    { email: LENA, role: 'view' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const inviteRef = useRef<HTMLInputElement>(null)

  function invite() {
    const address = email.trim().toLowerCase()
    if (!/^[^@\s]+@example\.com$/.test(address)) {
      setError('Enter an email address ending in @example.com.')
      return
    }
    if (address === ME || people.some((p) => p.email === address)) {
      setError(`${personName(address)} already has access.`)
      return
    }
    setPeople((all) => [...all, { email: address, role }])
    setEmail('')
    setError(null)
    toast(`Invited ${personName(address)} to ${role === 'edit' ? 'edit' : 'view'} this form`)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(VOTER_LINK)
    } catch {
      /* clipboard blocked — still confirm, it's a demo */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <>
      <EditorFrame
        trail="Breadcrumb, share demo"
        status="open"
        caption="Select Add collaborator to open the access dialog."
        end={
          <>
            <PresenceBar peers={PEERS} />
            <Button variant="secondary" size="md" leadingIcon={<UserPlus size={15} aria-hidden="true" />} onClick={() => setOpen(true)}>
              Add collaborator
            </Button>
          </>
        }
      />

      <Dialog open={open} onClose={() => setOpen(false)} size="xl" initialFocus={inviteRef}>
        <DialogHeader
          divided
          title="Share this form"
          actions={
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={copied ? <Check size={14} weight="bold" aria-hidden="true" /> : <LinkSimple size={16} aria-hidden="true" />}
              onClick={copyLink}
            >
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          }
        />
        <DialogBody>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              ref={inviteRef}
              size="lg"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                invite()
              }}
              placeholder="name@example.com"
              aria-label="Collaborator email"
              invalid={Boolean(error)}
              className="min-w-0 flex-1"
            />
            <Select size="lg" value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="New collaborator access" className="sm:w-[132px]">
              <option value="edit">Can edit</option>
              <option value="view">Can view</option>
            </Select>
            <Button leadingIcon={<Plus size={15} aria-hidden="true" />} onClick={invite} className="h-11">
              Invite
            </Button>
          </div>
          {error && <FieldError>{error}</FieldError>}

          <p className="mt-7 text-label font-medium text-muted">Who has access</p>
          <div className="mt-2 divide-y divide-line rounded-2xl border border-line">
            <AccessRow email={ME} you>
              <span className="text-label font-medium text-muted">Owner</span>
            </AccessRow>
            {people.map((p) => (
              <AccessRow key={p.email} email={p.email}>
                <div className="flex items-center gap-1.5">
                  <Select
                    size="sm"
                    value={p.role}
                    onChange={(e) => {
                      const next = e.target.value as Role
                      setPeople((all) => all.map((x) => (x.email === p.email ? { ...x, role: next } : x)))
                    }}
                    aria-label={`Access for ${p.email}`}
                    className="w-[118px]"
                  >
                    <option value="edit">Can edit</option>
                    <option value="view">Can view</option>
                  </Select>
                  <IconX label={`Remove ${personName(p.email)}`} onClick={() => setPeople((all) => all.filter((x) => x.email !== p.email))} />
                </div>
              </AccessRow>
            ))}
          </div>
          {people.length === 0 && (
            <Text size="label" tone="muted" className="mt-2">
              Only you have access. Invite someone by email to let them edit or view this form.
            </Text>
          )}
        </DialogBody>
      </Dialog>
    </>
  )
}

function AccessRow({ email, you = false, children }: { email: string; you?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <Avatar person={email} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-ui font-medium">
          {personName(email)}
          {you && <span className="font-normal text-muted"> (you)</span>}
        </span>
        <span className="block truncate text-caption text-muted">{email}</span>
      </span>
      {children}
    </div>
  )
}

function IconX({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <IconButton label={label} size="md" shape="square" onClick={onClick}>
      <X size={14} aria-hidden="true" />
    </IconButton>
  )
}

/* ---------------------------------------------------------------- Confirm */

function ConfirmDemo() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)

  return (
    <div className="flex min-h-[300px] items-center justify-center bg-ink/[0.015] p-8">
      <PropertyPanel as="div" className="w-full max-w-[280px] overflow-hidden rounded-panel border border-line shadow-card">
        <PropertyGroup title="Which checkout feels faster?">
          <Text size="label" tone="muted" relaxed>
            {deleted ? 'Page deleted, along with its 2 options and 1 feedback input.' : 'Get Vote · 2 options · 1 feedback input'}
          </Text>
        </PropertyGroup>
        <PropertyGroup>
          {deleted ? (
            <Button variant="secondary" size="sm" onClick={() => setDeleted(false)}>
              Reset demo
            </Button>
          ) : (
            <Button variant="danger-outline" size="sm" leadingIcon={<Trash size={14} aria-hidden="true" />} onClick={() => setOpen(true)}>
              Delete page
            </Button>
          )}
        </PropertyGroup>
      </PropertyPanel>

      <ConfirmDialog
        open={open}
        title="Delete this page?"
        body="“Which checkout feels faster?” will be deleted with its 2 options and 1 feedback input. This can’t be undone."
        confirmLabel="Delete page"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          setDeleted(true)
          toast('Page deleted')
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------- Code */

const PUBLISH_CODE = `<Dialog open={open} onClose={close} size="md" initialFocus={nameRef}>
  <DialogHeader
    title={published ? 'Published' : 'Publish form'}
    description={published ? 'Your form is live. Send the link to voters.' : 'Add a few details to get a link you can share.'}
  />
  <DialogBody className="space-y-4">
    <Field subtle label="Form name" error={attempted && !name ? 'Add a name to publish.' : undefined}>
      <Input ref={nameRef} value={name} onChange={…} invalid={attempted && !name} />
    </Field>
    <div className="grid grid-cols-2 gap-3">
      <Field subtle label="Pod" error={…}>
        <Select value={pod} onChange={…} placeholder="Select…">
          {['Checkout', 'Customer', 'Delivery', …].map((p) => <option key={p}>{p}</option>)}
        </Select>
      </Field>
      <Field subtle label="Expiry date" error={…}>
        <DatePicker value={expiry} onChange={setExpiry} min={toDayString(new Date())} />
      </Field>
    </div>
    <Toggle checked={showResults} onChange={setShowResults} label="Let voters see results" />
    {published && <CopyField value={voterLink} inputLabel="Voter link" />}
  </DialogBody>
  <DialogFooter note={published && <Button variant="link">Unpublish</Button>}>
    <Button size="md" onClick={publish}>
      {!published ? 'Publish form' : dirty ? 'Publish changes' : 'Published — up to date'}
    </Button>
  </DialogFooter>
</Dialog>

// on publish
const toast = useToast()
toast('Published — the voter link is ready')`

const SHARE_CODE = `<Dialog open={open} onClose={close} size="xl">
  <DialogHeader
    divided
    title="Share this form"
    actions={<Button variant="ghost" size="sm" leadingIcon={<LinkSimple size={16} />}>Copy link</Button>}
  />
  <DialogBody>
    <div className="flex gap-2">
      <Input size="lg" placeholder="name@example.com" className="flex-1" onKeyDown={enterInvites} />
      <Select size="lg" value={role} onChange={…} className="w-[132px]">
        <option value="edit">Can edit</option>
        <option value="view">Can view</option>
      </Select>
      <Button leadingIcon={<Plus size={15} />} className="h-11" onClick={invite}>Invite</Button>
    </div>
    {error && <FieldError>{error}</FieldError>}

    <p className="mt-7 text-label font-medium text-muted">Who has access</p>
    <div className="mt-2 divide-y divide-line rounded-2xl border border-line">
      <Row person={owner}><span className="text-label text-muted">Owner</span></Row>
      {people.map((p) => (
        <Row person={p.email}>
          <Select size="sm" value={p.role} onChange={…} className="w-[118px]">…</Select>
          <IconButton label={\`Remove \${personName(p.email)}\`} size="md" shape="square"><X size={14} /></IconButton>
        </Row>
      ))}
    </div>
  </DialogBody>
</Dialog>

// Row = <div className="flex items-center gap-3 px-3.5 py-3"><Avatar person={email} /> name · email · {children}</div>`

const CONFIRM_CODE = `<ConfirmDialog
  open={open}
  title="Delete this page?"
  body="“Which checkout feels faster?” goes with its 2 options and 1 feedback input. This can’t be undone."
  confirmLabel="Delete page"
  onCancel={() => setOpen(false)}
  onConfirm={deletePage}
/>`
