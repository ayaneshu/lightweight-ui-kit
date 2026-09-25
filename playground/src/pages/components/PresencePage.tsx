import { useRef, useState } from 'react'
import { Columns, FlagCheckered, HandWaving, Star } from 'lightweight-ui/icons'
import {
  Button,
  NotificationBell,
  NotificationItem,
  NotificationPanel,
  PeerDots,
  PresenceBar,
  PresenceTag,
  RailGroup,
  RailItem,
  Rating,
  personColor,
  personName,
  type Notification,
  type Peer,
} from 'lightweight-ui'
import { Caption, Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section, Specimen } from '../../ui/Demo'

/* ------------------------------------------------------------------ Data */

const EVERYONE: Peer[] = [
  { person: 'sara.k@example.com', self: true, owner: true, where: 'on Introduction' },
  { person: 'omar.h@example.com', where: 'on Which checkout is fastest?' },
  { person: 'lena.m@example.com', where: 'on Rate the winner' },
  { person: 'ravi.p@example.com', where: 'on Results' },
  { person: 'mei.l@example.com', where: 'on End screen' },
  { person: 'yusuf.b@example.com', where: 'on Results' },
]

const NOTES: Notification[] = [
  { id: 'n1', title: 'Omar H commented on Checkout flow test', message: '“Option B’s button copy feels off.”', time: '4m ago' },
  { id: 'n2', title: 'Pricing page headline closed', message: '342 responses — the results are ready.', time: '2h ago' },
  { id: 'n3', title: 'Lena M joined your workspace', time: 'Yesterday', read: true },
  { id: 'n4', title: 'Ravi P duplicated Onboarding illustration', time: 'Mon', read: true },
]

const INCOMING: Omit<Notification, 'id'>[] = [
  { title: 'Mei L left a comment', message: '“Can we try a darker hero?”' },
  { title: 'Checkout flow test hit 150 responses', message: 'Option B is still ahead.' },
  { title: 'Yusuf B accepted your invite' },
]

/* ------------------------------------------------------------------ Page */

