import { useState } from 'react'
import { Checkbox, CopyField, Field, FieldRow, InlineInput, InlineTextarea, Input, SearchInput, Select, Textarea, ValueBox } from 'lightweight-ui'
import { Demo, KnobSegment, KnobText, KnobToggle, PageHeader, PropsTable, Section } from '../../ui/Demo'

const PODS = ['Checkout', 'Customer', 'Delivery', 'Growth', 'Loyalty', 'Reviews', 'Sales', 'Storefront']

export default function Inputs() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [invalid, setInvalid] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [placeholder, setPlaceholder] = useState('Checkout redesign feedback')
  const [value, setValue] = useState('')
  const [pod, setPod] = useState('')
  const [q, setQ] = useState('')
  const [title, setTitle] = useState('Which checkout reads faster?')
  const [body, setBody] = useState('')
  const [option, setOption] = useState('Option A')
  const [neutral, setNeutral] = useState('')
  const [alt, setAlt] = useState('')

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Inputs"
        description="Text fields and selects share one look: 12px corners and a border with at least 3:1 contrast. Focus shows on the field itself, not as a ring around it: the border turns ink. Inline editors have no border, so their background darkens instead. Invalid fields turn red. The label goes above the field and the hint below. An error replaces the hint rather than adding a second line."
      />

      <Section id="playground" title="Input">
        <Demo
          stage="wash"
          code={`<Field label="Form name"${invalid ? ' error="Give the form a name."' : ' hint="Shown on the dashboard and in results."'}>
  <Input${size !== 'md' ? ` size="${size}"` : ''}${invalid ? ' invalid' : ''}${disabled ? ' disabled' : ''} placeholder="${placeholder}" />
</Field>`}
          controls={
            <>
              <KnobSegment label="size" value={size} options={['sm', 'md', 'lg'] as const} onChange={setSize} />
              <KnobText label="placeholder" value={placeholder} onChange={setPlaceholder} />
              <KnobToggle label="invalid" checked={invalid} onChange={setInvalid} />
              <KnobToggle label="disabled" checked={disabled} onChange={setDisabled} />
            </>
          }
        >
          <div className="w-full max-w-sm">
            <Field label="Form name" hint="Shown on the dashboard and in results." error={invalid ? 'Give the form a name.' : undefined}>
              <Input size={size} invalid={invalid} disabled={disabled} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
          </div>
        </Demo>
      </Section>

      <Section id="fields" title="Fields" description="Field places a label above a control and a hint or error below it. It also connects them for screen readers: the label names the control and the message describes it. In a dialog made only of fields, use subtle. It makes the labels 13px and muted, so they don't compete with the values.">
        <Demo
          stage="wash"
          className="items-start"
          code={`<Field subtle label="Pod">
  <Select placeholder="Select…" value={pod} onChange={(e) => setPod(e.target.value)}>
    {pods.map((p) => <option key={p}>{p}</option>)}
  </Select>
</Field>
<Field label="Alt text" hint={\`\${alt.length}/125\`}>
  <Textarea rows={2} placeholder="Describe the image for screen readers…" />
</Field>`}
        >
          <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
            <Field subtle label="Pod">
              <Select placeholder="Select…" value={pod} onChange={(e) => setPod(e.target.value)}>
                {PODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field subtle label="Access">
              <Select defaultValue="view" size="md">
                <option value="edit">Can edit</option>
                <option value="view">Can view</option>
              </Select>
            </Field>
            <Field label="Alt text" hint={`${alt.length}/125`} className="sm:col-span-2">
              <Textarea rows={2} value={alt} onChange={(e) => setAlt(e.target.value.slice(0, 125))} placeholder="Describe the image for screen readers…" />
            </Field>
            <div className="sm:col-span-2">
              <FieldRow label="Brightness">
                <ValueBox>0</ValueBox>
              </FieldRow>
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="search" title="Search" description="A rounded search field on a light tint. When focused, it gets a solid background and an ink border. Press Escape to clear it, or use the × that appears once you've typed something.">
        <Demo code={`<SearchInput value={q} onChange={setQ} placeholder="Search forms" />`}>
          <SearchInput value={q} onChange={setQ} placeholder="Search forms" className="w-[220px]" />
        </Demo>
      </Section>

      <Section
        id="inline"
        title="Inline editing"
        description="Borderless fields that look like the text they edit, so people can change it in place without a separate form. They show a light tint on hover and a darker one while you type. InlineTextarea grows with its content."
      >
        <Demo
          stage="plain"
          className="block"
          code={`<InlineTextarea value={title} onChange={setTitle} aria-label="Question"
  placeholder="What are we comparing?" className="px-2 py-1 font-pixel text-2xl font-medium tracking-tight" />
<InlineTextarea value={body} onChange={setBody} aria-label="Context"
  placeholder="Add context for this page… (optional)" className="px-2 py-1 text-body leading-relaxed text-muted" />
<InlineInput value={neutral} onChange={setNeutral} aria-label="Neutral answer wording"
  placeholder="Both feel equal" className="u-placeholder-strong …" />`}
        >
          <div className="mx-auto max-w-xl space-y-1">
            <InlineTextarea value={title} onChange={setTitle} aria-label="Question" placeholder="What are we comparing?" className="px-2 py-1 font-pixel text-2xl font-medium tracking-tight" />
            <InlineTextarea value={body} onChange={setBody} aria-label="Context" placeholder="Add context for this page… (optional)" className="px-2 py-1 text-body leading-relaxed text-muted" />
            <div className="mt-4 flex items-start gap-2 rounded-2xl px-4 py-2.5 bg-ink/[0.03]">
              <span className="cursor-default select-none mt-1 grid h-6 w-6 flex-none place-items-center rounded-md bg-ink/[0.06] text-label font-bold">A</span>
              <div className="min-w-0 flex-1">
                <InlineInput value={option} onChange={setOption} aria-label="Option A name" placeholder="One-page checkout" className="px-1.5 py-0.5 text-body font-semibold tracking-tight" />
                <InlineInput value="" onChange={() => {}} aria-label="Option A description" placeholder="Address and payment on a single page" className="px-1.5 py-0.5 text-label text-muted" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-ink/[0.03]">
              <Checkbox defaultChecked aria-label="Offer the neutral answer" />
              <InlineInput value={neutral} onChange={setNeutral} placeholder="Both feel equal" aria-label="Neutral answer wording" className="u-placeholder-strong min-w-0 flex-1 px-1.5 py-0.5 text-ui font-medium" />
              <span className="text-caption text-muted">Visible to voters</span>
            </div>
            <InlineTextarea value="" onChange={() => {}} invalid aria-label="Introduction context" placeholder="We’re testing two checkout layouts before launch." className="mt-3 px-2 py-1 text-body" />
          </div>
        </Demo>
        <p className="text-label text-muted">
          Use <code className="font-mono">.u-placeholder-strong</code> when the placeholder <em>is</em> the value that will be used, such as a default people can replace. It’s lighter than typed text but darker than a normal placeholder.
        </p>
      </Section>

      <Section id="copy" title="Copy field" description="A read-only value with a Copy button. After a copy, the button briefly shows Copied. If the browser blocks the clipboard, the text is selected so you can copy it yourself.">
        <Demo code={`<CopyField value="https://forms.example.com/f/checkout-v3" inputLabel="Voter link" />`}>
          <CopyField value="https://forms.example.com/f/checkout-v3" inputLabel="Voter link" className="w-full max-w-md" />
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Field"
          rows={[
            { name: 'label', type: 'ReactNode', description: 'Shown above the control.' },
            { name: 'hint', type: 'ReactNode', description: 'Muted text below the control.' },
            { name: 'error', type: 'ReactNode', description: 'Shown in red in place of the hint. It also marks the kit control inside as invalid.' },
            { name: 'subtle', type: 'boolean', default: 'false', description: 'Makes the label 13px and muted.' },
          ]}
        />
        <PropsTable
          title="Input · Textarea · Select"
          rows={[
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'sm is 32px tall, md is sized by its padding, lg is 44px tall.' },
            { name: 'invalid', type: 'boolean', default: 'false', description: 'Shows a red border and sets aria-invalid.' },
            { name: 'Textarea.autoGrow', type: 'boolean', default: 'false', description: 'Grows with the content, using CSS field-sizing.' },
            { name: 'Select.placeholder', type: 'string', description: 'Adds an empty first option, shown muted while it’s selected.' },
            { name: 'fieldClasses()', type: '({ invalid, size }) → string', description: 'Returns the same classes, for styling your own controls.' },
          ]}
        />
        <PropsTable
          title="SearchInput · InlineInput · InlineTextarea · CopyField"
          rows={[
            { name: 'value / onChange', type: 'string / (v: string) => void', description: 'Controlled. onChange receives the new string, not the event.' },
            { name: 'invalid', type: 'boolean', description: 'Inline editors only. Adds a red tint and a red ring.' },
            { name: 'CopyField.label', type: 'string', default: "'Copy'", description: 'The button text.' },
          ]}
        />
      </Section>
    </>
  )
}
