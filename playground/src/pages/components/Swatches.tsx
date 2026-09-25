import { useState } from 'react'
import { Microphone, SquareSplitHorizontal, Star, TextAa, TextAlignLeft } from 'lightweight-ui/icons'
import { ChoiceTile, CustomColorSwatch, HERO_GRADIENTS, HERO_SOLIDS, isCustomHeroBg, Swatch } from 'lightweight-ui'
import { Demo, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function Swatches() {
  const [bg, setBg] = useState('g-ocean')
  const [pageType, setPageType] = useState('feedback')
  const [input, setInput] = useState('rating')
  const custom = isCustomHeroBg(bg)

  return (
    <>
      <PageHeader eyebrow="Components" title="Swatches & tiles" description="Controls for picking a colour or a type of thing. Swatches show colour choices as circles. Choice tiles show types in an even grid, each with an icon above its label." />

      <Section id="swatch" title="Swatch" description="Use swatches to pick a colour. The selected swatch gets an ink border and a soft ring, so it stands out on any colour, including white. The last swatch opens the browser's colour picker, so you can choose any colour.">
        <Demo
          code={`<Swatch background={preset.css} label={preset.label} selected={bg === preset.value} onClick={() => setBg(preset.value)} />
<CustomColorSwatch value={custom ? bg : undefined} selected={custom} onChange={setBg} />`}
          className="flex-col items-start gap-4"
        >
          <div className="flex flex-wrap gap-2">
            {HERO_GRADIENTS.map((p) => (
              <Swatch key={p.value} background={p.css} label={p.label} selected={bg === p.value} onClick={() => setBg(p.value)} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {HERO_SOLIDS.map((p) => (
              <Swatch key={p.value} background={p.css} label={p.label} selected={bg === p.value} onClick={() => setBg(p.value)} />
            ))}
            <CustomColorSwatch value={custom ? bg : undefined} selected={custom} onChange={setBg} />
          </div>
          <p className="text-label text-muted">
            Selected: <span className="font-mono text-ink">{bg}</span>
          </p>
        </Demo>
      </Section>

      <Section id="tile" title="ChoiceTile" description="Use tiles to pick a type of thing, such as a page type or an input type. Use the same control for every choice of this kind, so they look alike wherever they appear.">
        <Demo
          stage="wash"
          code={`<div className="grid grid-cols-2 gap-1.5">
  <ChoiceTile icon={<SquareSplitHorizontal size={14} />} label="Get Vote" selected={type === 'feedback'} onClick={…} />
  <ChoiceTile icon={<TextAlignLeft size={14} />} label="Set Context" selected={type === 'static'} onClick={…} />
</div>`}
        >
          <div className="w-full max-w-[300px] space-y-5 rounded-panel bg-card p-4 shadow-card">
            <div>
              <p className="mb-3 text-ui font-semibold tracking-tight">Page type</p>
              <div className="grid grid-cols-2 gap-1.5">
                <ChoiceTile icon={<SquareSplitHorizontal size={14} />} label="Get Vote" selected={pageType === 'feedback'} onClick={() => setPageType('feedback')} />
                <ChoiceTile icon={<TextAlignLeft size={14} />} label="Set Context" selected={pageType === 'static'} onClick={() => setPageType('static')} />
              </div>
              <p className="mt-3 text-label leading-relaxed text-muted">
                {pageType === 'feedback' ? 'Compare options and collect responses.' : 'Give voters context before they choose: the metric you’re targeting, any constraints and what’s live today.'}
              </p>
            </div>
            <div>
              <p className="mb-3 text-ui font-semibold tracking-tight">Feedback inputs</p>
              <div className="grid grid-cols-3 gap-1.5">
                <ChoiceTile icon={<TextAa size={14} />} label="Text" selected={input === 'text'} onClick={() => setInput('text')} />
                <ChoiceTile icon={<Star size={14} />} label="Rating" selected={input === 'rating'} onClick={() => setInput('rating')} />
                <ChoiceTile icon={<Microphone size={14} />} label="Voice" selected={input === 'voice'} onClick={() => setInput('voice')} />
              </div>
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Swatch"
          rows={[
            { name: 'background', type: 'string', description: 'Any CSS background, such as a hex colour or a gradient.' },
            { name: 'label', type: 'string', description: 'The colour’s name. Screen readers announce it, and it shows on hover.' },
            { name: 'selected / onClick', type: 'boolean / () => void', description: 'Whether it’s the chosen colour, and what happens when it’s clicked.' },
            { name: 'size', type: 'number', default: '32', description: 'Diameter in px.' },
          ]}
        />
        <PropsTable
          title="CustomColorSwatch"
          rows={[
            { name: 'value', type: 'string | undefined', description: 'The chosen hex colour. Shows a rainbow until one is picked.' },
            { name: 'onChange', type: '(hex: string) => void', description: 'Called with the hex from the browser’s colour picker.' },
            { name: 'selected / size', type: 'boolean / number', description: 'Same as Swatch.' },
          ]}
        />
        <PropsTable
          title="ChoiceTile"
          rows={[
            { name: 'icon / label', type: 'ReactNode', description: 'An icon shown above the label.' },
            { name: 'selected', type: 'boolean', description: 'Adds an ink border and a light tint, and sets aria-pressed.' },
            { name: '…rest', type: 'ButtonHTMLAttributes', description: 'Any button attribute, such as disabled, draggable or onDragStart.' },
          ]}
        />
      </Section>
    </>
  )
}