export default function PresencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Presence & updates"
        description="Show who's working with you as people, not numbers. Avatars show who's here. Each person keeps one colour across their avatar, outline and dot. The notification bell marks unread updates with a dot, not a count."
      />

      <Section
        id="presence-bar"
        title="Presence bar"
        description="Shows who's here right now as avatars, not a count, because what matters is who. Your own avatar comes first, so the row never looks empty when you're alone. Click someone's avatar to follow them. While you're following, the bar says so and shows how to stop."
      >
        <PresencePlayground />
      </Section>

      <Section
        id="presence-tag"
        title="Outline & tag"
        description="When someone else selects a block, it shows in their colour: a 3px outline, 3px out from the edge, and a tag in the corner with their name. It's the same colour as their avatar in the presence bar, so people learn to recognise teammates by colour."
      >
        <Demo
          code={`const c = personColor(peer.person)

<div
  className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-card"
  style={{ outline: \`3px solid \${c}\`, outlineOffset: 3 }}
>
  …
  <PresenceTag name={personName(peer.person).split(' ')[0]} color={c} />
</div>`}
        >
          <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
            <Block person="omar.h@example.com" title="Which checkout felt fastest?" />
            <Block person="lena.m@example.com" title="How would you rate it?" rating />
          </div>
        </Demo>
      </Section>

      <Section
        id="peer-dots"
        title="Peer dots"
        description="Up to three dots, in collaborators' colours, at the end of a row. They show who's on a page you're not looking at. Three is the limit, because more dots turn into noise."
      >
        <Demo
          code={`<RailItem
  variant="raised"
  icon={<Star size={12} />}
  label="Rate the winner"
  trailing={<PeerDots colors={peersOn(page.id).map((p) => personColor(p.person))} />}
/>`}
          className="gap-10"
        >
          <div className="w-[240px] rounded-panel bg-card p-2.5 shadow-card">
            <div className="space-y-1.5">
              <RailItem icon={<HandWaving size={12} />} label="Introduction" done />
              <RailGroup>
                <RailItem
                  variant="raised"
                  active
                  icon={<Columns size={12} />}
                  label="Which checkout is fastest?"
                  trailing={<PeerDots colors={[personColor('omar.h@example.com')]} className="mr-1" />}
                />
                <RailItem
                  variant="raised"
                  icon={<Star size={12} />}
                  label="Rate the winner"
                  trailing={<PeerDots colors={[personColor('lena.m@example.com'), personColor('ravi.p@example.com')]} className="mr-1" />}
                />
              </RailGroup>
              <RailItem
                icon={<FlagCheckered size={12} />}
                label="End screen"
                trailing={<PeerDots colors={EVERYONE.slice(1).map((p) => personColor(p.person))} className="mr-2" />}
              />
            </div>
          </div>
          <div className="flex items-end gap-6">
            {[1, 2, 3, 5].map((n) => (
              <Specimen key={n} label={`${n} ${n === 1 ? 'peer' : 'peers'}`} sub={n > 3 ? 'shows 3 at most' : undefined}>
                <div className="grid h-6 place-items-center">
                  <PeerDots colors={EVERYONE.slice(1, 1 + n).map((p) => personColor(p.person))} />
                </div>
              </Specimen>
            ))}
          </div>
        </Demo>
      </Section>

      <Section
        id="notification-bell"
        title="Notification bell"
        description="Marks unread updates with a dot, not a count. A “9+” badge would be wider than the bell and hide it. The count goes where there's room for it: in the panel's header, and in the button's name for screen readers."
      >
        <BellDemo />
      </Section>

      <Section
        id="notification-panel"
        title="Notification panel"
        description="The list inside the bell, which also works on its own, such as in a sidebar or a mobile sheet. The header shows the unread count, and unread rows have a green dot. With no notifications, it says “You’re all caught up” instead of showing an empty box."
      >
        <Demo
          code={`<NotificationPanel
  items={notifications}
  onItemClick={(n) => open(n)}
  onMarkAllRead={markAllRead}
/>

<NotificationPanel items={[]} />  // "You’re all caught up"`}
          className="items-start gap-6"
        >
          <LivePanel />
          <div className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-card shadow-card">
            <NotificationPanel items={[]} />
          </div>
        </Demo>
      </Section>

      <Section id="notification-item" title="Notification item" description="One notification: a dot, a title, and an optional message and time. Unread items get a green dot, the same green as an open status. Read items get a grey dot, so the row keeps its layout.">
        <Demo
          code={`<NotificationItem item={{ id: 'n1', title: 'Omar H commented', message: '“Option B’s copy feels off.”', time: '4m ago' }} />
<NotificationItem item={{ id: 'n3', title: 'Lena M joined your workspace', time: 'Yesterday', read: true }} />`}
        >
          <div className="w-full max-w-[340px] space-y-1 rounded-2xl bg-card p-1.5 shadow-card">
            <NotificationItem item={NOTES[0]} />
            <NotificationItem item={NOTES[2]} />
          </div>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="PresenceBar"
          rows={[
            { name: 'peers', type: 'Peer[]', description: 'Everyone here, including you. Shows nothing when empty.' },
            { name: 'following', type: 'string | null', description: 'The person value of the peer you’re following.' },
            { name: 'onFollow', type: '(person: string) => void', description: 'Makes other people’s avatars clickable.' },
            { name: 'onStopFollowing', type: '() => void', description: 'Runs from the “Following …” chip, or when the same avatar is clicked again.' },
            { name: 'max', type: 'number', default: '4', description: 'How many avatars to show before a neutral +N chip.' },
          ]}
        />
        <PropsTable
          title="Peer"
          rows={[
            { name: 'person', type: 'string', description: 'An email or name. Sets the initials and colour.' },
            { name: 'where', type: 'string', description: 'Where they are, such as “on Introduction”. Shown in the tooltip.' },
            { name: 'self', type: 'boolean', description: 'Shown as “You”, and can’t be followed.' },
            { name: 'owner', type: 'boolean', description: 'Adds “· owner” to the tooltip.' },
          ]}
        />
        <PropsTable
          title="PresenceTag · PeerDots"
          rows={[
            { name: 'PresenceTag name', type: 'string', description: 'Usually the first name.' },
            { name: 'PresenceTag color', type: 'string', description: 'Use personColor(person), so it matches the outline.' },
            { name: 'PeerDots colors', type: 'string[]', description: 'Shows the first three. Shows nothing when empty.' },
          ]}
        />
        <PropsTable
          title="NotificationBell · NotificationPanel"
          rows={[
            { name: 'items', type: 'Notification[]', description: '{ id, title, message?, time?, read? }' },
            { name: 'title', type: 'ReactNode', default: "'Updates'", description: 'The panel header.' },
            { name: 'onItemClick', type: '(item) => void', description: 'Runs when a notification is clicked. The bell closes itself first.' },
            { name: 'onMarkAllRead', type: '() => void', description: 'Shows a “Mark all read” button while anything is unread.' },
            { name: 'emptyTitle / emptyBody', type: 'ReactNode', description: 'The text shown when there are no notifications.' },
            { name: 'className', type: 'string', description: 'Bell only. Applied to the trigger button.' },
          ]}
        />
        <PropsTable
          title="NotificationItem"
          rows={[
            { name: 'item', type: 'Notification', description: 'The row’s content.' },
            { name: 'onClick', type: '() => void', description: 'Makes the whole row a button.' },
          ]}
        />
      </Section>
    </>
  )
}

