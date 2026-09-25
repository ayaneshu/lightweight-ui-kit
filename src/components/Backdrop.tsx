import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'
import { dither as runDither, type DitherAlgorithm } from '../lib/dither'
import { findHeroBg, gradientPalette, heroBgCss, renderSpec, upsample } from '../lib/hero'

/**
 * `smooth` — invisible: an 8×8 Bayer threshold at ±½ step quantizes the
 * gradient to 8 bits, so a panel-sized ramp shows no banding on any display.
 * Any algorithm — visible: the gradient is snapped to a small palette sampled
 * along it, at a chunky pixel size, for a plotted, print-like texture.
 */
export type BackdropDither = 'none' | 'smooth' | DitherAlgorithm

export interface BackdropProps {
  /** A preset ('g-violet', 'm-aurora', 's-ink'), a raw hex, or 'none'. */
  bg: string
  /** Defaults to `smooth` for gradients. `true` = smooth, `false` = none. */
  dither?: BackdropDither | boolean
  /** CSS pixels per dither pixel, for the visible algorithms. */
  pixelSize?: number
  /** Palette size for the visible algorithms. */
  levels?: number
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/** Largest canvas drawn at full resolution; bigger panels render smaller and scale. */
const MAX_PIXELS = 2_400_000

/** Recent renders, so remounting a card (a filter, a route change) repaints for free. */
const cache = new Map<string, ImageData>()
function remember(key: string, img: ImageData) {
  cache.set(key, img)
  if (cache.size > 24) cache.delete(cache.keys().next().value as string)
}

function mode(bg: string, dither: BackdropProps['dither']): BackdropDither {
  const spec = findHeroBg(bg)?.spec
  if (!spec || dither === false || dither === 'none') return 'none'
  if (dither === undefined || dither === true) return 'smooth'
  return dither
}

/**
 * A field of colour — gradient, mesh, radial or solid — that paints instantly
 * as CSS, then (for gradients) re-draws itself on a canvas with dithering once
 * it knows its size. The CSS stays underneath as the first paint and the
 * server-rendered fallback, so nothing flashes and nothing is blank without JS.
 *
 * Children sit above the canvas; give the element a size (the canvas fills it).
 */
export function Backdrop({ bg, dither, pixelSize = 3, levels = 6, className, style, children }: BackdropProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const [painted, setPainted] = useState(false)
  const m = mode(bg, dither)
  const css = heroBgCss(bg)
  const stylized = m !== 'none' && m !== 'smooth'

  // Measure — and re-measure on resize, rounded so sub-pixel jitter doesn't re-render.
  useEffect(() => {
    const el = rootRef.current
    if (!el || m === 'none') return
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width + parseFloat(getComputedStyle(el).paddingLeft) * 2)
      const h = Math.round(entry.contentRect.height + parseFloat(getComputedStyle(el).paddingTop) * 2)
      setSize((s) => (s && s.w === w && s.h === h ? s : { w, h }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [m])

  useEffect(() => {
    const spec = findHeroBg(bg)?.spec
    const canvas = canvasRef.current
    if (!spec || !canvas || !size || m === 'none' || size.w < 2 || size.h < 2) return
    let cw: number
    let ch: number
    if (stylized) {
      cw = Math.max(2, Math.ceil(size.w / pixelSize))
      ch = Math.max(2, Math.ceil(size.h / pixelSize))
    } else {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const scale = Math.min(dpr, Math.sqrt(MAX_PIXELS / (size.w * size.h)))
      cw = Math.max(2, Math.round(size.w * scale))
      ch = Math.max(2, Math.round(size.h * scale))
    }
    const key = `${bg}|${m}|${cw}x${ch}|${levels}`
    let cancelled = false
    // Next frame, so the CSS first paint and layout land before the work.
    const frame = requestAnimationFrame(() => {
      if (cancelled) return
      let img = cache.get(key)
      if (!img) {
        // Mesh blobs are smooth and costly per pixel: compute a coarse field,
        // then interpolate. Linear and radial use a lookup table at full size.
        let field: Float32Array
        if (spec.kind === 'mesh' && !stylized) {
          const fw = Math.max(32, Math.round(cw / 4))
          const fh = Math.max(32, Math.round(ch / 4))
          field = upsample(renderSpec(spec, fw, fh, false), fw, fh, cw, ch)
        } else {
          field = renderSpec(spec, cw, ch, Boolean(findHeroBg(bg)?.highlight))
        }
        img = new ImageData(cw, ch)
        runDither(field, cw, ch, img.data, stylized
          ? { algorithm: m as DitherAlgorithm, palette: gradientPalette(spec, levels) }
          : { algorithm: 'bayer8', levels: 256 })
        remember(key, img)
      }
      canvas.width = cw
      canvas.height = ch
      canvas.getContext('2d')?.putImageData(img, 0, 0)
      setPainted(true)
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [bg, m, size, pixelSize, levels, stylized])

  return (
    <div
      ref={rootRef}
      className={cn('relative isolate overflow-hidden', className)}
      style={{ ...style, ...(css !== 'transparent' ? { background: css } : null) }}
    >
      {m !== 'none' && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 -z-10 h-full w-full transition-opacity duration-200',
            painted ? 'opacity-100' : 'opacity-0',
          )}
          style={stylized ? { imageRendering: 'pixelated' } : undefined}
        />
      )}
      {children}
    </div>
  )
}
