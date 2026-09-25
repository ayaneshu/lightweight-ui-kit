import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { cn } from '../lib/cn'

/* --------------------------------------------------------------- Checkbox */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  /** Some but not all — a "select all" over a partial selection. Shows a dash. */
  indeterminate?: boolean
}

/**
 * A native checkbox the kit draws itself: pressing squeezes the box, checking
 * fills it with a small pop and the tick draws itself in. Still a real
 * <input type="checkbox">, so forms, labels, keyboard and screen readers work
 * as they always do. With a label, the whole line is the hit target.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, className, onChange, ...rest },
  ref,
) {
  const inner = useRef<HTMLInputElement | null>(null)
  // The pop plays after a real change, never on the first paint.
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate
  }, [indeterminate])

  const box = (
    <span className={cn('relative inline-grid h-[18px] w-[18px] flex-none place-items-center', !label && className)}>
      <input
        ref={(el) => {
          inner.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        type="checkbox"
        data-touched={touched || undefined}
        onChange={(e) => {
          setTouched(true)
          onChange?.(e)
        }}
        className={cn(
          'u-checkbox peer absolute inset-0 cursor-pointer rounded-[5px] border border-line-control bg-field',
          'not-disabled:hover:border-ink not-disabled:hover:bg-ink/[0.03]',
          'checked:border-ink checked:bg-ink not-disabled:checked:hover:bg-ink indeterminate:border-ink indeterminate:bg-ink',
          'disabled:cursor-not-allowed disabled:opacity-40',
        )}
        {...rest}
      />
      <svg viewBox="0 0 12 12" aria-hidden="true" className="u-check pointer-events-none relative h-3 w-3 text-on-ink">
        <path className="u-check-tick" pathLength={1} d="M2.6 6.4 5 8.7 9.6 3.6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path className="u-check-dash" pathLength={1} d="M3 6h6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    </span>
  )
  if (!label) return box
  return (
    <label className={cn('group inline-flex min-h-6 cursor-pointer items-center gap-2.5 text-ui font-medium has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60', className)}>
      {box}
      {label}
    </label>
  )
})

/* ------------------------------------------------------ Switch & Toggle */

/**
 * The track: a rounded square, ink when on; a wash with a 3:1 edge when off,
 * so it reads as a control. Hover deepens either state.
 */
const track = (checked: boolean) =>
  cn(
    'flex h-5 w-9 flex-none items-center rounded-[7px] p-0.5 transition-colors duration-200',
    checked ? 'bg-ink group-hover:bg-ink/85' : 'bg-ink/[0.12] ring-1 ring-inset ring-line-control group-hover:bg-ink/[0.18]',
  )
/**
 * The knob: a square with softened corners. It slides with the reading
 * direction, and while pressed it stretches toward where it's going — the
 * way a finger would squash it — then settles.
 */
const knob = (checked: boolean) =>
  cn(
    'h-4 w-4 rounded-[5px] transition-[translate,scale,background-color] duration-200 ease-out group-active:scale-x-[1.25]',
    checked ? 'translate-x-4 origin-right bg-on-ink rtl:-translate-x-4 rtl:origin-left' : 'origin-left bg-white shadow-hairline rtl:origin-right',
  )

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Required — a bare switch has no visible text to take a name from. */
  label: string
  disabled?: boolean
  className?: string
}

/** The bare track-and-knob. Use `Toggle` when it comes with visible text. */
export function Switch({ checked, onChange, disabled = false, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('group rounded-[9px] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40', className)}
      data-static
    >
      <span className={track(checked)}>
        <span className={knob(checked)} />
      </span>
    </button>
  )
}

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: React.ReactNode
  hint?: React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * A setting as one row — label and hint on the left, switch on the right, the
 * whole row pressable. The label names the switch; the hint describes it.
 */
