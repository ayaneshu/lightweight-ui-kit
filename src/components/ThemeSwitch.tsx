import { Desktop, Moon, Sun } from '@phosphor-icons/react'
import { useTheme, type Theme } from '../lib/theme'
import { SlidingSwitch, type SegmentItem } from './Segmented'

const ITEMS: SegmentItem<Theme>[] = [
  { value: 'light', label: 'Light', icon: <Sun size={15} aria-hidden="true" /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={15} aria-hidden="true" /> },
  { value: 'system', label: 'System', icon: <Desktop size={15} aria-hidden="true" /> },
]

export interface ThemeSwitchProps {
  /** Control it yourself; leave both unset and it manages (and persists) the theme on its own. */
  value?: Theme
  onChange?: (theme: Theme) => void
  /** localStorage key when uncontrolled — match the one passed to `themeScript()`. */
  storageKey?: string
  /** Show the names beside the glyphs. */
  labels?: boolean
  /** Accessible name for the group. */
  label?: string
  className?: string
}

/**
 * Light · Dark · System, as one sliding switch. Uncontrolled it is the whole
 * feature: it reads the saved choice, applies it to <html>, remembers the next
 * one and follows the OS while on System.
 */
export function ThemeSwitch({ value, onChange, storageKey, ...rest }: ThemeSwitchProps) {
  if (value !== undefined && onChange) return <ThemeSwitchView value={value} onChange={onChange} {...rest} />
  return <ThemeSwitchAuto storageKey={storageKey} {...rest} />
}

function ThemeSwitchAuto({ storageKey, ...rest }: Omit<ThemeSwitchProps, 'value' | 'onChange'>) {
  const [theme, setTheme] = useTheme(storageKey)
  return <ThemeSwitchView value={theme} onChange={setTheme} {...rest} />
}

function ThemeSwitchView({
  value,
  onChange,
  labels = false,
  label = 'Theme',
  className,
}: Omit<ThemeSwitchProps, 'storageKey'> & { value: Theme; onChange: (t: Theme) => void }) {
  return <SlidingSwitch items={ITEMS} value={value} onChange={onChange} label={label} iconOnly={!labels} className={className} />
}
