import { useState } from 'react'
import { Avatar, AvatarStack, personColor, personInitials, personName, type AvatarSize } from 'lightweight-ui'
import { Demo, KnobSegment, KnobText, PageHeader, PropsTable, Section, Specimen } from '../../ui/Demo'

const TEAM = ['sara.k@example.com', 'omar.h@example.com', 'lena.m@example.com', 'ravi.p@example.com', 'mei.l@example.com', 'jon.d@example.com']

export default function Avatars() {
  const [person, setPerson] = useState('sara.k@example.com')
  const [size, setSize] = useState<AvatarSize>('md')
  const [tone, setTone] = useState<'color' | 'neutral'>('color')
  const [count, setCount] = useState('5')

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Avatars"
        description="A circle with a person's initials. Avatars don't rely on profile photos. Instead, the colour is worked out from the person's email address, so they get the same colour on every card and teammates become easy to recognise."
      />

      <Section id="playground" title="Avatar">
        <Demo
          code={`<Avatar person="${person}"${size !== 'sm' ? ` size="${size}"` : ''}${tone !== 'color' ? ` tone="${tone}"` : ''} />`}
          controls={
            <>
              <KnobText label="person" value={person} onChange={setPerson} />
              <KnobSegment label="size" value={size} options={['xs', 'sm', 'md', 'lg'] as const} onChange={setSize} />
              <KnobSegment label="tone" value={tone} options={['color', 'neutral'] as const} onChange={setTone} />
            </>
          }
        >
          <div className="flex flex-col items-center gap-3">
            <Avatar person={person || '?'} size={size} tone={tone} />
            <p className="text-label text-muted">
              {personName(person || '?')} · {personInitials(person || '?')} · <span className="font-mono">{personColor(person || '?')}</span>
            </p>
          </div>
        </Demo>
        <Demo title="Sizes" code={`<Avatar person="omar.h@example.com" size="xs" />  // 20px — list rows\n<Avatar … size="sm" />  // 28px — stacks, presence\n<Avatar … size="md" />  // 36px — account button\n<Avatar … size="lg" />  // 48px`} className="items-end gap-6">
          {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
            <Specimen key={s} label={s}>
              <Avatar person="omar.h@example.com" size={s} />
            </Specimen>
          ))}
          <Specimen label="neutral">
            <Avatar person="omar.h@example.com" size="md" tone="neutral" />
          </Specimen>
        </Demo>
      </Section>

      <Section id="stack" title="AvatarStack" description="A row of overlapping avatars that shows who's involved. Each avatar has a ring in the background colour, so they stay distinct. Hover one to see the name. The +N chip for everyone else stays grey, because it stands for several people, not one.">
        <Demo
          code={`<AvatarStack people={team.map((p) => ({ person: p }))} max={3} />`}
          controls={<KnobSegment label="people" value={count} options={['1', '2', '3', '4', '5', '6'] as const} onChange={setCount} />}
        >
          <AvatarStack people={TEAM.slice(0, Number(count)).map((p, i) => ({ person: p, label: i === 0 ? 'You' : undefined }))} max={3} />
        </Demo>
        <Demo title="On a thumbnail" description="The ring matters most here, where the stack overlaps the edge of a card's image." stage="none">
          <div className="p-8">
            <div className="mx-auto max-w-xs overflow-hidden rounded-tile bg-card shadow-card">
              <img src="./thumbnails/ascii-4.webp" alt="" className="aspect-[17/6] w-full object-cover" />
              <div className="relative p-4">
                <AvatarStack people={TEAM.slice(0, 5).map((p) => ({ person: p }))} className="absolute -top-4 right-4" />
                <p className="text-title font-semibold tracking-tight">Checkout redesign</p>
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Avatar"
          rows={[
            { name: 'person', type: 'string', description: 'An email address or a name. Sets the initials and the colour.' },
            { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'sm'", description: '20 / 28 / 36 / 48px.' },
            { name: 'tone', type: "'color' | 'neutral'", default: "'color'", description: 'color uses the person’s colour with white initials. neutral uses a light tint with ink initials.' },
            { name: 'ring', type: "'bg' | 'card' | false", default: 'false', description: 'A 2px ring in the page or card colour, for overlapping avatars.' },
            { name: 'color / src', type: 'string', description: 'Sets a specific colour, or shows an image instead of initials.' },
          ]}
        />
        <PropsTable
          title="AvatarStack"
          rows={[
            { name: 'people', type: '{ person: string; label?: string }[]', description: 'Shown in order. label replaces the name in the tooltip.' },
            { name: 'max', type: 'number', default: '3', description: 'How many avatars show before the +N chip.' },
            { name: 'size / ring / tooltips', type: "AvatarSize / 'bg' | 'card' / boolean", default: "'sm' / 'card' / true", description: 'Avatar size, ring colour, and whether names show on hover.' },
          ]}
        />
        <PropsTable
          title="Helpers"
          rows={[
            { name: 'personName(email)', type: '→ string', description: '"sara.k@example.com" → "Sara K".' },
            { name: 'personInitials(email)', type: '→ string', description: 'Up to two letters.' },
            { name: 'personColor(key)', type: '→ string', description: 'One of eight avatar colours. The same key always gets the same colour.' },
          ]}
        />
      </Section>
    </>
  )
}
