import { useState } from 'react'
import { Check, Code, Copy } from 'lightweight-ui/icons'
import { cn, Eyebrow, Heading, Input, SegmentedControl, Table, TBody, TD, TH, THead, Toggle, TR } from 'lightweight-ui'

/* --------------------------------------------------------------- Page chrome */

/** Prose with `backticks` set as inline code — so descriptions can name props. */
export function Prose({ children }: { children: React.ReactNode }) {
  if (typeof children !== 'string' || !children.includes('`')) return <>{children}</>
  return (
    <>
      {children.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code key={i} className="rounded-md bg-ink/[0.05] px-1 py-px font-mono text-[0.9em] text-ink">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="mb-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading size="display-lg" className="mt-1">
        {title}
      </Heading>
      {description && (
        <p className="mt-4 max-w-2xl text-body leading-relaxed text-pretty text-muted">
          <Prose>{description}</Prose>
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </header>
  )
}

/** A titled block of a page. Registers itself with the "On this page" rail. */
export function Section({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} data-section={title} className={cn('mb-16 scroll-mt-20', className)}>
      <h2 className="font-pixel text-2xl font-medium tracking-tight">{title}</h2>
      {description && (
        <p className="mt-2 max-w-2xl text-ui leading-relaxed text-pretty text-muted">
          <Prose>{description}</Prose>
        </p>
      )}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  )
}

/* -------------------------------------------------------------------- Demo */

export interface DemoProps {
  title?: string
  description?: React.ReactNode
  code?: string
  /** Knobs, rendered in a panel beside the stage. */
  controls?: React.ReactNode
  stage?: 'dots' | 'plain' | 'wash' | 'checker' | 'none'
  /** Classes for the stage's inner layout. */
  className?: string
  /** Start with the code open. */
  codeOpen?: boolean
  children: React.ReactNode
}

/**
 * A live example: a stage, optional knobs, and the code that produced it.
 * One bordered box, with hairlines between its parts — in dark mode a fill
 * alone can't tell the stage, the knobs and the code apart.
 */
export function Demo({ title, description, code, controls, stage = 'dots', className, codeOpen = false, children }: DemoProps) {
  const [showCode, setShowCode] = useState(codeOpen)
  return (
    <div>
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="font-sans text-body font-semibold tracking-tight">{title}</h3>}
          {description && (
            <p className="mt-0.5 max-w-2xl text-ui leading-relaxed text-pretty text-muted">
              <Prose>{description}</Prose>
            </p>
          )}
        </div>
      )}
      <div className="overflow-hidden rounded-panel border border-line bg-card">
        <div className={cn('grid', controls && 'md:grid-cols-[minmax(0,1fr)_260px]')}>
          <div
            className={cn(
              'min-w-0',
              stage === 'dots' && 'pg-stage',
              stage === 'checker' && 'pg-checker',
              stage !== 'none' && 'flex min-h-[180px] flex-wrap items-center justify-center gap-4 p-8',
              className,
            )}
          >
            {children}
          </div>
          {controls && (
            <div className="space-y-4 border-t border-line p-4 md:border-s md:border-t-0">
              <p className="text-micro font-semibold uppercase tracking-[0.06em] text-muted">Props</p>
              {controls}
            </div>
          )}
        </div>
        {code && (
          <div>
            <div className="flex items-center justify-between border-t border-line px-3 py-2">
              <button
                type="button"
                onClick={() => setShowCode((s) => !s)}
                aria-expanded={showCode}
                className="u-press inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-label font-medium text-muted hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2"
              >
                <Code size={14} aria-hidden="true" />
                {showCode ? 'Hide code' : 'Show code'}
              </button>
              <CopyButton text={code} />
            </div>
            {showCode && (
              <div className="u-swap border-t border-line bg-ink/[0.02]">
                <CodeView code={code} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- Code */

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        } catch {
          /* clipboard blocked */
        }
      }}
      className="u-press inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-label font-medium text-muted hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2"
    >
      {copied ? <Check size={13} weight="bold" aria-hidden="true" className="u-icon-in" /> : <Copy size={13} aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

/** A standalone code block with a copy button. */
export function CodeBlock({ code, title, className }: { code: string; title?: string; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-line bg-card', className)}>
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="px-1 font-mono text-caption text-muted">{title ?? ''}</span>
        <CopyButton text={code} />
      </div>
      <CodeView code={code} />
    </div>
  )
}

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?)([A-Za-z][\w.]*)|\b(import|from|export|const|let|function|return|default|type|interface|await|async|if|else|new)\b|([A-Za-z-]+)(?==)|(@[a-z-]+)/g

/** Just enough highlighting to scan — strings, tags, props, keywords. */
function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of code.matchAll(TOKEN)) {
    const at = m.index ?? 0
    if (at > last) out.push(code.slice(last, at))
    const [whole, comment, str, lt, tag, kw, attr, at_] = m
    const k = i++
    if (comment) out.push(<span key={k} className="italic text-muted">{comment}</span>)
    else if (str) out.push(<span key={k} className="text-code-string">{str}</span>)
    else if (tag)
      out.push(
        <span key={k}>
          <span className="text-muted">{lt}</span>
          <span className="font-semibold text-ink">{tag}</span>
        </span>,
      )
    else if (kw) out.push(<span key={k} className="text-code-keyword">{kw}</span>)
    else if (attr) out.push(<span key={k} className="text-code-attr">{attr}</span>)
    else if (at_) out.push(<span key={k} className="text-code-keyword">{at_}</span>)
    else out.push(whole)
    last = at + whole.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

export function CodeView({ code }: { code: string }) {
  return (
    // Focusable so keyboard users can scroll a long line into view.
    <pre tabIndex={0} aria-label="Code example" className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-ink/90 focus-visible:-outline-offset-2">
      <code>{highlight(code.trim())}</code>
    </pre>
  )
}

/* ------------------------------------------------------------------ Knobs */

export function KnobSegment<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="mb-1.5 text-label font-medium text-muted">{label}</p>
      <SegmentedControl
        items={options.map((o) => ({ value: o, label: o }))}
        value={value}
        onChange={onChange}
        label={label}
        className="flex-wrap"
      />
    </div>
  )
}

