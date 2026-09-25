// Lightweight UI — every export in one place. Styles are separate:
//   import 'lightweight-ui/styles.css'   (no Tailwind)
//   @import "lightweight-ui/theme.css"   (Tailwind v4)

// Utilities
export { cn, type ClassValue } from './lib/cn'
export { personName, personInitials, personColor, timeAgo, AVATAR_COLORS } from './lib/person'
export { onColor, tint, contrast } from './lib/color'
export {
  HERO_GRADIENTS,
  HERO_SOLIDS,
  HERO_BG_PRESETS,
  HERO_DITHER_ANGLE,
  heroBgCss,
  hasHeroBg,
  isHeroGradient,
  isCustomHeroBg,
  findHeroBg,
  sampleStops,
  renderSpec,
  gradientPalette,
  type HeroBgPreset,
  type GradientSpec,
  type GradientStop,
  type BackdropFamily,
} from './lib/hero'
export { dither, DITHER_ALGORITHMS, type DitherAlgorithm, type DitherOptions } from './lib/dither'
export { hexToRgb, rgbToHex, rgbToOklab, oklabToRgb, mixLab, smoothstep } from './lib/oklab'
export {
  useDismiss,
  useFocusTrap,
  useControllable,
  useLayer,
  usePresence,
  useReducedMotion,
  type DismissReason,
} from './lib/hooks'
export { applyTheme, resolveTheme, useTheme, themeScript, type Theme } from './lib/theme'
export * as tokens from './tokens'

// Actions
export * from './components/Button'
export * from './components/ThemeSwitch'

// Display
export * from './components/Badge'
export * from './components/Avatar'
export * from './components/Typography'
export { default as Tooltip, type TooltipProps } from './components/Tooltip'
export * from './components/Card'
export * from './components/Charts'
export * from './components/Table'

// Forms
export * from './components/Field'
export * from './components/Controls'
export * from './components/DatePicker'

// Navigation
export * from './components/Segmented'
export * from './components/Navigation'
export * from './components/Menu'

// Overlays & feedback
export * from './components/Dialog'
export * from './components/Command'
export * from './components/Feedback'
export * from './components/Loader'

// Media & collaboration
export * from './components/Backdrop'
export * from './components/HeroPanel'
export * from './components/Media'
export * from './components/Compare'
export * from './components/Presence'
