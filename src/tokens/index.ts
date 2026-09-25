/**
 * Lightweight UI design tokens as data — the same values as styles/theme.css, for code
 * that needs them outside CSS (charts, canvas, docs, a Figma sync) and for the
 * published tokens.json. theme.css is what styles the components; keep the two
 * in step when changing either.
 */

/**
 * Every semantic colour in both themes. `colors`, `statusColors` and
 * `dangerColors` below are the light values, kept for convenience.
 */
export const themes = {
  light: {
    bg: '#ffffff',
    card: '#ffffff',
    raised: '#ffffff',
    field: '#ffffff',
    ink: '#18191d',
    onInk: '#ffffff',
    muted: '#666879',
    line: '#ededec',
    lineStrong: '#e3e3e0',
    lineControl: '#949494',
    draft: '#96660b',
    draftBg: '#fbf3e3',
    open: '#15803d',
    openBg: '#eaf7ee',
    closed: '#666879',
    closedBg: '#f2f2f1',
    danger: '#da2424',
    dangerSolid: '#da2424',
    dangerStrong: '#b91c1c',
    dangerBg: '#fef2f2',
    dangerLine: '#fecaca',
  },
  dark: {
    bg: '#111214',
    card: '#18191c',
    raised: '#2a2b30',
    field: '#1d1e22',
    ink: '#ececee',
    onInk: '#111214',
    muted: '#9c9fad',
    line: '#2a2b30',
    lineStrong: '#34353b',
    lineControl: '#6c6e78',
    draft: '#e4b660',
    draftBg: '#2c2413',
    open: '#62d38e',
    openBg: '#13291c',
    closed: '#9c9fad',
    closedBg: '#232428',
    danger: '#ff7b76',
    dangerSolid: '#dc2626',
    dangerStrong: '#ffa19c',
    dangerBg: '#301618',
    dangerLine: '#5a2226',
  },
} as const

export const colors = {
  bg: themes.light.bg,
  card: themes.light.card,
  ink: themes.light.ink,
  muted: themes.light.muted,
  line: themes.light.line,
  lineStrong: themes.light.lineStrong,
} as const

export const statusColors = {
  draft: { fg: '#96660b', bg: '#fbf3e3', label: 'Draft' },
  open: { fg: '#15803d', bg: '#eaf7ee', label: 'Active' },
  closed: { fg: '#666879', bg: '#f2f2f1', label: 'Closed' },
} as const

export const dangerColors = {
  fg: '#da2424',
  bg: '#fef2f2',
  line: '#fecaca',
  strong: '#b91c1c',
} as const

/** Ink at low alpha — black on light, white on dark. Hover, pressed, tracks and empty surfaces. */
export const washes = [
  { token: 'wash-1', alpha: 0.015, use: 'Empty & placeholder surfaces' },
  { token: 'wash-2', alpha: 0.03, use: 'Hover on outlined controls, tab tracks' },
  { token: 'wash-3', alpha: 0.04, use: 'Hover on ghost controls, search field' },
  { token: 'wash-4', alpha: 0.06, use: 'Selected rows, neutral pills, icon tiles' },
  { token: 'wash-5', alpha: 0.08, use: 'Soft-button hover, overflow chips' },
  { token: 'wash-6', alpha: 0.12, use: 'Switch track (off)' },
] as const

/** Option identity — assigned by position, never by rank. A is always blue. */
export const chartColors = ['#277fff', '#1baf7a', '#eda100', '#008300'] as const

/** Ordered buckets (1★ → 5★) — one hue, light to dark. */
export const ratingRamp = ['#a4c9ff', '#6fabff', '#277fff', '#0260d9', '#0347a2'] as const

export const avatarColors = [
  '#4F46E5',
  '#E11D48',
  '#0081A2',
  '#B45309',
  '#7C3AED',
  '#00875B',
  '#DB2777',
  '#00857A',
] as const

export const fonts = {
  sans: { family: 'Geist', role: 'UI — labels, controls, body, numbers' },
  pixel: { family: 'Geist Pixel Square', role: 'Display — headings over 20px, hero figures' },
  mono: { family: 'Geist Mono', role: 'Code and ids' },
} as const

export const typeScale = [
  { token: 'figure', size: 52, lineHeight: 1, weight: 600, font: 'pixel', use: 'The one number a report leads with' },
  { token: 'display-lg', size: 40, lineHeight: 1.1, weight: 600, font: 'pixel', use: 'Workspace & landing titles' },
  { token: 'display', size: 32, lineHeight: 1.25, weight: 600, font: 'pixel', use: 'Hero headlines, end screens' },
  { token: 'display-sm', size: 28, lineHeight: 1.25, weight: 600, font: 'pixel', use: 'Page & report titles' },
  { token: 'title', size: 17, lineHeight: 1.375, weight: 600, font: 'sans', use: 'Card & dialog titles' },
  { token: 'body', size: 15, lineHeight: 1.625, weight: 400, font: 'sans', use: 'Reading copy, option names' },
  { token: 'ui', size: 14, lineHeight: 1.5, weight: 500, font: 'sans', use: 'Controls, buttons, menu rows' },
  { token: 'label', size: 13, lineHeight: 1.5, weight: 500, font: 'sans', use: 'Secondary copy, field labels, small buttons' },
  { token: 'caption', size: 12, lineHeight: 1.5, weight: 500, font: 'sans', use: 'Chart labels, timestamps, tags' },
  { token: 'micro', size: 11, lineHeight: 1.5, weight: 600, font: 'sans', use: 'Table headers, initials, count pills' },
] as const

