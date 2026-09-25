import { useState } from 'react'
import { DatePicker, Field, Table, TBody, TD, TH, THead, toDayString, TR } from 'lightweight-ui'
import { Demo, KnobToggle, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function DatePickerPage() {
  const [value, setValue] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [future, setFuture] = useState(true)
  const today = toDayString(new Date())

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Date picker"
        description={
          <>
            A date field with a calendar that matches the rest of the kit. The native <code className="font-mono">{'<input type="date">'}</code> uses the browser’s own colours and fonts, so it looks out of place. DatePicker keeps the same value format, a local YYYY-MM-DD string, and draws its own calendar.
          </>
        }
      />

      <Section id="playground" title="Playground">
        <Demo
          stage="wash"
          className="min-h-[440px] items-start pt-10"
          code={`<Field subtle label="Expiry date"${invalid ? ' error="Set an expiry date."' : ''}>
  <DatePicker value={date} onChange={setDate}${future ? ` min="${today}"` : ''}${invalid ? ' invalid' : ''} />
</Field>`}
          controls={
            <>
              <KnobToggle label="min = today" checked={future} onChange={setFuture} />
              <KnobToggle label="invalid" checked={invalid} onChange={setInvalid} />
              <p className="text-label text-muted">
                value: <span className="font-mono text-ink">{value ? `'${value}'` : "''"}</span>
              </p>
            </>
          }
        >
          <div className="w-full max-w-[240px]">
            <Field subtle label="Expiry date" error={invalid ? 'Set an expiry date.' : undefined}>
              <DatePicker value={value} onChange={setValue} min={future ? today : undefined} invalid={invalid} />
            </Field>
          </div>
        </Demo>
      </Section>

      <Section id="keyboard" title="Keyboard" description="The calendar grid is a single Tab stop. Inside it, the arrow keys move between days, and focus moves with them so screen readers follow along.">
        <Table>
          <THead>
            <TR>
              <TH className="w-[200px]">Keys</TH>
              <TH>What they do</TH>
            </TR>
          </THead>
          <TBody>
            {[
              ['← → ↑ ↓', 'Move by one day or one week'],
              ['Page Up / Page Down', 'Go to the previous or next month'],
              ['Enter / Space', 'Choose the focused day'],
              ['Escape', 'Close the calendar, not any dialog around it, and return focus to the field'],
            ].map(([k, d]) => (
              <TR key={k}>
                <TD>
                  <kbd className="font-mono text-caption font-medium">{k}</kbd>
                </TD>
                <TD className="text-label text-muted">{d}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="text-label leading-relaxed text-muted">
          The calendar always shows six rows, so it keeps the same height from month to month. It opens on the selected month, or on the current month when no date is set. It lines up with the left or right edge of the field, whichever keeps it in view. Inside a dialog, it checks the dialog’s edges instead of the window’s.
        </p>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          rows={[
            { name: 'value', type: 'string', description: "A local date as 'YYYY-MM-DD', or '' when no date is set." },
            { name: 'onChange', type: '(value: string) => void', description: "Called with the new date, or '' when it’s cleared." },
            { name: 'min / max', type: 'string', description: 'The earliest and latest dates you can pick, in the same format.' },
            { name: 'invalid', type: 'boolean', description: 'Shows a red border.' },
            { name: 'placeholder', type: 'string', default: "'Pick a date'", description: 'Shown in the field when no date is set.' },
            { name: 'toDayString(date)', type: '(Date) → string', description: 'Turns a Date into a local YYYY-MM-DD string.' },
          ]}
        />
      </Section>
    </>
  )
}