/* ---------------------------------------------------------------- Pieces */

function PresencePlayground() {
  const [count, setCount] = useState<'1' | '3' | '6'>('3')
  const [max, setMax] = useState<'2' | '3' | '4'>('4')
  const [followable, setFollowable] = useState(true)
  const [following, setFollowing] = useState<string | null>(null)

  const peers = EVERYONE.slice(0, Number(count))
  const followed = following && peers.some((p) => p.person === following) ? following : null

  const code = `const [following, setFollowing] = useState<string | null>(null)

<PresenceBar
  peers={peers}  // you first: { person, self: true }${max !== '4' ? `\n  max={${max}}` : ''}${
    followable ? `\n  following={following}\n  onFollow={setFollowing}\n  onStopFollowing={() => setFollowing(null)}` : ''
  }
/>`

  return (
    <Demo
      code={code}
      codeOpen
      controls={
        <>
          <KnobSegment label="peers" value={count} options={['1', '3', '6'] as const} onChange={setCount} />
          <KnobSegment label="max" value={max} options={['2', '3', '4'] as const} onChange={setMax} />
          <KnobToggle
            label="onFollow"
            checked={followable}
            onChange={(v) => {
              setFollowable(v)
              if (!v) setFollowing(null)
            }}
          />
        </>
      }
      className="flex-col"
    >
      <PresenceBar
        peers={peers}
        max={Number(max)}
        following={followable ? followed : null}
        onFollow={followable ? setFollowing : undefined}
        onStopFollowing={() => setFollowing(null)}
      />
      <Caption>
        {count === '1'
          ? 'Just you. Your own avatar still shows, so the bar never looks empty.'
          : followed
            ? `Following ${personName(followed).split(' ')[0]}. Your view follows theirs until you stop.`
            : peers.length > Number(max)
              ? 'The +N chip stays neutral. It stands for several people, so one person’s colour would be misleading.'
              : followable
                ? 'Hover over an avatar to see where that person is. Click to follow them.'
                : 'Without onFollow, avatars can’t be clicked.'}
      </Caption>
    </Demo>
  )
}

function Block({ person, title, rating = false }: { person: string; title: string; rating?: boolean }) {
  const c = personColor(person)
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-card" style={{ outline: `3px solid ${c}`, outlineOffset: 3 }}>
      <p className="text-body font-semibold tracking-tight">{title}</p>
      {rating ? (
        <Rating value={4} readOnly size={20} className="mt-3" />
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {['A', 'B'].map((l) => (
            <div key={l} className="cursor-default select-none grid h-14 place-items-center rounded-xl bg-ink/[0.04] text-label font-semibold text-muted">
              {l}
            </div>
          ))}
        </div>
      )}
      <PresenceTag name={personName(person).split(' ')[0]} color={c} />
    </div>
  )
}

function LivePanel() {
  const [items, setItems] = useState(NOTES)
  return (
    <div className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-card shadow-card">
      <NotificationPanel
        items={items}
        onItemClick={(item) => setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, read: true } : x)))}
        onMarkAllRead={() => setItems((xs) => xs.map((x) => ({ ...x, read: true })))}
      />
    </div>
  )
}

function BellDemo() {
  const [items, setItems] = useState(NOTES)
  const next = useRef(0)

  function push() {
    const n = INCOMING[next.current % INCOMING.length]
    next.current += 1
    setItems((xs) => [{ ...n, id: `new-${next.current}`, time: 'Just now' }, ...xs])
  }

  const unread = items.filter((i) => !i.read).length

  return (
    <Demo
      stage="none"
      code={`<NotificationBell
  items={notifications}
  onItemClick={(n) => {
    markRead(n.id)
    router.push(n.href)
  }}
  onMarkAllRead={markAllRead}
/>`}
      controls={
        <>
          <Button variant="secondary" size="sm" onClick={push}>
            Simulate an update
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setItems([])}>
            Clear all
          </Button>
          <Caption>
            {unread} unread. Screen readers call the button “{unread ? `Updates — ${unread} new` : 'Updates'}”.
          </Caption>
        </>
      }
    >
      <div className="flex h-[420px] flex-col">
        <div className="flex h-14 flex-none items-center justify-between border-b border-line px-4">
          <span className="text-ui font-medium text-muted">Your workspace</span>
          <NotificationBell
            items={items}
            onItemClick={(item) => setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, read: true } : x)))}
            onMarkAllRead={() => setItems((xs) => xs.map((x) => ({ ...x, read: true })))}
          />
        </div>
        <div className="pg-stage flex-1" />
      </div>
    </Demo>
  )
}
