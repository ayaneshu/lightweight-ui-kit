import { useState } from 'react'
import { ArrowCounterClockwise, ArrowsOut, MagnifyingGlassPlus } from 'lightweight-ui/icons'
import { ChoiceRow, HeaderChip, HeroPanel, Lightbox, OptionCard, SelectButton } from 'lightweight-ui'
import { Caption, Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section, Specimen } from '../../ui/Demo'

interface Option {
  id: string
  letter: string
  title: string
  description: string
  bg: string
  src: string
}

const OPTIONS: Option[] = [
  { id: 'a', letter: 'A', title: 'Meadow', description: 'Bright and open — reads as calm.', bg: 'g-sky', src: './thumbnails/ascii-1.webp' },
  { id: 'b', letter: 'B', title: 'Dusk', description: 'Warmer, moodier, more contrast.', bg: 'g-sunset', src: './thumbnails/ascii-2.webp' },
  { id: 'c', letter: 'C', title: 'Aurora', description: 'A dark field and one bright sweep of colour.', bg: 'g-berry', src: './thumbnails/ascii-5.webp' },
]

export default function ComparePage() {
  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Compare"
        description="Components for asking people to choose between options, such as A, B or C. Each option has a labelled header and room for its media. The answer button sits on the option itself, not in a separate list, so people don't have to match letters back to pictures."
      />

      <Section
        id="comparison"
        title="Live comparison"
        description="Point at an option and it lifts while the others fade, so it's always clear which one you're looking at. Choosing an option gives its card a strong border and fills its button. The neutral answer is a full-width row underneath, not an empty card posing as an option."
      >
        <Comparison />
      </Section>

      <Section id="playground" title="Playground" description="Try every state you can set on an OptionCard.">
        <OptionPlayground />
      </Section>

      <Section
        id="choice-row"
        title="Choice row"
        description="An answer with no media, such as “Both feel equal” or “No preference”. It's a full-width row under the options, so it's easy to find without competing with them."
      >
        <ChoiceRowDemo />
      </Section>

      <Section
        id="select-button"
        title="Select button"
        description="The answer button at the bottom of an option. It's outlined until chosen, then fills in with a tick. OptionCard adds it for you when you pass onSelect. Use it on its own when an option has a different layout."
      >
        <Demo
          code={`<SelectButton selected={false} onClick={choose} />
<SelectButton selected onClick={choose} />
<SelectButton selected={answer === 'b'} label="Pick B" selectedLabel="Your pick" onClick={() => setAnswer('b')} />`}
          className="items-end gap-6"
        >
          <Specimen label="rest">
            <SelectButton selected={false} className="w-44" />
          </Specimen>
          <Specimen label="selected">
            <SelectButton selected className="w-44" />
          </Specimen>
          <Specimen label="custom labels">
            <SelectToggle />
          </Specimen>
          <Specimen label="disabled" sub="voting closed">
            <SelectButton selected={false} disabled className="w-44 opacity-50" />
          </Specimen>
        </Demo>
      </Section>

      <Section
        id="header-chip"
        title="Header chip"
        description="A small label for the right edge of a card header. With onClick, it's an outlined button, such as Reset or Expand. Without onClick, it's a hint in muted text, such as “Tap to zoom”, and doesn't look like a button."
      >
        <HeaderChipDemo />
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="OptionCard"
          rows={[
            { name: 'letter', type: 'string', description: 'A, B or C, shown in a LetterBadge. Leave it out when the media is shown but not chosen between.' },
            { name: 'title', type: 'ReactNode', description: 'Next to the letter. Cut off after two lines.' },
            { name: 'description', type: 'ReactNode', description: 'A muted line under the header.' },
            { name: 'headerAction', type: 'ReactNode', description: 'On the right of the title, usually a HeaderChip.' },
            { name: 'children', type: 'ReactNode', description: 'The media, centred with 16px of space around it.' },
            { name: 'selected', type: 'boolean', default: 'false', description: 'Adds a strong border, lifts the card and fills the SelectButton.' },
            { name: 'lifted', type: 'boolean', default: 'false', description: 'A strong border and lift, without choosing it. Use it for a hover state you track yourself.' },
            { name: 'dimmed', type: 'boolean', default: 'false', description: 'Fades the card to 35%, so another option stands out.' },
            { name: 'onSelect', type: '() => void', description: 'Adds a SelectButton at the bottom.' },
            { name: 'selectDisabled', type: 'boolean', description: 'Disables the SelectButton.' },
            { name: 'onHoverChange', type: '(hovered: boolean) => void', description: 'Runs when the pointer enters or leaves, and when the SelectButton gains or loses focus.' },
          ]}
        />
        <PropsTable
          title="ChoiceRow"
          rows={[
            { name: 'label', type: 'ReactNode', description: 'The answer, such as “Both feel equal”.' },
            { name: 'selected', type: 'boolean', description: 'Fills in with a tick, and sets aria-pressed.' },
            { name: '…rest', type: 'ButtonHTMLAttributes', description: 'Such as onClick, disabled or className.' },
          ]}
        />
        <PropsTable
          title="SelectButton"
          rows={[
            { name: 'selected', type: 'boolean', description: 'Outlined when false. When true, fills in with a tick and sets aria-pressed.' },
            { name: 'label', type: 'ReactNode', default: "'Select this one'", description: 'The label before it’s chosen.' },
            { name: 'selectedLabel', type: 'ReactNode', default: "'Selected'", description: 'The label once it’s chosen.' },
            { name: '…rest', type: 'ButtonHTMLAttributes', description: 'Such as onClick, disabled or className.' },
          ]}
        />
        <PropsTable
          title="HeaderChip"
          rows={[
            { name: 'children', type: 'ReactNode', description: 'The label.' },
            { name: 'icon', type: 'ReactNode', description: 'Shown before the label on a button, and after it on a hint.' },
            { name: 'onClick', type: '() => void', description: 'With it, the chip is an outlined button. Without it, the chip is muted text.' },
          ]}
        />
      </Section>
    </>
  )
}