export function Toggle({ checked, onChange, label, hint, disabled = false, className }: ToggleProps) {
  const id = useId()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-l`}
      aria-describedby={hint ? `${id}-h` : undefined}
      disabled={disabled}
      data-static
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex w-full items-start justify-between gap-3 rounded-xl px-1 py-2 text-start transition-colors hover:bg-ink/[0.025] focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <span className="min-w-0">
        <span id={`${id}-l`} className="block text-ui font-medium">
          {label}
        </span>
        {hint && (
          <span id={`${id}-h`} className="mt-0.5 block text-label text-pretty text-muted">
            {hint}
          </span>
        )}
      </span>
      <span className={cn(track(checked), 'mt-0.5')}>
        <span className={knob(checked)} />
      </span>
    </button>
  )
}

/* ------------------------------------------------------------ RadioGroup */

export type ChoiceOption = string | { value: string; label: React.ReactNode; description?: React.ReactNode }

function normalise(o: ChoiceOption) {
  return typeof o === 'string' ? { value: o, label: o } : o
}

export interface RadioGroupProps {
  options: ChoiceOption[]
  value: string | null | undefined
  onChange: (value: string) => void
  /** Required — the group's name, read before its options. */
  label: string
  disabled?: boolean
  className?: string
}

/**
 * Choices as full-width rows over native radios: one Tab stop, arrow keys to
 * move, the chosen one filled with a wash and its dot.
 */
export function RadioGroup({ options, value, onChange, disabled = false, label, className }: RadioGroupProps) {
  const name = useId()
  return (
    <div role="radiogroup" aria-label={label} className={cn('space-y-2', className)}>
      {options.map(normalise).map((o) => {
        const selected = value === o.value
        return (
          <label
            key={o.value}
            className={cn(
              'group flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-start text-ui transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink has-[:disabled]:cursor-not-allowed',
              selected ? 'border-transparent bg-ink/[0.06] font-medium' : 'border-line-strong hover:border-line-control hover:bg-ink/[0.03] has-[:disabled]:hover:bg-transparent',
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={o.value}
              checked={selected}
              disabled={disabled}
              onChange={() => onChange(o.value)}
            />
            <span
              aria-hidden="true"
              className={cn(
                'u-circle grid h-4 w-4 flex-none place-items-center rounded-full border transition-[border-color,scale] duration-150 ease-out',
                selected ? 'border-ink' : 'border-line-control group-hover:scale-110 group-hover:border-ink',
              )}
            >
              {selected && <span className="u-circle u-icon-in h-2 w-2 rounded-full bg-ink" />}
            </span>
            <span className="min-w-0">
              {o.label}
              {'description' in o && o.description && <span className="mt-0.5 block text-label font-normal text-muted">{o.description}</span>}
            </span>
          </label>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- Slider */

export interface SliderProps {
  value: number
  onChange: (value: number) => void
  /** Required — the slider's name. */
  label: string
  min?: number
  max?: number
  step?: number
  /**
   * `labeled` — end labels under the track with the value in a chip between them
   * (a voter's answer). `compact` — the value in a small box beside the track
   * (a setting, like brightness).
   */
  variant?: 'labeled' | 'compact'
  minLabel?: React.ReactNode
  maxLabel?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  variant = 'labeled',
  minLabel,
  maxLabel,
  disabled = false,
  label,
  className,
}: SliderProps) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100
  const input = (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="u-range w-full disabled:cursor-not-allowed disabled:opacity-50"
      style={{ ['--lui-range' as string]: `${pct}%` }}
    />
  )
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {input}
        <ValueBox>{value}</ValueBox>
      </div>
    )
  }
  return (
    <div className={className}>
      {input}
      <div className="mt-1 flex items-center justify-between text-ui text-muted">
        <span>{minLabel ?? min}</span>
        <span className="cursor-default select-none rounded-full bg-ink/[0.06] px-2 py-0.5 text-label font-medium tabular-nums text-ink">{value}</span>
        <span>{maxLabel ?? max}</span>
      </div>
    </div>
  )
}

/** A number in a small hairline box — the readout beside a compact slider. */
export function ValueBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('w-10 flex-none cursor-default select-none rounded-lg border border-line px-2 py-1 text-center text-label tabular-nums text-muted', className)}>
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------- Rating */

export interface RatingProps {
  value: number
  onChange?: (value: number) => void
  /** The group's name, read before the stars. */
  label?: string
  /** Let each star take a half (3.5). Stars grow to 48px so each half is a 24px target. */
  allowHalf?: boolean
  max?: number
  size?: number
  disabled?: boolean
  /** Display only — no controls at all. */
  readOnly?: boolean
  className?: string
}

/**
 * Stars over native radios, so the current value is announced and arrow keys
 * step through it. The pointer previews the rating it's over. Two weights of
 * one Phosphor star rather than one path with swapped fills — an outline drawn
 * at fill weight reads heavier than the rest of the set.
 */
export function Rating({
  value,
  onChange,
  label = 'Rating',
  allowHalf = false,
  max = 5,
  size = 30,
  disabled = false,
  readOnly = false,
  className,
}: RatingProps) {
  const name = useId()
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value
  const interactive = !readOnly && !disabled && Boolean(onChange)
  const s = allowHalf && !readOnly ? Math.max(size, 48) : size
  const radio = (step: number, position: string) => (
    <input
      key={step}
      type="radio"
      name={name}
      value={step}
      checked={value === step}
      disabled={!interactive}
      aria-label={`${step} ${step === 1 ? 'star' : 'stars'}`}
      onChange={() => onChange?.(step)}
      onMouseEnter={() => interactive && setHover(step)}
      className={cn(
        'absolute z-10 m-0 cursor-pointer appearance-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default',
        position,
      )}
    />
  )
  return (
    <div
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `${value} out of ${max} stars` : label}
      className={cn('flex gap-1.5', disabled && 'opacity-70', className)}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const fill = shown >= n ? 1 : shown >= n - 0.5 ? 0.5 : 0
        // The star under the pointer grows a little, so the preview has a leader.
        const pointed = interactive && hover !== null && Math.ceil(hover) === n
        return (
          <div key={n} className="relative" style={{ width: s, height: s }}>
            <span
              className={cn('pointer-events-none absolute inset-0 block transition-[scale] duration-150 ease-out', pointed && 'scale-115')}
              aria-hidden="true"
            >
              <Star size={s} weight="regular" className="block text-line-control" />
              {fill > 0 && (
                <span className="absolute start-0 top-0 h-full overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star size={s} weight="fill" className="block text-ink" />
                </span>
              )}
            </span>
            {!readOnly && allowHalf && radio(n - 0.5, 'inset-y-0 start-0 w-1/2')}
            {!readOnly && radio(n, allowHalf ? 'inset-y-0 end-0 w-1/2' : 'inset-0')}
          </div>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- Swatch */

export interface SwatchProps {
  /** Any CSS background — a hex, a gradient stack. */
  background: string
  label: string
  selected?: boolean
  onClick?: () => void
  size?: number
  className?: string
}

/** A colour choice as a circle; the chosen one gets an ink border and a soft ring. */
export function Swatch({ background, label, selected = false, onClick, size = 32, className }: SwatchProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'u-press u-circle flex-none rounded-full border focus-visible:outline-offset-4 hover:scale-110',
        selected ? 'border-ink ring-2 ring-ink/15 ring-offset-1 ring-offset-bg' : 'border-line-strong hover:border-ink/40',
        className,
      )}
      style={{ background, width: size, height: size }}
    />
  )
}

/**
 * The custom-colour swatch: a rainbow until a colour is picked, then that
 * colour. A transparent native colour input sits over it; the label shows the
 * focus ring the hidden input can't.
 */
export function CustomColorSwatch({
  value,
  onChange,
  selected = false,
  size = 32,
}: {
  /** The custom hex, or undefined while none is chosen. */
  value?: string
  onChange: (hex: string) => void
  selected?: boolean
  size?: number
}) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      title="Custom colour"
      className={cn(
        'u-circle relative flex-none cursor-pointer overflow-hidden rounded-full border transition-[border-color,scale] duration-150 ease-out hover:scale-110 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink',
        selected ? 'border-ink ring-2 ring-ink/15 ring-offset-1 ring-offset-bg' : 'border-line-strong hover:border-ink/40',
      )}
      style={{
        width: size,
        height: size,
        background: value ?? 'conic-gradient(#ff5f6d,#ffc371,#47e5bc,#4facfe,#c471f5,#ff5f6d)',
      }}
    >
      <input
        id={id}
        type="color"
        aria-label="Custom colour"
        value={value ?? '#6b7cff'}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  )
}

/* ------------------------------------------------------------ ChoiceTile */

export interface ChoiceTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: React.ReactNode
  selected?: boolean
}

/**
 * Glyph over label, in an equal-width grid — "pick a shape for this thing":
 * page types, input types. Selected tiles take an ink border and a wash.
 */
export function ChoiceTile({ icon, label, selected, className, ...rest }: ChoiceTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'u-press group flex flex-col items-center gap-1 rounded-xl border px-2.5 py-2.5 text-center focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40',
        selected ? 'border-ink bg-ink/[0.04]' : 'border-line-strong hover:border-line-control hover:bg-ink/[0.03]',
        className,
      )}
      {...rest}
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-lg bg-ink/[0.06] transition-[translate] duration-200 ease-out group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-label font-medium leading-tight">{label}</span>
    </button>
  )
}
