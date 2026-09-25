import { ArrowsOut } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { hasHeroBg } from '../lib/hero'
import { Backdrop, type BackdropDither } from './Backdrop'

interface HeroPanelBase {
  /** A preset ('g-violet', 'm-aurora', 'r-glow', 's-ink'), a raw hex, or 'none'. */
  bg: string
  /**
   * `smooth` (default) removes banding invisibly; any dither algorithm gives a
   * visible, plotted texture. `false` for a plain CSS gradient.
   */
  dither?: BackdropDither | boolean
  /** CSS pixels per dither pixel, for the visible algorithms. */
  pixelSize?: number
  /** Palette size for the visible algorithms. */
  levels?: number
  /** Inset between the media and the panel's edge. */
  padding?: number
  /** Offer a full-screen view — adds a corner button and makes the image clickable. */
  onExpand?: () => void
  className?: string
  /** Replace the <img> — it must fill the padded box and cap its own media. */
  children?: React.ReactNode
}

/** An image brings the alt text it needs; `alt=""` says, deliberately, that it's decoration. */
export type HeroPanelProps = HeroPanelBase & ({ src: string; alt: string } | { src?: undefined; alt?: undefined })

/**
 * Media floating on a full-bleed backdrop (shots.so style).
 *
 * Sizing contract: give the panel a definite height. Padding carves the inset
 * out of it and the media is capped at max-h-full / max-w-full as a direct
 * child — so it can never overflow the panel whatever its aspect ratio.
 */
export function HeroPanel({ bg, src, alt, dither, pixelSize, levels, padding = 40, onExpand, className, children }: HeroPanelProps) {
  const body = (
    <>
      {children ??
        (src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onClick={onExpand}
            className={cn(
              'relative block max-h-full max-w-full rounded-[calc(var(--radius-2xl)*1.125)] object-contain outline outline-1 -outline-offset-1 outline-black/10',
              onExpand && 'cursor-zoom-in',
            )}
          />
        ))}
      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          aria-label="View full screen"
          // Hidden until hover only where hover exists; always there on touch.
          className="u-press absolute end-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-lg bg-shade/70 text-white hover:bg-shade focus-visible:outline-offset-2 [@media(hover:hover)]:opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100"
        >
          <ArrowsOut size={16} aria-hidden="true" />
        </button>
      )}
    </>
  )

  if (!hasHeroBg(bg)) {
    return (
      <div className={cn('group/hero relative flex w-full items-center justify-center overflow-hidden', className)} style={{ padding }}>
        {body}
      </div>
    )
  }
  return (
    <Backdrop
      bg={bg}
      dither={dither}
      pixelSize={pixelSize}
      levels={levels}
      className={cn('group/hero flex w-full items-center justify-center', className)}
      style={{ padding }}
    >
      {body}
    </Backdrop>
  )
}