/* ------------------------------------------------------------ Comparison */

function Comparison() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [zoomed, setZoomed] = useState<Option | null>(null)

  const picked = OPTIONS.find((o) => o.id === answer)

  return (
    <Demo
      stage="none"
      code={`const [hovered, setHovered] = useState<string | null>(null)
const [answer, setAnswer] = useState<string | null>(null)

<div className="grid gap-4 md:grid-cols-3">
  {options.map((o) => (
    <OptionCard
      key={o.id}
      letter={o.letter}
      title={o.title}
      description={o.description}
      headerAction={<HeaderChip icon={<ArrowsOut size={13} />} onClick={() => setZoomed(o)}>Expand</HeaderChip>}
      selected={answer === o.id}
      lifted={hovered === o.id}
      dimmed={hovered !== null && hovered !== o.id && answer !== o.id}
      onHoverChange={(h) => setHovered(h ? o.id : null)}
      onSelect={() => setAnswer(o.id)}
    >
      <HeroPanel bg={o.bg} src={o.imageUrl} padding={20} className="h-[180px] rounded-xl" />
    </OptionCard>
  ))}
</div>
<ChoiceRow label="No clear favourite" selected={answer === 'none'} onClick={() => setAnswer('none')} />`}
    >
      <div className="pg-stage p-6 @container">
        <div className="grid gap-4 @2xl:grid-cols-3">
          {OPTIONS.map((o) => (
            <OptionCard
              key={o.id}
              letter={o.letter}
              title={o.title}
              description={o.description}
              headerAction={
                <HeaderChip icon={<ArrowsOut size={13} aria-hidden="true" />} onClick={() => setZoomed(o)}>
                  Expand
                </HeaderChip>
              }
              selected={answer === o.id}
              lifted={hovered === o.id}
              dimmed={hovered !== null && hovered !== o.id && answer !== o.id}
              onHoverChange={(h) => setHovered(h ? o.id : null)}
              onSelect={() => setAnswer(o.id)}
            >
              <HeroPanel bg={o.bg} src={o.src} alt={o.title} padding={20} className="h-[180px] rounded-xl" />
            </OptionCard>
          ))}
        </div>
        <ChoiceRow label="No clear favourite" selected={answer === 'none'} onClick={() => setAnswer('none')} className="mt-4" />
        <div className="mt-4 flex items-center justify-between gap-3">
          <Caption>
            {answer === null
              ? 'No answer yet.'
              : answer === 'none'
                ? 'Answer: no clear favourite.'
                : `Answer: ${picked?.letter} · ${picked?.title}.`}
          </Caption>
          {answer !== null && (
            <HeaderChip icon={<ArrowCounterClockwise size={13} aria-hidden="true" />} onClick={() => setAnswer(null)}>
              Reset
            </HeaderChip>
          )}
        </div>
      </div>
      <Lightbox
        open={zoomed !== null}
        onClose={() => setZoomed(null)}
        src={zoomed?.src ?? ''}
        alt={zoomed?.title ?? ''}
        caption={zoomed ? `${zoomed.letter} · ${zoomed.title}` : undefined}
      />
    </Demo>
  )
}

/* ------------------------------------------------------------ Playground */

