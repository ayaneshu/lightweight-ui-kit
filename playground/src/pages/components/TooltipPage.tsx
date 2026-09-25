import { useState } from 'react'
import { CopySimple, Trash } from 'lightweight-ui/icons'
import { Button, IconButton, ShareBar, Tooltip } from 'lightweight-ui'
import { Demo, KnobSegment, KnobText, KnobToggle, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function TooltipPage() {
  const [side, setSide] = useState<'top' | 'bottom'>('top')
  const [label, setLabel] = useState('Duplicate')
  const [instant, setInstant] = useState(false)

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Tooltip"
        description="A small label that names an icon-only control or gives the figures behind a chart mark. It waits 300ms before appearing, so moving across a toolbar doesn't flash a label for every button. It hides when you press or scroll. It renders outside its parent and stays inside the window, so a scrolling column or animated card can't cut it off."
      />

      <Section id="playground" title="Playground">
        <Demo
          code={`<Tooltip label="${label}"${side !== 'top' ? ` side="${side}"` : ''}${instant ? ' instant' : ''}>
  <IconButton label="${label}"><CopySimple size={16} /></IconButton>
</Tooltip>`}
          controls={
            <>
              <KnobText label="label" value={label} onChange={setLabel} />
              <KnobSegment label="side" value={side} options={['top', 'bottom'] as const} onChange={setSide} />
              <KnobToggle label="instant" checked={instant} onChange={setInstant} />
            </>
          }
        >
          <Tooltip label={label} side={side} instant={instant}>
            <IconButton label={label}>
              <CopySimple size={16} />
            </IconButton>
          </Tooltip>
        </Demo>
      </Section>

      <Section id="uses" title="When to use it">
        <Demo
          title="Icon buttons"
          description="Set the tooltip prop on IconButton and it shows the button's label on hover."
          code={`<IconButton label="Delete" tooltip><Trash size={16} /></IconButton>`}
          className="gap-2"
        >
          <IconButton label="Duplicate" tooltip size="md" shape="square">
            <CopySimple size={16} />
          </IconButton>
          <IconButton label="Delete" tooltip size="md" shape="square">
            <Trash size={16} />
          </IconButton>
        </Demo>
        <Demo
          title="Chart marks"
          description="Hover a segment to see the exact numbers. The segment shows its percentage when it's wide enough to fit."
          stage="plain"
          className="block"
        >
          <ShareBar
            slices={[
              { id: 'a', label: 'Option A', value: 11, color: '#277fff' },
              { id: 'b', label: 'Option B', value: 7, color: '#1baf7a' },
              { id: 'c', label: 'Both feel equal', value: 3, color: '#eda100' },
            ]}
          />
        </Demo>
        <Demo
          title="Cut-off text and unavailable actions"
          description="Add a tooltip to shortened text only when part of it is actually cut off. On a button that can't be used yet, a tooltip can say what's needed first."
          code={`<Tooltip label={name}><span className="max-w-[20ch] truncate">{name}</span></Tooltip>`}
        >
          <Tooltip label="Checkout redesign — payment step v3" side="bottom">
            <span className="block max-w-[20ch] truncate rounded-md px-1.5 py-0.5 text-ui font-medium hover:bg-ink/[0.04]">Checkout redesign — payment step v3</span>
          </Tooltip>
          {/* aria-disabled rather than disabled: a disabled button gets no hover,
              so it could never explain itself. */}
          <Tooltip label="Complete every page to publish">
            <Button size="md" aria-disabled="true" onClick={(e) => e.preventDefault()}>
              Publish
            </Button>
          </Tooltip>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          rows={[
            { name: 'label', type: 'ReactNode', description: 'The tooltip text. Keep it to one line, with no links or buttons.' },
            { name: 'side', type: "'top' | 'bottom'", default: "'top'", description: 'Shows the tooltip above or below the trigger.' },
            { name: 'instant', type: 'boolean', default: 'false', description: 'Shows the tooltip without the 300ms delay.' },
            { name: 'className / style', type: 'string / CSSProperties', description: 'Applied to the wrapper around the trigger. Use it when the trigger’s size is calculated, such as a chart segment’s width.' },
          ]}
        />
      </Section>
    </>
  )
}
