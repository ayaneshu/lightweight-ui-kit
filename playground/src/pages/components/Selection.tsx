import { useState } from 'react'
import { Checkbox, Rating, RadioGroup, Slider, Switch, Toggle } from 'lightweight-ui'
import { Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function Selection() {
  const [checked, setChecked] = useState(true)
  const [picked, setPicked] = useState<string[]>(['Title', 'Context'])
  const ALL_PARTS = ['Title', 'Context', 'Media', 'Answer']
  const [sw, setSw] = useState(true)
  const [results, setResults] = useState(true)
  const [half, setHalf] = useState(false)
  const [required, setRequired] = useState(false)
  const [choice, setChoice] = useState<string | null>('The second one')
  const [slider, setSlider] = useState(62)
  const [brightness, setBrightness] = useState(0)
  const [variant, setVariant] = useState<'labeled' | 'compact'>('labeled')
  const [rating, setRating] = useState(3.5)
  const [allowHalf, setAllowHalf] = useState(true)
  const [ratingDisabled, setRatingDisabled] = useState(false)

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Selection controls"
        description="Switches, checkboxes, radio buttons, sliders and star ratings. They all use ink to show what's selected: the switch track, the checkbox, the radio dot, the filled stars and the slider fill. Nothing turns blue."
      />

      <Section
        id="toggle"
        title="Toggle & Switch"
        description="Use Toggle for a setting. It's one row, with the label and hint on the left and the switch on the right, and you can press anywhere on the row. Use Switch on its own when the label is somewhere else. While you hold the switch, its knob stretches toward the side it's moving to."
      >
        <Demo
          stage="wash"
          code={`<Toggle
  checked={results}
  onChange={setResults}
  label="Let voters see results"
  hint="Show the aggregate tally on the end screen after they submit."
/>
<Switch checked={on} onChange={setOn} label="Dither" />`}
        >
          <div className="w-full max-w-sm space-y-1 rounded-panel bg-card p-3 shadow-card">
            <Toggle checked={results} onChange={setResults} label="Let voters see results" hint="Show the aggregate tally on the end screen after they submit." />
            <Toggle checked={half} onChange={setHalf} label="Allow half stars" hint="Voters can give half-star ratings, like 3.5." />
            <Toggle checked={required} onChange={setRequired} label="Require an answer" hint="Voters must answer this before they submit." />
            <Toggle checked={false} onChange={() => {}} disabled label="Require sign-in" hint="Available once your workspace has single sign-on (SSO)." />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={sw} onChange={setSw} label="Dither" />
            <span className="text-ui font-medium">{sw ? 'On' : 'Off'}</span>
          </div>
        </Demo>
      </Section>

      <Section
        id="checkbox"
        title="Checkbox"
        description="A native checkbox with the kit's own styling, so forms, labels and keyboards work as usual. The box shrinks slightly when pressed, and the tick draws itself in when checked. For a “select all” box when only some items are selected, use indeterminate. It shows a dash."
      >
        <Demo
          code={`<Checkbox label="Offer “Both feel equal”" checked={checked} onChange={(e) => setChecked(e.target.checked)} />

// Select all — indeterminate while some but not all are picked
<Checkbox
  label="All parts"
  checked={picked.length === parts.length}
  indeterminate={picked.length > 0 && picked.length < parts.length}
  onChange={(e) => setPicked(e.target.checked ? parts : [])}
/>`}
          className="items-start gap-10"
        >
          <div className="flex flex-col items-start gap-3">
            <Checkbox label="Offer “Both feel equal”" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <Checkbox label="Decorative image" />
            <Checkbox label="Locked" disabled checked readOnly />
          </div>
          <div className="flex flex-col items-start gap-3">
            <Checkbox
              label="All parts"
              checked={picked.length === ALL_PARTS.length}
              indeterminate={picked.length > 0 && picked.length < ALL_PARTS.length}
              onChange={(e) => setPicked(e.target.checked ? ALL_PARTS : [])}
            />
            <div className="flex flex-col gap-2.5 border-s border-line ps-4">
              {ALL_PARTS.map((part) => (
                <Checkbox
                  key={part}
                  label={part}
                  checked={picked.includes(part)}
                  onChange={(e) => setPicked((p) => (e.target.checked ? [...p, part] : p.filter((x) => x !== part)))}
                />
              ))}
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="radio" title="RadioGroup" description="Use for picking one option from a short list. Each choice is a full-width row. The chosen row gets a light tint and a filled dot; the others keep a thin border. Tab moves into the group, and the arrow keys move between choices.">
        <Demo
          stage="wash"
          code={`<RadioGroup
  label="Which felt quicker?"
  options={['The first one', 'The second one', 'No difference']}
  value={choice}
  onChange={setChoice}
/>`}
        >
          <div className="w-full max-w-sm">
            <p className="mb-2 text-body font-medium">
              Which felt quicker to scan?<span className="ms-1 text-danger">*</span>
            </p>
            <RadioGroup label="Which felt quicker to scan?" options={['The first one', 'The second one', 'No difference']} value={choice} onChange={setChoice} />
          </div>
        </Demo>
      </Section>

      <Section
        id="slider"
        title="Slider"
        description="Use the labeled variant for an answer on a scale: both ends are named and the value sits between them. Use compact for a setting, with the value in a small box beside the track. The track fills with ink up to the value. The thumb grows when you hover it and again while you drag."
      >
        <Demo
          code={
            variant === 'labeled'
              ? `<Slider value={value} onChange={setValue} minLabel="Not confident" maxLabel="Very confident" />`
              : `<Slider variant="compact" min={-100} max={100} value={brightness} onChange={setBrightness} />`
          }
          controls={<KnobSegment label="variant" value={variant} options={['labeled', 'compact'] as const} onChange={setVariant} />}
        >
          <div className="w-full max-w-sm">
            {variant === 'labeled' ? (
              <Slider value={slider} onChange={setSlider} minLabel="Not confident" maxLabel="Very confident" label="Confidence" />
            ) : (
              <Slider variant="compact" min={-100} max={100} value={brightness} onChange={setBrightness} label="Brightness" />
            )}
          </div>
        </Demo>
      </Section>

      <Section id="rating" title="Rating" description="A five-star rating, 30px per star. Hovering previews the rating under the pointer, and the arrow keys change it. With allowHalf, each star splits into two halves you can pick. Empty and filled stars use two weights of the same Phosphor icon, because an outline drawn at the filled weight looks heavier than the other icons.">
        <Demo
          code={`<Rating value={rating} onChange={setRating}${allowHalf ? ' allowHalf' : ''}${ratingDisabled ? ' disabled' : ''} />
<Rating value={4} readOnly size={16} />`}
          controls={
            <>
              <KnobToggle label="allowHalf" checked={allowHalf} onChange={setAllowHalf} />
              <KnobToggle label="disabled" checked={ratingDisabled} onChange={setRatingDisabled} />
            </>
          }
        >
          <div className="flex flex-col items-center gap-3">
            <Rating value={rating} onChange={setRating} allowHalf={allowHalf} disabled={ratingDisabled} />
            <p className="text-label tabular-nums text-muted">{rating} / 5</p>
            <Rating value={4} readOnly size={16} />
          </div>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Toggle · Switch"
          rows={[
            { name: 'checked / onChange', type: 'boolean / (v: boolean) => void', description: 'Controlled. Uses role="switch", so screen readers announce it as a switch.' },
            { name: 'label / hint', type: 'ReactNode', description: 'Toggle shows both. Switch takes only label, as its accessible name.' },
            { name: 'disabled', type: 'boolean', description: 'Fades the control and ignores presses.' },
          ]}
        />
        <PropsTable
          title="RadioGroup"
          rows={[
            { name: 'options', type: 'string[] | { value, label, description? }[]', description: 'The choices, as strings or as objects with an optional description.' },
            { name: 'value / onChange', type: 'string | null / (v: string) => void', description: 'Controlled. value is null when nothing is chosen.' },
            { name: 'label', type: 'string', description: 'Names the group for screen readers.' },
          ]}
        />
        <PropsTable
          title="Slider"
          rows={[
            { name: 'value / onChange', type: 'number / (n: number) => void', description: 'Controlled.' },
            { name: 'min / max / step', type: 'number', default: '0 / 100 / 1', description: 'The range and the size of each step.' },
            { name: 'variant', type: "'labeled' | 'compact'", default: "'labeled'", description: 'labeled for answers, compact for settings.' },
            { name: 'minLabel / maxLabel', type: 'ReactNode', description: 'Text for each end. Defaults to the min and max numbers.' },
          ]}
        />
        <PropsTable
          title="Rating"
          rows={[
            { name: 'value / onChange', type: 'number / (n: number) => void', description: 'From 0 to max.' },
            { name: 'allowHalf', type: 'boolean', default: 'false', description: 'Allows half-star ratings.' },
            { name: 'max / size', type: 'number', default: '5 / 30', description: 'Number of stars, and each star’s size in px.' },
            { name: 'readOnly / disabled', type: 'boolean', description: 'readOnly only displays a rating. disabled locks it, for example after submitting.' },
          ]}
        />
      </Section>
    </>
  )
}