function OptionPlayground() {
  const [state, setState] = useState<'rest' | 'lifted' | 'selected' | 'dimmed'>('rest')
  const [letter, setLetter] = useState(true)
  const [description, setDescription] = useState(true)
  const [action, setAction] = useState<'none' | 'button' | 'hint'>('hint')
  const [selectable, setSelectable] = useState(true)
  const o = OPTIONS[1]

  const code = `<OptionCard${letter ? `\n  letter="${o.letter}"` : ''}
  title="${o.title}"${description ? `\n  description="${o.description}"` : ''}${
    action === 'button'
      ? '\n  headerAction={<HeaderChip icon={<ArrowCounterClockwise size={13} />} onClick={reset}>Reset</HeaderChip>}'
      : action === 'hint'
        ? '\n  headerAction={<HeaderChip icon={<MagnifyingGlassPlus size={13} />}>Tap to zoom</HeaderChip>}'
        : ''
  }${state !== 'rest' ? `\n  ${state}` : ''}${selectable ? '\n  onSelect={() => setAnswer(option.id)}' : ''}
>
  <HeroPanel bg="${o.bg}" src={option.imageUrl} padding={20} className="h-[180px] rounded-xl" />
</OptionCard>`

  return (
    <Demo
      code={code}
      controls={
        <>
          <KnobSegment label="state" value={state} options={['rest', 'lifted', 'selected', 'dimmed'] as const} onChange={setState} />
          <KnobSegment label="headerAction" value={action} options={['none', 'button', 'hint'] as const} onChange={setAction} />
          <div>
            <KnobToggle label="letter" checked={letter} onChange={setLetter} />
            <KnobToggle label="description" checked={description} onChange={setDescription} />
            <KnobToggle label="onSelect" checked={selectable} onChange={setSelectable} />
          </div>
        </>
      }
    >
      <div className="w-full max-w-[300px]">
        <OptionCard
          letter={letter ? o.letter : undefined}
          title={o.title}
          description={description ? o.description : undefined}
          headerAction={
            action === 'button' ? (
              <HeaderChip icon={<ArrowCounterClockwise size={13} aria-hidden="true" />} onClick={() => setState('rest')}>
                Reset
              </HeaderChip>
            ) : action === 'hint' ? (
              <HeaderChip icon={<MagnifyingGlassPlus size={13} aria-hidden="true" />}>Tap to zoom</HeaderChip>
            ) : undefined
          }
          lifted={state === 'lifted'}
          selected={state === 'selected'}
          dimmed={state === 'dimmed'}
          onSelect={selectable ? () => setState(state === 'selected' ? 'rest' : 'selected') : undefined}
        >
          <HeroPanel bg={o.bg} src={o.src} alt={o.title} padding={20} className="h-[180px] rounded-xl" />
        </OptionCard>
      </div>
    </Demo>
  )
}

/* --------------------------------------------------------------- Pieces */

function ChoiceRowDemo() {
  const [answer, setAnswer] = useState<'a' | 'b' | 'equal' | null>('equal')
  return (
    <Demo
      code={`<SelectButton selected={answer === 'a'} onClick={() => setAnswer('a')} label="Pick A" />
<SelectButton selected={answer === 'b'} onClick={() => setAnswer('b')} label="Pick B" />
<ChoiceRow label="Both feel equal" selected={answer === 'equal'} onClick={() => setAnswer('equal')} />`}
    >
      <div className="w-full max-w-md">
        <div className="grid grid-cols-2 gap-3">
          <SelectButton selected={answer === 'a'} onClick={() => setAnswer('a')} label="Pick A" selectedLabel="Picked A" />
          <SelectButton selected={answer === 'b'} onClick={() => setAnswer('b')} label="Pick B" selectedLabel="Picked B" />
        </div>
        <ChoiceRow label="Both feel equal" selected={answer === 'equal'} onClick={() => setAnswer('equal')} className="mt-3" />
      </div>
    </Demo>
  )
}

function SelectToggle() {
  const [on, setOn] = useState(false)
  return <SelectButton selected={on} onClick={() => setOn((v) => !v)} label="Pick B" selectedLabel="Your pick" className="w-44" />
}

function HeaderChipDemo() {
  const [zoom, setZoom] = useState(false)
  const [resets, setResets] = useState(0)
  return (
    <Demo
      code={`<HeaderChip icon={<ArrowCounterClockwise size={13} />} onClick={reset}>Reset</HeaderChip>
<HeaderChip icon={<MagnifyingGlassPlus size={13} />}>Tap to zoom</HeaderChip>`}
      className="gap-10"
    >
      <Specimen label="with onClick" sub={resets ? `reset ${resets}×` : 'an action'}>
        <HeaderChip icon={<ArrowCounterClockwise size={13} aria-hidden="true" />} onClick={() => setResets((n) => n + 1)}>
          Reset
        </HeaderChip>
      </Specimen>
      <Specimen label="without" sub="a hint">
        <HeaderChip icon={<MagnifyingGlassPlus size={13} aria-hidden="true" />}>Tap to zoom</HeaderChip>
      </Specimen>
      <Specimen label="as an expand" sub="opens a lightbox">
        <HeaderChip icon={<ArrowsOut size={13} aria-hidden="true" />} onClick={() => setZoom(true)}>
          Expand
        </HeaderChip>
      </Specimen>
      <Lightbox open={zoom} onClose={() => setZoom(false)} src={OPTIONS[0].src} alt={OPTIONS[0].title} caption="A · Meadow" />
    </Demo>
  )
}
