import { hexToRgb, mixLab, oklabToRgb, rgbToHex, rgbToOklab, smoothstep, type Lab, type RGB } from './oklab'

/**
 * Backdrops for hero media — media floating on a full-bleed field of colour.
 *
 * A backdrop value is one of:
 *   • 'none'           — no panel; the media sits on the page background
 *   • a preset value   — 'g-violet', 'm-aurora', 'r-glow', 's-ink', …
 *   • a raw hex        — '#ff8a5c', from a custom colour picker
 *
 * Gradients are described as data rather than CSS strings, so the same preset
 * can be drawn two ways: as CSS (instant, SSR-safe, used for swatches and first
 * paint) and on a canvas, where it can be dithered (see Backdrop). Both
 * interpolate in OKLab and ease between stops, so ramps stay vivid through the
 * middle and show no kink where one stop hands over to the next.
 */

export type GradientStop = [color: string, at: number]

export type GradientSpec =
  | { kind: 'linear'; angle: number; stops: GradientStop[] }
  | { kind: 'radial'; x: number; y: number; stops: GradientStop[] }
  | { kind: 'mesh'; base: string; points: { x: number; y: number; color: string; radius: number }[] }

export type BackdropFamily = 'linear' | 'radial' | 'mesh' | 'solid'

export interface HeroBgPreset {
  value: string
  label: string
  family: BackdropFamily
  /** Ready-to-use CSS `background` — smooth, no dither. */
  css: string
  /** How to draw it; absent for solids. */
  spec?: GradientSpec
  /** Gradients get a soft off-centre highlight on top, for a lit surface. */
  highlight?: boolean
}

/** The axis every linear gradient runs along, so the set reads as one family. */
export const HERO_DITHER_ANGLE = '158deg'
const ANGLE = 158

/** Off-centre specular highlight laid over linear and radial presets. Declared
 *  before the presets below, which build their CSS from it as the module loads. */
const HIGHLIGHT_CSS = 'radial-gradient(120% 100% at 22% 2%, rgba(255,255,255,0.20), rgba(255,255,255,0) 62%)'

const linear = (value: string, label: string, stops: GradientStop[]): HeroBgPreset =>
  preset(value, label, 'linear', { kind: 'linear', angle: ANGLE, stops }, true)
const radial = (value: string, label: string, x: number, y: number, stops: GradientStop[]): HeroBgPreset =>
  preset(value, label, 'radial', { kind: 'radial', x, y, stops }, true)
const mesh = (value: string, label: string, base: string, points: [number, number, string, number][]): HeroBgPreset =>
  preset(value, label, 'mesh', { kind: 'mesh', base, points: points.map(([x, y, color, radius]) => ({ x, y, color, radius })) }, false)

/**
 * 24 gradients in three families.
 *
 * Linear — three stops each, a lit opening colour, a saturated mid and a deep
 * close, all on the same 158° axis. Mesh — soft blobs of colour over a base,
 * blended in OKLab. Radial — a light source with a falloff.
 */
