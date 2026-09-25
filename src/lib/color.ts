import { hexToRgb } from './oklab'

const luminance = (hex: string) => {
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = hexToRgb(hex).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const INK = '#18191d'
const WHITE = '#ffffff'

/**
 * Text sitting *on* a coloured mark takes whichever of ink or white measures
 * higher against it — not a luminance guess. White on the chart blue clears
 * 4.5:1; on the amber only ink does.
 */
export function onColor(hex: string): string {
  return contrast(INK, hex) >= contrast(WHITE, hex) ? INK : WHITE
}

/**
 * A colour at low strength over the current surface — the rail a chart mark
 * runs in. Mixed with the card token, so it reads right in light and dark.
 */
export function tint(color: string, pct = 12): string {
  return `color-mix(in srgb, ${color} ${pct}%, var(--color-card))`
}
