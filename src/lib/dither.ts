/**
 * Dithering, after makew0rld/dither (github.com/makew0rld/dither): ordered
 * (Bayer) matrices, error-diffusion kernels and random noise, quantizing to a
 * palette or to N levels per channel.
 *
 * Two jobs in this kit:
 *   • Invisible — quantize a float gradient to 8 bits with a ±½-step Bayer
 *     threshold, so a large, smooth ramp shows no banding on any display.
 *   • Visible — quantize to a handful of colours at a chunky pixel size for the
 *     plotted, print-like texture of a dithered image.
 */

export type OrderedAlgorithm = 'bayer2' | 'bayer4' | 'bayer8'
export type DiffusionAlgorithm =
  | 'floyd-steinberg'
  | 'atkinson'
  | 'jarvis-judice-ninke'
  | 'stucki'
  | 'burkes'
  | 'sierra'
  | 'sierra-lite'
export type DitherAlgorithm = OrderedAlgorithm | DiffusionAlgorithm | 'noise'

export const DITHER_ALGORITHMS: { value: DitherAlgorithm; label: string; kind: 'ordered' | 'diffusion' | 'noise' }[] = [
  { value: 'bayer2', label: 'Bayer 2×2', kind: 'ordered' },
  { value: 'bayer4', label: 'Bayer 4×4', kind: 'ordered' },
  { value: 'bayer8', label: 'Bayer 8×8', kind: 'ordered' },
  { value: 'floyd-steinberg', label: 'Floyd–Steinberg', kind: 'diffusion' },
  { value: 'atkinson', label: 'Atkinson', kind: 'diffusion' },
  { value: 'jarvis-judice-ninke', label: 'Jarvis–Judice–Ninke', kind: 'diffusion' },
  { value: 'stucki', label: 'Stucki', kind: 'diffusion' },
  { value: 'burkes', label: 'Burkes', kind: 'diffusion' },
  { value: 'sierra', label: 'Sierra', kind: 'diffusion' },
  { value: 'sierra-lite', label: 'Sierra Lite', kind: 'diffusion' },
  { value: 'noise', label: 'Random noise', kind: 'noise' },
]

/** Recursive Bayer matrix of size n (a power of two), values 0..n²-1. */
function bayer(n: number): number[] {
  if (n === 1) return [0]
  const half = n / 2
  const m = bayer(half)
  const out = new Array<number>(n * n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const base = 4 * m[(y % half) * half + (x % half)]
      const quad = (y < half ? 0 : 2) + (x < half ? 0 : 1)
      out[y * n + x] = base + [0, 2, 3, 1][quad]
    }
  }
  return out
}

const BAYER: Record<OrderedAlgorithm, { n: number; m: number[] }> = {
  bayer2: { n: 2, m: bayer(2) },
  bayer4: { n: 4, m: bayer(4) },
  bayer8: { n: 8, m: bayer(8) },
}

/** Error-diffusion kernels as [dx, dy, weight] with their divisor. */
const KERNELS: Record<DiffusionAlgorithm, { div: number; taps: [number, number, number][] }> = {
  'floyd-steinberg': { div: 16, taps: [[1, 0, 7], [-1, 1, 3], [0, 1, 5], [1, 1, 1]] },
  // Atkinson spreads only 6/8 of the error — lighter, higher-contrast result.
  atkinson: { div: 8, taps: [[1, 0, 1], [2, 0, 1], [-1, 1, 1], [0, 1, 1], [1, 1, 1], [0, 2, 1]] },
  'jarvis-judice-ninke': {
    div: 48,
    taps: [[1, 0, 7], [2, 0, 5], [-2, 1, 3], [-1, 1, 5], [0, 1, 7], [1, 1, 5], [2, 1, 3], [-2, 2, 1], [-1, 2, 3], [0, 2, 5], [1, 2, 3], [2, 2, 1]],
  },
  stucki: {
    div: 42,
    taps: [[1, 0, 8], [2, 0, 4], [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2], [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1]],
  },
  burkes: { div: 32, taps: [[1, 0, 8], [2, 0, 4], [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2]] },
  sierra: {
    div: 32,
    taps: [[1, 0, 5], [2, 0, 3], [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2], [-1, 2, 2], [0, 2, 3], [1, 2, 2]],
  },
  'sierra-lite': { div: 4, taps: [[1, 0, 2], [-1, 1, 1], [0, 1, 1]] },
}