export const HERO_GRADIENTS: HeroBgPreset[] = [
  linear('g-violet', 'Violet', [['#6f6df2', 0], ['#7b4fd8', 0.44], ['#3b2a86', 1]]),
  linear('g-berry', 'Berry', [['#ea6fcb', 0], ['#b44bd0', 0.46], ['#5c2270', 1]]),
  linear('g-sunset', 'Sunset', [['#ff9268', 0], ['#f2646e', 0.46], ['#9a2d5c', 1]]),
  linear('g-coral', 'Coral', [['#ffc4aa', 0], ['#ff9d9e', 0.48], ['#dd6d88', 1]]),
  linear('g-sand', 'Sand', [['#f8d38d', 0], ['#eda96a', 0.48], ['#c2744a', 1]]),
  linear('g-mint', 'Mint', [['#45d2a9', 0], ['#1da98c', 0.46], ['#0d5f4d', 1]]),
  linear('g-ocean', 'Ocean', [['#6bd5e9', 0], ['#2e9cc4', 0.46], ['#184d72', 1]]),
  linear('g-sky', 'Sky', [['#aeeaff', 0], ['#7fb6fb', 0.48], ['#5878de', 1]]),
  linear('g-slate', 'Slate', [['#3d4049', 0], ['#24262b', 0.5], ['#131419', 1]]),
  linear('g-dusk', 'Dusk', [['#9fb0ff', 0], ['#8e6ad8', 0.46], ['#7a2e6b', 1]]),
  linear('g-ember', 'Ember', [['#ffb36b', 0], ['#f4623a', 0.46], ['#8f1f2a', 1]]),
  linear('g-peach', 'Peach', [['#ffe0c7', 0], ['#ffb8a1', 0.48], ['#e98a8a', 1]]),
  linear('g-forest', 'Forest', [['#7fd18b', 0], ['#2f8f5b', 0.48], ['#12402f', 1]]),
  linear('g-lagoon', 'Lagoon', [['#7ff0d8', 0], ['#26b5c9', 0.46], ['#1b4f8a', 1]]),
  linear('g-lavender', 'Lavender', [['#e6dcff', 0], ['#b9a6f5', 0.48], ['#7d6bd6', 1]]),
  linear('g-citrus', 'Citrus', [['#fff38a', 0], ['#b8e65a', 0.46], ['#3f9b52', 1]]),
  linear('g-midnight', 'Midnight', [['#4b5fb8', 0], ['#23306e', 0.5], ['#0c1030', 1]]),
  mesh('m-aurora', 'Aurora', '#0b1433', [[0.15, 0.2, '#2de2b0', 0.6], [0.82, 0.15, '#6a5cff', 0.62], [0.55, 0.88, '#1fa6ff', 0.6], [0.3, 0.7, '#123a8a', 0.5]]),
  mesh('m-bloom', 'Bloom', '#ffd9e8', [[0.1, 0.12, '#ffb3c7', 0.62], [0.86, 0.2, '#c9b8ff', 0.62], [0.6, 0.9, '#ffc9a6', 0.62], [0.18, 0.82, '#f7a8d8', 0.52]]),
  mesh('m-nebula', 'Nebula', '#170b2e', [[0.2, 0.25, '#8e3cff', 0.58], [0.82, 0.3, '#ff4fa3', 0.52], [0.5, 0.88, '#3d7bff', 0.62]]),
  mesh('m-meadow', 'Meadow', '#e9fbe8', [[0.15, 0.2, '#9ef0c0', 0.62], [0.86, 0.16, '#bfe8ff', 0.58], [0.6, 0.86, '#e8f79a', 0.62]]),
  mesh('m-flare', 'Flare', '#2a0f0a', [[0.2, 0.16, '#ffb347', 0.52], [0.76, 0.36, '#ff5e62', 0.56], [0.42, 0.9, '#b81d5b', 0.62]]),
  radial('r-glow', 'Glow', 0.5, 0.34, [['#fff1d6', 0], ['#ffb86b', 0.32], ['#d65a3a', 0.68], ['#4a1a2a', 1]]),
  radial('r-halo', 'Halo', 0.5, 0.4, [['#e8f3ff', 0], ['#8ec5ff', 0.32], ['#3b6fd8', 0.68], ['#101a45', 1]]),
]

/** Flat fills — quieter options for when the media itself carries the colour. */
export const HERO_SOLIDS: HeroBgPreset[] = [
  { value: 's-paper', label: 'Paper', family: 'solid', css: '#f6f6f5' },
  { value: 's-neutral', label: 'Neutral', family: 'solid', css: '#e8e8e6' },
  { value: 's-warm', label: 'Warm', family: 'solid', css: '#fbf3e3' },
  { value: 's-cool', label: 'Cool', family: 'solid', css: '#eef2f7' },
  { value: 's-mint', label: 'Mint', family: 'solid', css: '#eaf7ee' },
  { value: 's-lilac', label: 'Lilac', family: 'solid', css: '#efeafc' },
  { value: 's-navy', label: 'Navy', family: 'solid', css: '#1e293b' },
  { value: 's-ink', label: 'Ink', family: 'solid', css: '#18191d' },
]

export const HERO_BG_PRESETS: HeroBgPreset[] = [...HERO_GRADIENTS, ...HERO_SOLIDS]

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** Custom colours are stored as a raw hex string. */
export function isCustomHeroBg(value: string): boolean {
  return HEX.test(value ?? '')
}

export function findHeroBg(value: string): HeroBgPreset | undefined {
  return HERO_BG_PRESETS.find((p) => p.value === value)
}

/** Resolves a backdrop value to a CSS `background`. Unknown values render as no backdrop, never broken. */
export function heroBgCss(value: string): string {
  if (!value || value === 'none') return 'transparent'
  if (isCustomHeroBg(value)) return value
  return findHeroBg(value)?.css ?? 'transparent'
}

/** True when a real panel should be painted behind the media. */
export function hasHeroBg(value: string): boolean {
  return heroBgCss(value) !== 'transparent'
}

/** True for anything with a gradient to dither — solids have no banding to break up. */
export function isHeroGradient(value: string): boolean {
  return HERO_GRADIENTS.some((p) => p.value === value)
}

/* ------------------------------------------------------------ Sampling */