export const fontWeights = [
  { name: 'Regular', value: 400, use: 'Body copy' },
  { name: 'Medium', value: 500, use: 'UI text — the default for controls' },
  { name: 'Semibold', value: 600, use: 'Titles, emphasis, numbers' },
  { name: 'Bold', value: 700, use: 'Monograms and letter badges only' },
] as const

export const radii = [
  { token: 'md', px: 6, use: 'Letter badges, rail tiles' },
  { token: 'lg', px: 8, use: 'Tooltips, icon buttons on media' },
  { token: 'chip', px: 10, use: 'Menu rows, inner tabs, chart marks' },
  { token: 'xl', px: 12, use: 'Inputs, compact buttons, list items' },
  { token: 'control', px: 14, use: 'Segmented tracks, menus, dialog buttons' },
  { token: '2xl', px: 16, use: 'Primary buttons, option & input cards' },
  { token: 'tile', px: 20, use: 'Dashboard cards, compare cards, nudges' },
  { token: 'panel', px: 22, use: 'Chart cards, confirm dialogs' },
  { token: 'sheet', px: 26, use: 'Dialogs, feature cards, empty states' },
  { token: 'canvas', px: 28, use: 'Builder canvas' },
  { token: 'device', px: 38, use: 'Phone-frame prototypes' },
  { token: 'full', px: 9999, use: 'Pills, avatars, status badges' },
] as const

export const shadows = [
  { token: 'hairline', value: '0 1px 2px rgba(0,0,0,0.08)', use: 'Active segment in a tab track' },
  { token: 'pill', value: '0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)', use: 'Active filter pill' },
  { token: 'card', value: '0 1px 2px rgba(0,0,0,0.03), 0 16px 44px -24px rgba(0,0,0,0.18)', use: 'Resting raised card, account popover' },
  { token: 'menu', value: '0 4px 12px -2px rgba(0,0,0,0.08), 0 16px 40px -12px rgba(0,0,0,0.22)', use: 'Menus, date picker, listbox' },
  { token: 'modal', value: '0 1px 2px rgba(0,0,0,0.03), 0 24px 60px -24px rgba(0,0,0,0.35)', use: 'Dialogs' },
  { token: 'lift', value: '0 2px 10px -2px rgba(0,0,0,0.10), 0 18px 44px -20px rgba(0,0,0,0.30)', use: 'Selected compare card' },
  { token: 'nudge', value: '0 2px 8px -2px rgba(0,0,0,0.08), 0 20px 48px -16px rgba(0,0,0,0.28)', use: 'Floating prompt' },
  { token: 'toast', value: '0 12px 32px -12px rgba(0,0,0,0.32)', use: 'Toasts' },
  { token: 'tooltip', value: '0 4px 12px -4px rgba(0,0,0,0.4)', use: 'Tooltips' },
] as const

export const easings = {
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  inOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
} as const

export const durations = [
  { token: 'exit', ms: 120, use: 'Every exit — shorter and softer than the entrance' },
  { token: 'tooltip', ms: 125, use: 'Tooltip enter; instant once one is open' },
  { token: 'popover', ms: 150, use: 'Popovers and menus enter' },
  { token: 'press', ms: 160, use: 'Button press scale (0.97)' },
  { token: 'swap', ms: 180, use: 'Default transition, content swap' },
  { token: 'overlay', ms: 200, use: 'Scrim fade' },
  { token: 'modal', ms: 220, use: 'Dialog scale-in' },
  { token: 'view', ms: 240, use: 'Tab-to-tab view change' },
  { token: 'slide', ms: 240, use: 'Sliding segment indicator' },
  { token: 'stagger', ms: 300, use: 'List cascade (45ms step)' },
  { token: 'pop', ms: 380, use: 'Celebration pop' },
  { token: 'rise', ms: 360, use: 'Screen-to-screen transition' },
  { token: 'chart', ms: 400, use: 'Chart bars growing (transform only)' },
] as const

export const motionClasses = [
  { name: 'u-press', use: 'Scale to 0.97 while pressed' },
  { name: 'u-overlay', use: 'Scrim fades in (200ms)' },
  { name: 'u-modal', use: 'Dialog fades + scales from 0.96 (220ms)' },
  { name: 'u-popover', use: 'Popover fades + scales from its trigger edge (150ms)' },
  { name: 'u-swap', use: 'Crossfade + 4px rise when keyed content changes' },
  { name: 'u-stagger', use: 'Children cascade in, 45ms apart' },
  { name: 'u-pop', use: 'Overshoot pop — rare, celebratory moments' },
  { name: 'u-flash', use: 'Two pulses to point at something' },
  { name: 'u-rise', use: 'Next screen rises 20px and fades in' },
  { name: 'u-toast', use: 'Rises 12px from its edge; leaves the same way' },
  { name: 'u-icon-in', use: 'A glyph scales in from 0.25 with a 4px blur' },
  { name: 'u-view', use: 'View settles in from 6px below' },
] as const

export const zIndex = {
  header: 40,
  popover: 50,
  dialog: 60,
  lightbox: 70,
  toast: 80,
  menu: 200,
} as const

export const layout = [
  { token: 'auth', px: 420, use: 'Sign-in column' },
  { token: 'end', px: 640, use: 'End / confirmation screens' },
  { token: 'landing', px: 720, use: 'Landing copy column' },
  { token: 'report', px: 820, use: 'Results report' },
  { token: 'workspace', px: 1100, use: 'Dashboard and headers' },
] as const

export const tokens = {
  themes,
  colors,
  statusColors,
  dangerColors,
  washes,
  chartColors,
  ratingRamp,
  avatarColors,
  fonts,
  typeScale,
  fontWeights,
  radii,
  shadows,
  easings,
  durations,
  motionClasses,
  zIndex,
  layout,
}

export default tokens