export interface DitherOptions {
  algorithm: DitherAlgorithm
  /** Colours to snap to. Takes precedence over `levels`. */
  palette?: [number, number, number][]
  /** Steps per channel when no palette is given. 256 = invisible anti-banding. */
  levels?: number
  /** Scale of the ordered/noise threshold, 0–1. */
  strength?: number
  /** Alternate scan direction per row — reduces diffusion "worms". */
  serpentine?: boolean
  /** Seed for the noise algorithm, so a render is repeatable. */
  seed?: number
}

function nearest(palette: [number, number, number][], r: number, g: number, b: number): [number, number, number] {
  let best = palette[0]
  let bestD = Infinity
  for (const p of palette) {
    // Weighted RGB distance ("redmean") — cheap and close to perceptual.
    const rm = (p[0] + r) / 2
    const dr = p[0] - r
    const dg = p[1] - g
    const db = p[2] - b
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  return best
}

/**
 * Dither a float RGB buffer (0–255, 3 floats per pixel) into RGBA bytes.
 * The input buffer is used as scratch space for error diffusion.
 */
export function dither(src: Float32Array, width: number, height: number, out: Uint8ClampedArray, opts: DitherOptions) {
  const { algorithm, palette, levels = 256, strength = 1, serpentine = true, seed = 7 } = opts
  const step = palette ? 255 / Math.max(1, palette.length - 1) : 255 / Math.max(1, levels - 1)
  const quantize = palette
    ? (r: number, g: number, b: number) => nearest(palette, r, g, b)
    : (r: number, g: number, b: number): [number, number, number] => [
        Math.round(r / step) * step,
        Math.round(g / step) * step,
        Math.round(b / step) * step,
      ]

  if (algorithm in BAYER || algorithm === 'noise') {
    const ordered = BAYER[algorithm as OrderedAlgorithm]
    let s = seed >>> 0 || 1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let t: number
        if (ordered) {
          t = (ordered.m[(y % ordered.n) * ordered.n + (x % ordered.n)] + 0.5) / (ordered.n * ordered.n) - 0.5
        } else {
          // xorshift32 — deterministic white noise
          s ^= s << 13
          s ^= s >>> 17
          s ^= s << 5
          t = (s >>> 0) / 4294967296 - 0.5
        }
        const i = (y * width + x) * 3
        const o = (y * width + x) * 4
        const offset = t * step * strength
        const [r, g, b] = quantize(src[i] + offset, src[i + 1] + offset, src[i + 2] + offset)
        out[o] = r
        out[o + 1] = g
        out[o + 2] = b
        out[o + 3] = 255
      }
    }
    return
  }

  const { div, taps } = KERNELS[algorithm as DiffusionAlgorithm]
  for (let y = 0; y < height; y++) {
    const reverse = serpentine && y % 2 === 1
    for (let k = 0; k < width; k++) {
      const x = reverse ? width - 1 - k : k
      const i = (y * width + x) * 3
      const r = src[i]
      const g = src[i + 1]
      const b = src[i + 2]
      const [qr, qg, qb] = quantize(r, g, b)
      const o = (y * width + x) * 4
      out[o] = qr
      out[o + 1] = qg
      out[o + 2] = qb
      out[o + 3] = 255
      const er = r - qr
      const eg = g - qg
      const eb = b - qb
      for (const [dx0, dy, w] of taps) {
        const dx = reverse ? -dx0 : dx0
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= width || ny >= height) continue
        const j = (ny * width + nx) * 3
        const f = w / div
        src[j] += er * f
        src[j + 1] += eg * f
        src[j + 2] += eb * f
      }
    }
  }
}