/** Colour at t (0–1) along stops: OKLab, eased between each pair of stops. */
export function sampleStops(stops: GradientStop[], t: number): Lab {
  const labs = stops.map(([c]) => rgbToOklab(hexToRgb(c)))
  if (t <= stops[0][1]) return labs[0]
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][1]) {
      const span = stops[i][1] - stops[i - 1][1] || 1
      return mixLab(labs[i - 1], labs[i], smoothstep((t - stops[i - 1][1]) / span))
    }
  }
  return labs[labs.length - 1]
}

/** A lookup table of n RGB colours along the stops — the fast path for canvases. */
export function stopsLut(stops: GradientStop[], n = 1024): Float32Array {
  const out = new Float32Array(n * 3)
  const labs = stops.map(([c]) => rgbToOklab(hexToRgb(c)))
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    let lab = labs[labs.length - 1]
    if (t <= stops[0][1]) lab = labs[0]
    else
      for (let k = 1; k < stops.length; k++) {
        if (t <= stops[k][1]) {
          const span = stops[k][1] - stops[k - 1][1] || 1
          lab = mixLab(labs[k - 1], labs[k], smoothstep((t - stops[k - 1][1]) / span))
          break
        }
      }
    const [r, g, b] = oklabToRgb(lab)
    out[i * 3] = r
    out[i * 3 + 1] = g
    out[i * 3 + 2] = b
  }
  return out
}

/** The same highlight as an alpha at a point, for the canvas render. */
export function highlightAlpha(u: number, v: number, w: number, h: number): number {
  const dx = ((u - 0.22) * w) / (1.2 * w)
  const dy = ((v - 0.02) * h) / h
  const d = Math.sqrt(dx * dx + dy * dy)
  return d >= 0.62 ? 0 : 0.2 * (1 - d / 0.62)
}

/** Mesh blob weight: a soft, compact falloff — full at the centre, gone at `radius`. */
export function meshWeight(d: number, radius: number): number {
  if (d >= radius) return 0
  const k = 1 - d / radius
  return k * k * (3 - 2 * k)
}

/**
 * A CSS rendition of a spec. Linear and radial ramps are pre-sampled in OKLab
 * into many sRGB stops, so the smoothness holds in every browser — no reliance
 * on `in oklab` support.
 */