export function KnobToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <Toggle label={label} checked={checked} onChange={onChange} className="-mx-1 py-1" />
}

export function KnobText({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-label font-medium text-muted">{label}</span>
      <Input size="sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

/* ------------------------------------------------------------- Props table */

export interface PropRow {
  name: string
  type: string
  default?: string
  description: React.ReactNode
}

/** A component's props, set in the kit's own Table. */
export function PropsTable({ rows, title = 'Props' }: { rows: PropRow[]; title?: string }) {
  return (
    <div>
      <h3 className="mb-2 font-sans text-ui font-semibold">{title}</h3>
      <ScrollTable label={`${title} props`}>
        <Table className="min-w-[560px]">
          <THead>
            <TR>
              <TH>Prop</TH>
              <TH>Type</TH>
              <TH>Default</TH>
              <TH>Description</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.name}>
                <TD className="font-mono text-[12.5px] font-medium">{r.name}</TD>
                <TD className="font-mono text-[12px] text-code-string">{r.type}</TD>
                <TD className="font-mono text-[12px] text-muted">{r.default ?? '—'}</TD>
                <TD className="text-label leading-relaxed text-pretty text-muted">
                  <Prose>{r.description}</Prose>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </ScrollTable>
    </div>
  )
}

/** A table that can scroll sideways on a phone — focusable, so a keyboard can scroll it too. */
export function ScrollTable({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div tabIndex={0} role="region" aria-label={label} className="overflow-x-auto rounded-lg focus-visible:outline-offset-2">
      {children}
    </div>
  )
}

/** A small caption under a specimen. */
export function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-caption text-muted', className)}>{children}</p>
}

/** A labelled cell in a specimen grid. */
export function Specimen({ label, sub, children, className }: { label: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {children}
      <div className="text-center">
        <p className="text-caption font-medium text-ink">{label}</p>
        {sub && <p className="text-caption text-muted">{sub}</p>}
      </div>
    </div>
  )
}
