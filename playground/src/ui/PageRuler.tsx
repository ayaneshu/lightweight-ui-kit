import { useEffect, useRef, useState } from 'react'

const STEP = 100 // a label every 100px

/**
 * A ruler down the right edge of the window, measured in page pixels: a tick
 * every 20px, a long tick and a label every 100px, and the page's full length
 * marked where it ends. It scrolls with the page, fades out at the top and
 * bottom, and is pure decoration — hidden from assistive tech, and it never
 * takes a click.
 *
 * Ticks are two repeating gradients, so a 10,000px page costs no extra DOM;
 * only the labels near the viewport are rendered. Scrolling moves the strip
 * with a transform, written straight to the element, not through React.
 */
export function PageRuler() {
  const strip = useRef<HTMLDivElement>(null)
  const [length, setLength] = useState(0)
  const [view, setView] = useState({ from: 0, to: 0 })

  useEffect(() => {
    let raf = 0
    const sync = () => {
      raf = 0
      const y = window.scrollY
      if (strip.current) strip.current.style.transform = `translateY(${-y}px)`
      // Re-render only when a new band of labels comes into range.
      const from = Math.max(0, Math.floor(y / STEP) - 2) * STEP
      const to = Math.ceil((y + window.innerHeight) / STEP + 2) * STEP
      setView((v) => (v.from === from && v.to === to ? v : { from, to }))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync)
    }
    const measure = () => {
      setLength(document.documentElement.scrollHeight)
      sync()
    }
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    measure()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const labels: number[] = []
  for (let y = Math.max(STEP, view.from); y <= Math.min(view.to, length - 40); y += STEP) labels.push(y)

  return (
    <>
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 end-0 z-10 hidden w-8 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_84%,transparent)] lg:block"
    >
      <div ref={strip} className="absolute inset-x-0 top-0 will-change-transform" style={{ height: length }}>
        {/* The spine, the 20px ticks and the 100px ticks. */}
        <div
          className="absolute inset-y-0 start-0 w-3.5 border-s border-line"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, var(--color-line-control) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line-strong) 1px, transparent 1px)',
            backgroundSize: '14px 100px, 6px 20px',
            backgroundRepeat: 'repeat-y',
          }}
        />
        {/* Positioned in normal writing mode; only the text itself turns vertical
            (inside vertical text, "start" and "end" mean top and bottom). */}
        {labels.map((y) => (
          <span key={y} className="absolute start-[15px] -translate-y-1/2" style={{ top: y }}>
            <span className="block font-mono text-[9.5px] tabular-nums tracking-wide text-muted/70 [writing-mode:vertical-rl]">{y}</span>
          </span>
        ))}
        {/* Where the page ends. */}
        {length > 0 && <div className="absolute start-0 h-px w-3.5 bg-ink" style={{ top: length - 1 }} />}
      </div>
    </div>
    {/* The page's full length, below the fade so it's always readable. */}
    {length > 0 && (
      <div aria-hidden="true" className="pointer-events-none fixed bottom-4 end-0 z-10 hidden w-8 justify-center lg:flex">
        <span className="font-mono text-[9.5px] font-medium tabular-nums text-muted [writing-mode:vertical-rl]">{length.toLocaleString('en')}px</span>
      </div>
    )}
    </>
  )
}
