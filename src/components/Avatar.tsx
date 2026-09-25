import { cn } from '../lib/cn'
import { personColor, personInitials, personName } from '../lib/person'
import Tooltip from './Tooltip'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZES: Record<AvatarSize, string> = {
  xs: 'h-5 w-5 text-micro',
  sm: 'h-7 w-7 text-micro',
  md: 'h-9 w-9 text-label tracking-tight',
  lg: 'h-12 w-12 text-body',
}

export interface AvatarProps {
  /** An email or a name — drives the initials and, hashed, the colour. */
  person: string
  size?: AvatarSize
  /** `color` fills with the person's hue; `neutral` is a grey wash with ink initials. */
  tone?: 'color' | 'neutral'
  /** A 2px ring in the surface colour, for avatars that overlap or sit on media. */
  ring?: 'bg' | 'card' | false
  /** Override the hashed colour. */
  color?: string
  src?: string
  className?: string
}

/**
 * A person as a circle. Colour is hashed from the address, so a teammate keeps
 * the same circle on every card — that consistency is the whole point.
 */
export function Avatar({ person, size = 'sm', tone = 'color', ring = false, color, src, className }: AvatarProps) {
  const fill = tone === 'color' ? (color ?? personColor(person)) : undefined
  return (
    <span
      className={cn(
        'u-circle grid flex-none cursor-default select-none place-items-center overflow-hidden rounded-full font-semibold',
        SIZES[size],
        tone === 'color' ? 'text-white' : 'bg-ink/[0.06] text-ink',
        ring === 'bg' && 'ring-2 ring-bg',
        ring === 'card' && 'ring-2 ring-card',
        className,
      )}
      style={fill ? { backgroundColor: fill } : undefined}
      aria-label={personName(person)}
      role="img"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="u-circle h-full w-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-ink/10" />
      ) : (
        personInitials(person)
      )}
    </span>
  )
}

export interface AvatarStackProps {
  people: { person: string; label?: string }[]
  /** Faces before the rest collapse into a +N chip. */
  max?: number
  size?: AvatarSize
  ring?: 'bg' | 'card'
  /** Names on hover, via the kit's tooltip rather than the slow native title. */
  tooltips?: boolean
  className?: string
}

/**
 * Overlapping faces. The overflow chip stays neutral — it stands for several
 * people, so borrowing any one person's colour would be a lie.
 */
export function AvatarStack({ people, max = 3, size = 'sm', ring = 'card', tooltips = true, className }: AvatarStackProps) {
  const shown = people.slice(0, max)
  const rest = people.slice(max)
  const z = ['z-40', 'z-30', 'z-20', 'z-10']
  return (
    <div className={cn('flex items-center', className)}>
      {shown.map((p, i) => {
        // Each face rises a little under the pointer, out of the overlap.
        const face = (
          <span className="inline-flex transition-[translate] duration-200 ease-out hover:-translate-y-0.5">
            <Avatar person={p.person} size={size} ring={ring} />
          </span>
        )
        const label = p.label ?? personName(p.person)
        return tooltips ? (
          <Tooltip key={p.person} label={label} className={cn('-ms-2 first:ms-0', z[i] ?? 'z-0')}>
            {face}
          </Tooltip>
        ) : (
          <span key={p.person} className={cn('relative -ms-2 inline-flex first:ms-0', z[i] ?? 'z-0')}>
            {face}
          </span>
        )
      })}
      {rest.length > 0 && (
        <Tooltip label={rest.map((p) => p.label ?? personName(p.person)).join(', ')} className="-ms-2">
          <span
            role="img"
            aria-label={`and ${rest.length} more: ${rest.map((p) => p.label ?? personName(p.person)).join(', ')}`}
            className={cn(
              // Neutral, not any one person's colour — it stands for several.
              'u-circle grid cursor-default select-none place-items-center rounded-full bg-muted font-semibold text-on-ink',
              SIZES[size],
              ring === 'bg' ? 'ring-2 ring-bg' : 'ring-2 ring-card',
            )}
          >
            +{rest.length}
          </span>
        </Tooltip>
      )}
    </div>
  )
}
