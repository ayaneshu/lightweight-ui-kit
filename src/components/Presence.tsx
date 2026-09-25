import { Bell, X } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { onColor } from '../lib/color'
import { personColor, personInitials, personName } from '../lib/person'
import { Dot } from './Badge'
import { Popover } from './Menu'
import Tooltip from './Tooltip'

/* ------------------------------------------------------------ PresenceBar */

export interface Peer {
  /** Email or name — drives initials and colour. */
  person: string
  /** Where they are — "on Introduction". Shown in the tooltip. */
  where?: string
  self?: boolean
  owner?: boolean
}

export interface PresenceBarProps {
  peers: Peer[]
  /** The peer being followed, by `person`. */
  following?: string | null
  onFollow?: (person: string) => void
  onStopFollowing?: () => void
  max?: number
  className?: string
}

/**
 * Who else is here right now — faces rather than a count, because the point
 * is *who*. Your own face leads, so the row never reads as a list of strangers
 * (or as empty when you're alone). Click a face to follow them; following says
 * so, and says how to stop.
 */
export function PresenceBar({ peers, following, onFollow, onStopFollowing, max = 4, className }: PresenceBarProps) {
  if (peers.length === 0) return null
  const shown = peers.slice(0, max)
  const overflow = peers.length - shown.length
  const followed = peers.find((p) => p.person === following)
  // Faces overlap when they're a picture; they separate when each is a button,
  // so no two targets share the same pixels.
  const followable = Boolean(onFollow)
  const gap = followable ? 'ms-1 first:ms-0' : '-ms-2 first:ms-0'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {followed && (
        <button
          type="button"
          onClick={onStopFollowing}
          aria-label={`Following ${personName(followed.person).split(' ')[0]}, stop following`}
          className="u-press inline-flex min-h-6 items-center gap-1.5 rounded-full border border-line-strong bg-card px-2 py-1 text-label font-medium text-ink hover:bg-ink/[0.03] focus-visible:outline-offset-2"
        >
          <Dot size={6} color={personColor(followed.person)} />
          Following {personName(followed.person).split(' ')[0]}
          <X size={11} weight="bold" aria-hidden="true" className="text-muted" />
        </button>
      )}
      <div className="flex items-center">
        {shown.map((peer) => {
          const who = peer.self ? 'You' : personName(peer.person)
          const label = [who + (peer.owner ? ' · owner' : ''), peer.where, peer.self ? null : following === peer.person ? 'following' : 'click to follow']
            .filter(Boolean)
            .join(' · ')
          const face = (
            <span
              className="u-circle grid h-7 w-7 cursor-default select-none place-items-center rounded-full text-micro font-semibold text-white ring-2 ring-bg [button_&]:cursor-pointer"
              style={{ backgroundColor: personColor(peer.person) }}
            >
              {personInitials(peer.person)}
            </span>
          )
          return (
            <Tooltip key={peer.person} label={label} side="bottom" className={gap}>
              {peer.self || !onFollow ? (
                <span role="img" aria-label={label}>
                  {face}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => (following === peer.person ? onStopFollowing?.() : onFollow(peer.person))}
                  // The name and state; the action is what a button does.
                  aria-label={[who, peer.where].filter(Boolean).join(' · ')}
                  aria-pressed={following === peer.person}
                  className={cn(
                    'u-circle u-press rounded-full hover:-translate-y-0.5 focus-visible:outline-offset-2',
                    following === peer.person && 'ring-2 ring-ink/60 ring-offset-1 ring-offset-bg',
                  )}
                >
                  {face}
                </button>
              )}
            </Tooltip>
          )
        })}
        {overflow > 0 && (
          <span
            role="img"
            aria-label={`${overflow} more`}
            className={cn('u-circle grid h-7 min-w-7 cursor-default select-none place-items-center rounded-full bg-ink/[0.08] px-1 text-micro font-semibold text-muted ring-2 ring-bg', gap)}
          >
            +{overflow}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Whose outline this is — a colour tab tucked into a card's corner. Pair it
 * with `outline: 3px solid <color>; outline-offset: 3px` on the card.
 */
export function PresenceTag({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span
      className={cn('pointer-events-none absolute bottom-0 end-0 z-20 select-none rounded-ss-lg px-1.5 py-0.5 text-micro font-semibold leading-tight', className)}
      style={{ backgroundColor: color, color: onColor(color) }}
    >
      {name}
    </span>
  )
}

/**
 * Up to three dots in collaborators' colours — who's on a screen you're not
 * looking at. Colour alone says nothing to a screen reader: pass `label`
 * ("Ada and Sam are here") and the dots carry it; omit it and they're decor.
 */
export function PeerDots({ colors, label, className }: { colors: string[]; label?: string; className?: string }) {
  if (!colors.length) return null
  return (
    <span
      className={cn('flex flex-none items-center gap-0.5', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {colors.slice(0, 3).map((c, i) => (
        <Dot key={`${c}-${i}`} size={6} color={c} />
      ))}
    </span>
  )
}

/* ---------------------------------------------------------- Notifications */

export interface Notification {
  id: string
  title: React.ReactNode
  message?: React.ReactNode
  /** Already formatted — "3m ago". */
  time?: React.ReactNode
  read?: boolean
}

export function NotificationItem({ item, onClick }: { item: Notification; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-static
      className="flex w-full items-start gap-2.5 rounded-chip px-2.5 py-2 text-start transition-colors hover:bg-ink/[0.04] focus-visible:-outline-offset-2"
    >
      <span className={cn('u-circle mt-1.5 h-2 w-2 shrink-0 rounded-full', item.read ? 'bg-ink/15' : 'bg-open')} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-ui font-medium" title={typeof item.title === 'string' ? item.title : undefined}>
          {!item.read && <span className="sr-only">Unread: </span>}
          {item.title}
        </span>
        {item.message && <span className="mt-0.5 block text-label leading-snug text-pretty text-muted">{item.message}</span>}
        {item.time && <span className="mt-1 block text-caption text-muted">{item.time}</span>}
      </span>
    </button>
  )
}

export interface NotificationPanelProps {
  items: Notification[]
  title?: React.ReactNode
  onItemClick?: (item: Notification) => void
  onMarkAllRead?: () => void
  emptyTitle?: React.ReactNode
  emptyBody?: React.ReactNode
}

/** The list inside the bell — header with unread count, rows, an all-caught-up state. */
export function NotificationPanel({
  items,
  title = 'Updates',
  onItemClick,
  onMarkAllRead,
  emptyTitle = 'You’re all caught up',
  emptyBody = 'New activity will show up here.',
}: NotificationPanelProps) {
  const unread = items.filter((i) => !i.read).length
  return (
    <div>
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
        <p className="text-ui font-medium">
          {title}
          {unread > 0 && (
            <span className="ms-1.5 tabular-nums text-muted">
              {unread}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </p>
        {unread > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="rounded-md text-label font-medium text-muted transition-colors hover:text-ink focus-visible:outline-offset-2"
          >
            Mark all read
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="px-3.5 py-6 text-center">
          <p className="text-ui font-medium text-balance">{emptyTitle}</p>
          <p className="mt-1 text-label text-pretty text-muted">{emptyBody}</p>
        </div>
      ) : (
        <ul className="max-h-[340px] overflow-y-auto p-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <NotificationItem item={item} onClick={() => onItemClick?.(item)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * The bell. An unread *dot* rather than a count pill — a "9+" pill is wider
 * than the bell and buries it; the number lives in the panel and the label.
 */
export function NotificationBell(props: NotificationPanelProps & { className?: string }) {
  const unread = props.items.filter((i) => !i.read).length
  return (
    <Popover
      align="end"
      label={typeof props.title === 'string' ? props.title : 'Updates'}
      className="w-[340px]"
      trigger={
        <button
          type="button"
          aria-label={unread ? `Updates, ${unread} new` : 'Updates'}
          className={cn(
            'u-circle u-press group relative grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-offset-2',
            props.className,
          )}
        >
          {/* It rings when you point at it. */}
          <Bell size={18} aria-hidden="true" className="u-wiggle" />
          {unread > 0 && <Dot ring className="absolute end-1 top-1" />}
        </button>
      }
    >
      {(close) => (
        <NotificationPanel
          {...props}
          onItemClick={(item) => {
            close()
            props.onItemClick?.(item)
          }}
        />
      )}
    </Popover>
  )
}