function specCss(spec: GradientSpec, highlight: boolean): string {
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`
  const ramp = (stops: GradientStop[]) =>
    Array.from({ length: 17 }, (_, i) => {
      const t = i / 16
      return `${rgbToHex(oklabToRgb(sampleStops(stops, t)))} ${pct(t)}`
    }).join(', ')
  const top = highlight ? `${HIGHLIGHT_CSS}, ` : ''
  if (spec.kind === 'linear') return `${top}linear-gradient(${spec.angle}deg, ${ramp(spec.stops)})`
  if (spec.kind === 'radial') return `${top}radial-gradient(circle farthest-corner at ${pct(spec.x)} ${pct(spec.y)}, ${ramp(spec.stops)})`
  const layers = spec.points.map((p) => {
    const [r, g, b] = hexToRgb(p.color)
    return `radial-gradient(circle at ${pct(p.x)} ${pct(p.y)}, rgba(${r},${g},${b},1) 0%, rgba(${r},${g},${b},0.55) ${pct(p.radius * 0.45)}, rgba(${r},${g},${b},0) ${pct(p.radius * 0.95)})`
  })
  return `${layers.join(', ')}, ${spec.base}`
}

function preset(value: string, label: string, family: BackdropFamily, spec: GradientSpec, highlight: boolean): HeroBgPreset {
  return { value, label, family, spec, highlight, css: specCss(spec, highlight) }
}

/**
 * Render a spec into a float RGB field (0–255, 3 per pixel) at w×h — the input
 * the dither step quantizes. Linear and radial use a 1024-entry lookup table;
 * mesh blends blobs in OKLab.
 */
export function renderSpec(spec: GradientSpec, w: number, h: number, highlight: boolean): Float32Array {
  const out = new Float32Array(w * h * 3)
  const addHighlight = (i: number, u: number, v: number) => {
    if (!highlight) return
    const a = highlightAlpha(u, v, w, h)
    if (a <= 0) return
    out[i] += (255 - out[i]) * a
    out[i + 1] += (255 - out[i + 1]) * a
    out[i + 2] += (255 - out[i + 2]) * a
  }

  if (spec.kind === 'linear' || spec.kind === 'radial') {
    const lut = stopsLut(spec.stops)
    const n = lut.length / 3
    let tAt: (x: number, y: number) => number
    if (spec.kind === 'linear') {
      // CSS angle convention: 0deg points up, clockwise; the gradient line
      // spans the box's projection onto that direction.
      const rad = (spec.angle * Math.PI) / 180
      const dx = Math.sin(rad)
      const dy = -Math.cos(rad)
      const len = Math.abs(w * dx) + Math.abs(h * dy)
      tAt = (x, y) => ((x - w / 2) * dx + (y - h / 2) * dy) / len + 0.5
    } else {
      const cx = spec.x * w
      const cy = spec.y * h
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy))
      tAt = (x, y) => Math.hypot(x - cx, y - cy) / far
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = Math.min(1, Math.max(0, tAt(x + 0.5, y + 0.5)))
        const k = Math.round(t * (n - 1)) * 3
        const i = (y * w + x) * 3
        out[i] = lut[k]
        out[i + 1] = lut[k + 1]
        out[i + 2] = lut[k + 2]
        addHighlight(i, (x + 0.5) / w, (y + 0.5) / h)
      }
    }
    return out
  }

  // Mesh: blend blob colours over the base in OKLab. Distances are measured in
  // units of the box's shorter side, so blobs stay round in any aspect ratio.
  const base = rgbToOklab(hexToRgb(spec.base))
  const pts = spec.points.map((p) => ({ ...p, lab: rgbToOklab(hexToRgb(p.color)) }))
  const unit = Math.min(w, h) || 1
  const aspectX = w / unit
  const aspectY = h / unit
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w
      const v = (y + 0.5) / h
      let L = 0
      let A = 0
      let B = 0
      let total = 0
      for (const p of pts) {
        const d = Math.hypot((u - p.x) * aspectX, (v - p.y) * aspectY)
        const wgt = meshWeight(d, p.radius * Math.max(aspectX, aspectY))
        if (wgt === 0) continue
        L += p.lab[0] * wgt
        A += p.lab[1] * wgt
        B += p.lab[2] * wgt
        total += wgt
      }
      // Under full coverage, normalize the blob mix; below it, the base fills
      // the remainder — a convex blend, continuous where coverage reaches 1.
      const rest = Math.max(0, 1 - total)
      const lab: Lab = total >= 1 ? [L / total, A / total, B / total] : [L + base[0] * rest, A + base[1] * rest, B + base[2] * rest]
      const [r, g, b]: RGB = oklabToRgb(lab)
      const i = (y * w + x) * 3
      out[i] = r
      out[i + 1] = g
      out[i + 2] = b
    }
  }
  return out
}

/**
 * Bilinear upsample of a float RGB field. Mesh gradients are smooth by nature,
 * so they're computed on a coarse grid and interpolated — the per-pixel blob
 * maths is the expensive part, and nothing is lost at the resolution a dither
 * then quantizes.
 */
export function upsample(src: Float32Array, sw: number, sh: number, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h * 3)
  for (let y = 0; y < h; y++) {
    const fy = Math.min(sh - 1, Math.max(0, ((y + 0.5) * sh) / h - 0.5))
    const y0 = Math.floor(fy)
    const y1 = Math.min(sh - 1, y0 + 1)
    const ty = fy - y0
    for (let x = 0; x < w; x++) {
      const fx = Math.min(sw - 1, Math.max(0, ((x + 0.5) * sw) / w - 0.5))
      const x0 = Math.floor(fx)
      const x1 = Math.min(sw - 1, x0 + 1)
      const tx = fx - x0
      const a = (y0 * sw + x0) * 3
      const b = (y0 * sw + x1) * 3
      const c = (y1 * sw + x0) * 3
      const d = (y1 * sw + x1) * 3
      const o = (y * w + x) * 3
      for (let k = 0; k < 3; k++) {
        const top = src[a + k] + (src[b + k] - src[a + k]) * tx
        const bottom = src[c + k] + (src[d + k] - src[c + k]) * tx
        out[o + k] = top + (bottom - top) * ty
      }
    }
  }
  return out
}

/** Colours sampled evenly along a gradient — the palette a stylized dither snaps to. */
export function gradientPalette(spec: GradientSpec, count: number): [number, number, number][] {
  if (spec.kind === 'mesh') {
    // The base and each blob's colour, then — for a bigger palette — the
    // OKLab steps between the base and each blob, which is where a mesh's
    // in-between tones actually live. Fewer than that keeps the base and the
    // first blobs.
    const base = rgbToOklab(hexToRgb(spec.base))
    const blobs = spec.points.map((p) => rgbToOklab(hexToRgb(p.color)))
    const out: Lab[] = [base, ...blobs]
    for (const t of [0.5, 0.25, 0.75, 0.375, 0.625, 0.125, 0.875]) {
      for (const c of blobs) if (out.length < count) out.push(mixLab(base, c, t))
    }
    return out.slice(0, Math.max(2, count)).map((lab) => oklabToRgb(lab) as [number, number, number])
  }
  return Array.from({ length: count }, (_, i) => {
    const [r, g, b] = oklabToRgb(sampleStops(spec.stops, count === 1 ? 0 : i / (count - 1)))
    return [r, g, b] as [number, number, number]
  })
}
