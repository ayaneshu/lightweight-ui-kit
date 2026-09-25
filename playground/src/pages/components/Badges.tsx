import { useState } from 'react'
import { Check, SquareSplitHorizontal, Sparkle, TextAlignLeft } from 'lightweight-ui/icons'
import { Badge, CountBadge, Dot, IconTile, LetterBadge, StatusBadge, UpvoteChip, type BadgeTone } from 'lightweight-ui'
import { Demo, KnobSegment, KnobText, KnobToggle, PageHeader, PropsTable, Section, Specimen } from '../../ui/Demo'

const TONES: BadgeTone[] = ['neutral', 'ink', 'outline', 'draft', 'open', 'closed', 'danger']

export default function Badges() {
  const [tone, setTone] = useState<BadgeTone>('open')
  const [size, setSize] = useState<'sm' | 'md'>('md')
  const [dot, setDot] = useState(true)
  const [label, setLabel] = useState('Active')
  const [votes, setVotes] = useState(4)
  const [active, setActive] = useState('A')

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Badges & tags"
        description="Small labels that sit next to data, such as a status or a tag. Badges are fully rounded. Most are a light tint with matching text, so they stay quieter than the controls around them."
      />

      <Section id="playground" title="Badge">
        <Demo
          code={`<Badge tone="${tone}"${size !== 'md' ? ` size="${size}"` : ''}${dot ? ' dot' : ''}>${label}</Badge>`}
          controls={
            <>
              <KnobSegment label="tone" value={tone} options={TONES} onChange={setTone} />
              <KnobSegment label="size" value={size} options={['sm', 'md'] as const} onChange={setSize} />
              <KnobText label="children" value={label} onChange={setLabel} />
              <KnobToggle label="dot" checked={dot} onChange={setDot} />
            </>
          }
        >
          <Badge tone={tone} size={size} dot={dot}>
            {label}
          </Badge>
        </Demo>
        <Demo
          title="Tones"
          description="Use sm (12px) for tags next to data, like Leading or Sample data. Use md (13px) for states, like Voted."
          code={TONES.map((t) => `<Badge tone="${t}">…</Badge>`).join('\n')}
          className="gap-3"
        >
          <Badge tone="neutral" size="sm">
            Sample data
          </Badge>
          <Badge tone="ink" size="sm">
            Leading
          </Badge>
          <Badge tone="neutral" size="sm">
            Your pick
          </Badge>
          <Badge tone="outline" size="sm">
            Owner
          </Badge>
          <Badge tone="draft">Demo</Badge>
          <Badge tone="danger" dot>
            Couldn’t save
          </Badge>
          <Badge tone="open" icon={<Check size={13} weight="bold" />}>
            Voted
          </Badge>
        </Demo>
      </Section>

      <Section id="status" title="Status badge" description="Shows where a form is in its life: Draft, Active or Closed. The dot before the label marks it as a status, not a tag.">
        <Demo code={`<StatusBadge status="draft" />\n<StatusBadge status="open" />\n<StatusBadge status="closed" />`} className="gap-3">
          <StatusBadge status="draft" />
          <StatusBadge status="open" />
          <StatusBadge status="closed" />
        </Demo>
      </Section>

      <Section id="small" title="Counts, dots & tiles">
        <Demo
          title="CountBadge"
          description="The number after a filter label. Its tint follows the text colour, so it stays readable when the filter is selected."
          code={`<CountBadge>12</CountBadge>\n<CountBadge active>3</CountBadge>`}
          className="gap-3"
        >
          <CountBadge>12</CountBadge>
          <CountBadge active>3</CountBadge>
        </Demo>
        <Demo
          title="Dot"
          description="For unread markers, presence and a recording light. When the dot sits on top of another element, add ring to separate it from what's underneath."
          code={`<Dot />                      // unread (open green)\n<Dot color="#e11d48" size={6} />\n<Dot ring className="absolute right-1 top-1" />\n<Dot color="#fff" pulse />`}
          className="gap-6"
        >
          <Specimen label="unread">
            <Dot />
          </Specimen>
          <Specimen label="read">
            <Dot color="rgba(0,0,0,0.15)" />
          </Specimen>
          <Specimen label="presence">
            <div className="flex gap-0.5">
              <Dot size={6} color="#4F46E5" />
              <Dot size={6} color="#E11D48" />
              <Dot size={6} color="#059669" />
            </div>
          </Specimen>
          <Specimen label="recording">
            <span className="cursor-default select-none flex items-center gap-2 rounded-2xl bg-danger-solid px-4 py-2 text-ui font-medium text-white">
              <Dot color="#fff" size={10} pulse /> 0:07
            </span>
          </Specimen>
        </Demo>
        <Demo
          title="LetterBadge"
          description="Labels an option with a letter. It stays neutral until that option is hovered, focused or chosen, then fills with ink."
          code={`<LetterBadge letter="A" active />`}
          className="gap-2"
        >
          {['A', 'B', 'C', 'D'].map((l) => (
            <button key={l} type="button" aria-label={`Option ${l}`} aria-pressed={active === l} onMouseEnter={() => setActive(l)} onFocus={() => setActive(l)} className="rounded-lg p-1 focus-visible:outline-offset-2">
              <LetterBadge letter={l} active={active === l} />
            </button>
          ))}
        </Demo>
        <Demo
          title="IconTile"
          description="An icon on a light tint. In a sidebar, the sm tile can also show progress: set done and it turns green, for example once a screen has everything it needs."
          code={`<IconTile><SquareSplitHorizontal size={14} /></IconTile>\n<IconTile size="sm" done><Sparkle size={13} /></IconTile>\n<IconTile size="lg"><Sparkle size={22} /></IconTile>`}
          className="gap-6"
        >
          <Specimen label="md">
            <IconTile>
              <SquareSplitHorizontal size={14} />
            </IconTile>
          </Specimen>
          <Specimen label="sm">
            <IconTile size="sm">
              <TextAlignLeft size={13} />
            </IconTile>
          </Specimen>
          <Specimen label="sm · done">
            <IconTile size="sm" done>
              <Sparkle size={13} />
            </IconTile>
          </Specimen>
          <Specimen label="lg">
            <IconTile size="lg">
              <Sparkle size={22} />
            </IconTile>
          </Specimen>
        </Demo>
        <Demo
          title="UpvoteChip"
          description="Without onClick it only shows a count, as on a sample answer. Add onClick and it becomes a button people can press to vote."
          code={`<UpvoteChip count={4} />\n<UpvoteChip count={votes} onClick={() => setVotes(v => v + 1)} />`}
          className="gap-3"
        >
          <UpvoteChip count={4} />
          <UpvoteChip count={votes} onClick={() => setVotes((v) => v + 1)} />
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Badge"
          rows={[
            { name: 'tone', type: TONES.map((t) => `'${t}'`).join(' | '), default: "'neutral'", description: 'The background and text colour.' },
            { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '12px for tags, 13px for states.' },
            { name: 'dot', type: 'boolean', default: 'false', description: 'Adds a dot before the label, in the text colour.' },
            { name: 'icon', type: 'ReactNode', description: 'An icon before the label.' },
          ]}
        />
        <PropsTable
          title="StatusBadge · Dot · LetterBadge · IconTile · UpvoteChip"
          rows={[
            { name: 'StatusBadge.status', type: "'draft' | 'open' | 'closed'", description: 'Shows Draft, Active or Closed. Pass label to change the text.' },
            { name: 'Dot.color / size / ring / pulse', type: 'string / number / boolean / boolean', default: 'open / 8 / false / false', description: 'color takes any CSS colour. ring separates the dot from what it sits on. pulse makes it pulse.' },
            { name: 'LetterBadge.letter / active', type: 'string / boolean', description: 'A single letter, such as A, B or C. active fills it with ink.' },
            { name: 'IconTile.size / done', type: "'sm' | 'md' | 'lg' / boolean", default: "'md'", description: '20 / 24 / 48px. done turns it green.' },
            { name: 'UpvoteChip.count / onClick', type: 'number / () => void', description: 'A button when onClick is set. Otherwise it only shows the count.' },
          ]}
        />
      </Section>
    </>
  )
}
