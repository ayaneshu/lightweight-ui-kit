import { useState } from 'react'
import { ArrowRight, ArrowsOut, Bell, DotsThreeVertical, Plus, SlidersHorizontal, Trash, X } from 'lightweight-ui/icons'
import { Button, buttonClasses, IconButton, type ButtonSize, type ButtonVariant, type IconButtonSize, type IconButtonVariant } from 'lightweight-ui'
import { Demo, KnobSegment, KnobText, KnobToggle, PageHeader, PropsTable, Section, Specimen } from '../../ui/Demo'

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'soft', 'ghost', 'danger', 'danger-outline', 'link']
const SIZES: ButtonSize[] = ['sm', 'md', 'lg']

export default function Buttons() {
  const [variant, setVariant] = useState<ButtonVariant>('primary')
  const [size, setSize] = useState<ButtonSize>('lg')
  const [label, setLabel] = useState('Publish form')
  const [icon, setIcon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [block, setBlock] = useState(false)

  const code = `<Button${variant !== 'primary' ? ` variant="${variant}"` : ''}${size !== 'lg' ? ` size="${size}"` : ''}${block ? ' block' : ''}${loading ? ' loading' : ''}${disabled ? ' disabled' : ''}${icon ? ' trailingIcon={<ArrowRight size={15} />}' : ''}>
  ${label}
</Button>`

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Buttons"
        description="Give each screen or dialog one primary button, for its main action. Other actions step down in weight: secondary has a thin border, soft has a light tint, and ghost is plain text until you hover it. Every button shrinks to 97% while you hold it down."
      />

      <Section id="playground" title="Playground">
        <Demo
          code={code}
          codeOpen
          controls={
            <>
              <KnobSegment label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
              <KnobSegment label="size" value={size} options={SIZES} onChange={setSize} />
              <KnobText label="children" value={label} onChange={setLabel} />
              <div>
                <KnobToggle label="trailingIcon" checked={icon} onChange={setIcon} />
                <KnobToggle label="loading" checked={loading} onChange={setLoading} />
                <KnobToggle label="disabled" checked={disabled} onChange={setDisabled} />
                <KnobToggle label="block" checked={block} onChange={setBlock} />
              </div>
            </>
          }
        >
          <div className={block ? 'w-full max-w-sm' : undefined}>
            <Button
              variant={variant}
              size={size}
              loading={loading}
              disabled={disabled}
              block={block}
              trailingIcon={icon ? <ArrowRight size={15} aria-hidden="true" /> : undefined}
            >
              {label}
            </Button>
          </div>
        </Demo>
      </Section>

      <Section id="variants" title="Variants" description="Ordered from most to least emphasis. Use solid danger only on the button that confirms a destructive action. In a settings list, use danger-outline.">
        <Demo
          code={VARIANTS.map((v) => `<Button variant="${v}">…</Button>`).join('\n')}
          className="gap-3"
        >
          <Button>Publish form</Button>
          <Button variant="secondary">Review form</Button>
          <Button variant="soft" size="sm">
            View results
          </Button>
          <Button variant="ghost" size="md">
            Clear
          </Button>
          <Button variant="danger" size="md">
            Delete page
          </Button>
          <Button variant="danger-outline" size="sm">
            Delete option
          </Button>
          <Button variant="link">Move back to draft</Button>
        </Demo>
      </Section>

      <Section id="sizes" title="Sizes" description="Use lg (16px corner radius) for the main actions on a page, md (14px) in dialog footers, and sm (12px) for actions in a table row or card footer.">
        <Demo code={SIZES.map((s) => `<Button size="${s}">Size ${s}</Button>`).join('\n')} className="items-end gap-6">
          {SIZES.map((s) => (
            <Specimen key={s} label={s} sub={s === 'lg' ? '16px radius' : s === 'md' ? '14px radius' : '12px radius'}>
              <Button size={s}>Continue</Button>
            </Specimen>
          ))}
        </Demo>
      </Section>

      <Section id="icons" title="With icons" description="Use Phosphor icons at 15px, regular weight. Put an icon before the label to show what the action works on, as in ＋ New form. Put it after the label to show direction, as in Continue →.">
        <Demo
          code={`<Button leadingIcon={<Plus size={15} />}>New form</Button>
<Button variant="secondary" trailingIcon={<ArrowRight size={15} />}>Open voter link</Button>
<Button loading>Publishing…</Button>`}
          className="gap-3"
        >
          <Button leadingIcon={<Plus size={15} aria-hidden="true" />}>New form</Button>
          <Button variant="secondary" trailingIcon={<ArrowRight size={15} aria-hidden="true" />}>
            Open voter link
          </Button>
          <Button loading>Publishing…</Button>
        </Demo>
      </Section>

      <Section id="as-link" title="As a link" description="When a button has to be a different element, such as a router Link, an <a>, or a <label> around a file input, use buttonClasses() to give it the same styles.">
        <Demo code={`<a href="/creator" className={buttonClasses({ variant: 'secondary' })}>Sign in</a>`}>
          <a href="#/buttons" className={buttonClasses({ variant: 'secondary' })}>
            Sign in
          </a>
          <a href="#/buttons" className={buttonClasses({ size: 'lg' })}>
            Go to your workspace <ArrowRight size={15} aria-hidden="true" />
          </a>
        </Demo>
      </Section>

      <Section id="icon-buttons" title="Icon buttons" description="Every icon button needs a label. Screen readers announce it, and the tooltip prop also shows it on hover. Use ghost on plain backgrounds and the other variants on images.">
        <IconButtonPlayground />
        <Demo
          title="On images"
          description="Solid and overlay are dark and slightly see-through. Glass also blurs what's behind it, so it stays readable on any thumbnail. Light is a white chip."
          stage="none"
          code={`<IconButton label="Expand" variant="solid" shape="square"><ArrowsOut size={17} /></IconButton>
<IconButton label="View full screen" variant="overlay" size="md" shape="square">…</IconButton>
<IconButton label="More actions" variant="glass" size="md">…</IconButton>
<IconButton label="Delete" variant="light" size="md" shape="square">…</IconButton>`}
        >
          <div className="relative flex min-h-[200px] items-center justify-center gap-2 overflow-hidden bg-[linear-gradient(158deg,#6f6df2_0%,#7b4fd8_44%,#3b2a86_100%)] p-8">
            <IconButton label="Expand" variant="solid" shape="square" tooltip>
              <ArrowsOut size={17} />
            </IconButton>
            <IconButton label="Edit" variant="solid" shape="square" tooltip>
              <SlidersHorizontal size={17} />
            </IconButton>
            <IconButton label="View full screen" variant="overlay" size="md" shape="square" tooltip>
              <ArrowsOut size={16} />
            </IconButton>
            <IconButton label="More actions" variant="glass" size="md" tooltip>
              <DotsThreeVertical size={16} weight="bold" />
            </IconButton>
            <IconButton label="Delete" variant="light" size="md" shape="square" tooltip>
              <Trash size={16} />
            </IconButton>
          </div>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Button"
          rows={[
            { name: 'variant', type: "'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'danger-outline' | 'link'", default: "'primary'", description: 'How much emphasis the button has.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'lg'", description: 'sm for row actions, md for dialog footers, lg for page actions.' },
            { name: 'block', type: 'boolean', default: 'false', description: 'Fills the width of its container.' },
            { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner in place of the leading icon and ignores presses.' },
            { name: 'leadingIcon / trailingIcon', type: 'ReactNode', description: 'An icon before or after the label.' },
            { name: '…rest', type: 'ButtonHTMLAttributes', description: 'Passed to the <button>, along with ref.' },
          ]}
        />
        <PropsTable
          title="IconButton"
          rows={[
            { name: 'label', type: 'string', description: 'Required. The name screen readers announce.' },
            { name: 'variant', type: "'ghost' | 'solid' | 'overlay' | 'glass' | 'light'", default: "'ghost'", description: 'Pick one to suit the background behind the button.' },
            { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'lg'", description: '20 / 28 / 32 / 36px.' },
            { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'circle is a true circle. square uses the kit’s smoothed corners.' },
            { name: 'tooltip', type: "boolean | 'top' | 'bottom'", default: 'false', description: 'Shows the label in a tooltip on hover, above or below.' },
            { name: 'pressed', type: 'boolean', description: 'For toggle buttons. Sets aria-pressed.' },
          ]}
        />
      </Section>
    </>
  )
}

function IconButtonPlayground() {
  const [variant, setVariant] = useState<IconButtonVariant>('ghost')
  const [size, setSize] = useState<IconButtonSize>('lg')
  const [shape, setShape] = useState<'circle' | 'square'>('circle')
  const onDark = variant !== 'ghost'
  return (
    <Demo
      stage={onDark ? 'none' : 'dots'}
      code={`<IconButton label="Updates" variant="${variant}" size="${size}" shape="${shape}" tooltip>
  <Bell size={18} />
</IconButton>`}
      controls={
        <>
          <KnobSegment label="variant" value={variant} options={['ghost', 'solid', 'overlay', 'glass', 'light'] as const} onChange={setVariant} />
          <KnobSegment label="size" value={size} options={['xs', 'sm', 'md', 'lg'] as const} onChange={setSize} />
          <KnobSegment label="shape" value={shape} options={['circle', 'square'] as const} onChange={setShape} />
        </>
      }
    >
      <div
        className={
          onDark
            ? 'flex min-h-[180px] w-full items-center justify-center gap-3 bg-[linear-gradient(158deg,#45d2a9_0%,#1da98c_46%,#0d5f4d_100%)] p-8'
            : 'flex items-center gap-3'
        }
      >
        <IconButton label="Updates" variant={variant} size={size} shape={shape} tooltip>
          <Bell size={size === 'xs' ? 12 : size === 'sm' ? 14 : 18} />
        </IconButton>
        <IconButton label="Close" variant={variant} size={size} shape={shape} tooltip>
          <X size={size === 'xs' ? 12 : size === 'sm' ? 14 : 17} />
        </IconButton>
        <IconButton label="More actions" variant={variant} size={size} shape={shape} tooltip>
          <DotsThreeVertical size={size === 'xs' ? 12 : 16} weight="bold" />
        </IconButton>
      </div>
    </Demo>
  )
}
