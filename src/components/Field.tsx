import { createContext, forwardRef, useContext, useId, useRef, useState } from 'react'
import { CaretDown, Check, MagnifyingGlass, WarningCircle, X } from '@phosphor-icons/react'
import { cn } from '../lib/cn'

/* ------------------------------------------------------------------ Field */

interface FieldCtx {
  id: string
  describedBy?: string
  invalid: boolean
}

/**
 * What a Field tells the control inside it: the id its label points at, the
 * id of its hint or error (for aria-describedby) and whether it's invalid.
 * Input, Textarea, Select and DatePicker read it; your own controls can too.
 */
export const FieldContext = createContext<FieldCtx | null>(null)
export const useField = () => useContext(FieldContext)

export interface FieldProps {
  label: React.ReactNode
  hint?: React.ReactNode
  /** Replaces the hint while set, marks the control invalid and describes it. */
  error?: React.ReactNode
  /**
   * Quieter label — 13px muted rather than 14px ink. For a dialog that is
   * nothing but fields, where a column of bold labels competes with the values.
   */
  subtle?: boolean
  /** Use your own id for the control. */
  id?: string
  className?: string
  children: React.ReactNode
}

/**
 * Label, control, and a hint or error underneath. The label names the control
 * (htmlFor), the hint or error describes it (aria-describedby) — so a screen
 * reader hears "Form name, edit text, Give the form a name", not the error run
 * into the label.
 */
export function Field({ label, hint, error, subtle = false, id: idProp, className, children }: FieldProps) {
  const auto = useId()
  const id = idProp ?? auto
  const msgId = `${id}-msg`
  const message = error ?? hint
  return (
    <div className={cn('block', className)}>
      <label htmlFor={id} className={cn('mb-1.5 block', subtle ? 'text-label font-medium text-muted' : 'text-ui font-medium')}>
        {label}
      </label>
      <FieldContext.Provider value={{ id, describedBy: message ? msgId : undefined, invalid: Boolean(error) }}>
        {children}
      </FieldContext.Provider>
      {error ? (
        <FieldError id={msgId}>{error}</FieldError>
      ) : (
        hint && (
          <span id={msgId} className="mt-1 block text-label text-pretty text-muted">
            {hint}
          </span>
        )
      )}
    </div>
  )
}

/**
 * An inline error, with an icon so it isn't carried by red alone. Announced
 * through the control's aria-describedby, not as an interrupting alert.
 */
export function FieldError({ children, id, className }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <span id={id} className={cn('mt-1 flex items-start gap-1 text-label text-danger', className)}>
      <WarningCircle size={14} aria-hidden="true" className="mt-0.5 flex-none" />
      <span>{children}</span>
    </span>
  )
}

/** A label and a trailing control on one line — "Brightness ······ [ 0 ]". */
export function FieldRow({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <span className="text-ui font-medium">{label}</span>
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- Inputs */

/**
 * The one field treatment: 12px radius and a control edge that clears 3:1.
 * Focus is the border itself turning ink — no ring floating outside the field
 * (the edge goes from 3:1 to over 6:1 against the surface, so it's plain to
 * see). Hover darkens the edge halfway; invalid is danger throughout. 16px
 * text on phones so iOS doesn't zoom the page on focus, 14px from `sm` up.
 */
export function fieldClasses({ invalid = false, size = 'md' }: { invalid?: boolean; size?: 'sm' | 'md' | 'lg' } = {}) {
  return cn(
    'w-full rounded-xl border bg-field text-base text-ink caret-ink outline-hidden transition-[border-color,background-color] duration-150 placeholder:text-muted sm:text-ui disabled:cursor-not-allowed disabled:bg-ink/[0.03] disabled:text-muted',
    size === 'sm' && 'h-8 px-3',
    size === 'md' && 'px-3.5 py-2.5',
    size === 'lg' && 'h-11 px-3.5',
    invalid ? 'border-danger focus:bg-danger-bg/40' : 'border-line-control not-disabled:hover:border-ink/60 focus:border-ink not-disabled:focus:hover:border-ink',
  )
}

/** Merge a Field's wiring into a control's own props — explicit props win. */
function useFieldProps<T extends { id?: string; 'aria-describedby'?: string }>(props: T, invalid: boolean) {
  const f = useField()
  return {
    id: props.id ?? f?.id,
    'aria-describedby': cn(f?.describedBy, props['aria-describedby']) || undefined,
    'aria-invalid': invalid || f?.invalid ? true : undefined,
    invalid: invalid || Boolean(f?.invalid),
  }
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid = false, size = 'md', className, ...rest }, ref) {
  const { invalid: bad, ...wiring } = useFieldProps(rest, invalid)
  return <input ref={ref} {...rest} {...wiring} className={cn(fieldClasses({ invalid: bad, size }), className)} />
})

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  /** Grow with the content (CSS field-sizing; falls back to `rows` elsewhere). */
  autoGrow?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, autoGrow = false, rows = 3, className, ...rest },
  ref,
) {
  const { invalid: bad, ...wiring } = useFieldProps(rest, invalid)
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...rest}
      {...wiring}
      className={cn(fieldClasses({ invalid: bad }), 'resize-none leading-relaxed', autoGrow && 'field-sizing-content', className)}
    />
  )
})

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  invalid?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Shown as a first, empty option and styled as a placeholder while selected. */
  placeholder?: string
}

/**
 * A native select wearing the kit's chevron — `appearance-none` drops the
 * platform one so every OS gets the same control. The menu itself stays native.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid = false, size = 'md', placeholder, className, children, value, defaultValue, ...rest },
  ref,
) {
  const { invalid: bad, ...wiring } = useFieldProps(rest, invalid)
  const empty = value === '' || (value === undefined && (defaultValue === undefined || defaultValue === ''))
  return (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        {...rest}
        {...wiring}
        className={cn(fieldClasses({ invalid: bad, size }), 'appearance-none pe-9 font-medium', placeholder && empty && 'text-muted')}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {children}
      </select>
      <CaretDown size={13} weight="bold" aria-hidden="true" className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  )
})

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  /** The accessible name. The placeholder is free to be an example. */
  label?: string
}

/**
 * A pill search field on a wash; Escape clears it, and a × appears once there's
 * a query. Focus lifts it off the wash onto the field colour with an ink edge.
 */
export function SearchInput({ value, onChange, label = 'Search', placeholder = 'Search', className, ...rest }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <MagnifyingGlass size={14} aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && value && (e.stopPropagation(), onChange(''))}
        placeholder={placeholder}
        aria-label={label}
        className="h-9 w-full rounded-full border border-transparent bg-ink/[0.04] px-[30px] text-base text-ink caret-ink outline-hidden transition-[background-color,border-color] duration-150 placeholder:text-muted hover:bg-ink/[0.06] focus:border-ink focus:bg-field sm:text-label [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="u-circle u-press absolute end-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-ink/[0.06] hover:text-ink"
        >
          <X size={12} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------- Inline editing */

/** Borderless, so focus is a background: a wash on hover, a deeper one while editing. */
const INLINE =
  'w-full rounded-lg bg-transparent caret-ink outline-hidden transition-colors duration-150 placeholder:text-muted hover:bg-ink/[0.03] focus:bg-ink/[0.06]'

export interface InlineInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'aria-label'> {
  value: string
  onChange: (value: string) => void
  /** Required — with no visible label, this is the field's only name. */
  'aria-label': string
  invalid?: boolean
  /** Shown under the field and read with it. */
  error?: React.ReactNode
}

/**
 * A borderless field that looks like the text it edits and reveals a soft
 * wash on hover and focus — "edit right on the page", no separate form column.
 */
export function InlineInput({ value, onChange, invalid = false, error, className, ...rest }: InlineInputProps) {
  const errId = useId()
  const bad = invalid || Boolean(error)
  return (
    <>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={bad || undefined}
        aria-describedby={error ? errId : undefined}
        className={cn(INLINE, bad && 'bg-danger-bg ring-2 ring-danger', className)}
        {...rest}
      />
      {error && <FieldError id={errId} className="px-2">{error}</FieldError>}
    </>
  )
}

export interface InlineTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'aria-label'> {
  value: string
  onChange: (value: string) => void
  /** Required — with no visible label, this is the field's only name. */
  'aria-label': string
  invalid?: boolean
  /** Shown under the field and read with it. */
  error?: React.ReactNode
}

/** The multi-line version; grows with its content. */
export function InlineTextarea({ value, onChange, invalid = false, error, rows = 1, className, ...rest }: InlineTextareaProps) {
  const errId = useId()
  const bad = invalid || Boolean(error)
  return (
    <>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        aria-invalid={bad || undefined}
        aria-describedby={error ? errId : undefined}
        className={cn(INLINE, 'field-sizing-content resize-none', bad && 'bg-danger-bg ring-2 ring-danger', className)}
        {...rest}
      />
      {error && <FieldError id={errId} className="px-2">{error}</FieldError>}
    </>
  )
}

/* ------------------------------------------------------------ Copy field */

export interface CopyFieldProps {
  value: string
  /** The field's name — "Voter link". */
  inputLabel: string
  /** The button's text. */
  label?: string
  className?: string
}

/**
 * A read-only value with a Copy button that confirms itself for a beat. Both
 * button labels share one grid cell, so the button never changes width; the
 * confirmation is announced; and if the clipboard is blocked the text is
 * selected and the fallback is said out loud.
 */
export function CopyField({ value, inputLabel, label = 'Copy', className }: CopyFieldProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
      setTimeout(() => setState('idle'), 1600)
    } catch {
      inputRef.current?.focus()
      inputRef.current?.select()
      setState('failed')
    }
  }
  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          readOnly
          value={value}
          aria-label={inputLabel}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 rounded-xl border border-line bg-ink/[0.015] px-3.5 py-2.5 text-base text-muted outline-hidden transition-colors duration-150 hover:border-line-control focus:border-ink focus:text-ink sm:text-ui"
        />
        <button
          type="button"
          onClick={copy}
          className="u-press grid flex-none place-items-center rounded-2xl border border-line-strong px-4 text-ui font-semibold hover:border-line-control hover:bg-ink/[0.03] focus-visible:outline-offset-2"
        >
          <span className={cn('col-start-1 row-start-1', state === 'copied' && 'invisible')}>{label}</span>
          <span className={cn('col-start-1 row-start-1 inline-flex items-center gap-1.5', state !== 'copied' && 'invisible')}>
            {state === 'copied' && <Check size={13} weight="bold" aria-hidden="true" className="u-icon-in" />}
            Copied
          </span>
        </button>
      </div>
      <span role="status" className="sr-only">
        {state === 'copied' ? 'Copied to clipboard' : ''}
      </span>
      {state === 'failed' && (
        <FieldError>Couldn’t copy. The text is selected — press ⌘C or Ctrl+C.</FieldError>
      )}
    </div>
  )
}
