import { useState } from 'react'
import {
  Backdrop,
  CustomColorSwatch,
  DITHER_ALGORITHMS,
  HERO_GRADIENTS,
  HERO_SOLIDS,
  HeroPanel,
  isCustomHeroBg,
  isHeroGradient,
  Select,
  Slider,
  Swatch,
  cn,
  type BackdropDither,
  type BackdropFamily,
} from 'lightweight-ui'
import { Demo, PageHeader, PropsTable, Section } from '../../ui/Demo'

const FAMILIES: { family: BackdropFamily; title: string; blurb: string }[] = [
  {
    family: 'linear',
    title: 'Linear',
    blurb: 'Each has three colour stops: a light start, a saturated middle and a deep end. They all run along the same 158° angle. A soft, off-centre highlight makes the panel look lit.',
  },
  {
    family: 'mesh',
    title: 'Mesh',
    blurb: 'Soft patches of colour over a base colour, each fading out smoothly. They blend in OKLab, a colour space built around how we see, so where two meet you get the colour in between, not a grey smear.',
  },
  {
    family: 'radial',
    title: 'Radial',
    blurb: 'A glow that fades out from one point. Use it for media that should look lit from behind.',
  },
]

function ditherLabel(d: BackdropDither) {
  if (d === 'smooth') return 'Smooth'
  if (d === 'none') return 'None'
  return DITHER_ALGORITHMS.find((a) => a.value === d)?.label ?? d
}

export default function Backdrops() {
  const [bg, setBg] = useState('m-aurora')
  const [dither, setDither] = useState<BackdropDither>('smooth')
  const [pixelSize, setPixelSize] = useState(3)
  const [levels, setLevels] = useState(6)
  const custom = isCustomHeroBg(bg)
  const gradient = isHeroGradient(bg)
  const stylized = gradient && dither !== 'smooth' && dither !== 'none'

  const code = [
    `<HeroPanel bg="${bg}"`,
    gradient && dither !== 'smooth' ? ` dither="${dither}"` : '',
    stylized && pixelSize !== 3 ? ` pixelSize={${pixelSize}}` : '',
    stylized && levels !== 6 ? ` levels={${levels}}` : '',
    ` src="/hero.png" alt="…" className="h-[360px]" />`,
  ].join('')

  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Backdrops"
        description={`Backdrops are the one place the kit uses a lot of colour: an edge-to-edge background for an image or screenshot to sit on. Choose from ${HERO_GRADIENTS.length} gradients in three families, ${HERO_SOLIDS.length} solid colours or any hex value. Gradients are blended in OKLab and dithered, so even a large panel shows no colour bands.`}
      />

      <Section
        id="builder"
        title="Try it"
        description="HeroPanel takes a backdrop value: a preset name, a hex value or 'none'. The same component draws the panel in an editor, on the live screen and in a thumbnail, so a preview always matches what ships."
      >
        <Demo stage="none" code={code} codeOpen>
          <div className="grid md:grid-cols-[minmax(0,1fr)_280px]">
            <HeroPanel
              bg={bg}
              dither={dither}
              pixelSize={pixelSize}
              levels={levels}
              src="./thumbnails/ascii-2.webp"
              alt="Sample screenshot"
              className="h-[420px]"
            />
            <div className="max-h-[420px] space-y-4 overflow-y-auto border-t border-line p-4 md:border-s md:border-t-0">
              {FAMILIES.map((f) => (
                <div key={f.family}>
                  <p className="mb-2 text-label text-muted">{f.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {HERO_GRADIENTS.filter((p) => p.family === f.family).map((p) => (
                      <Swatch key={p.value} background={p.css} label={p.label} selected={bg === p.value} onClick={() => setBg(p.value)} />
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <p className="mb-2 text-label text-muted">Solids</p>
                <div className="flex flex-wrap gap-2">
                  {HERO_SOLIDS.map((p) => (
                    <Swatch key={p.value} background={p.css} label={p.label} selected={bg === p.value} onClick={() => setBg(p.value)} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CustomColorSwatch value={custom ? bg : undefined} selected={custom} onChange={setBg} />
                <span className="text-label text-muted">{custom ? bg : 'Custom colour'}</span>
                <button
                  type="button"
                  onClick={() => setBg('none')}
                  aria-pressed={bg === 'none'}
                  className={cn(
                    'u-press ms-auto rounded-xl border px-2.5 py-1 text-label font-medium focus-visible:outline-offset-2',
                    bg === 'none' ? 'border-ink bg-ink text-on-ink' : 'border-line-strong text-muted hover:bg-ink/[0.03] hover:text-ink',
                  )}
                >
                  None
                </button>
              </div>

              {gradient && (
                <div className="space-y-4 border-t border-line pt-4">
                  <label className="block">
                    <span className="mb-1.5 block text-label font-medium text-muted">Dither</span>
                    <Select size="sm" value={dither} onChange={(e) => setDither(e.target.value as BackdropDither)}>
                      <option value="smooth">Smooth (no visible texture)</option>
                      <option value="none">None (plain CSS)</option>
                      <optgroup label="Ordered">
                        {DITHER_ALGORITHMS.filter((a) => a.kind === 'ordered').map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Error diffusion">
                        {DITHER_ALGORITHMS.filter((a) => a.kind === 'diffusion').map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Noise">
                        {DITHER_ALGORITHMS.filter((a) => a.kind === 'noise').map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </optgroup>
                    </Select>
                  </label>
                  {stylized && (
                    <>
                      <Slider label="Pixel size" variant="compact" min={1} max={8} value={pixelSize} onChange={setPixelSize} />
                      <Slider label="Colours" variant="compact" min={2} max={16} value={levels} onChange={setLevels} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Demo>
      </Section>

      {FAMILIES.map((f) => (
        <Section key={f.family} id={f.family} title={`${f.title} gradients`} description={f.blurb}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {HERO_GRADIENTS.filter((g) => g.family === f.family).map((g) => (
              // The name is the button; its ::after stretches over the whole card.
              <div key={g.value} className="relative overflow-hidden rounded-2xl transition-colors has-[:hover]:border-line-strong has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink bg-ink/[0.03]">
                <Backdrop bg={g.value} className="h-28" />
                <div className="flex items-baseline justify-between gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBg(g.value)
                      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      document.getElementById('builder')?.scrollIntoView({ behavior: still ? 'auto' : 'smooth' })
                    }}
                    aria-label={`Try ${g.label}`}
                    className="text-label font-semibold outline-none after:absolute after:inset-0"
                  >
                    {g.label}
                  </button>
                  <code className="font-mono text-caption text-muted">{g.value}</code>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}

      <Section id="solids" title="Solids" description="Quieter options for when the media already has plenty of colour. Solids are never dithered, because a flat fill has no bands to hide.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {HERO_SOLIDS.map((s) => (
            <div key={s.value} className="overflow-hidden rounded-2xl bg-ink/[0.03]">
              <div className="h-16" style={{ background: s.css }} />
              <div className="px-3 py-2">
                <p className="text-label font-semibold">{s.label}</p>
                <code className="font-mono text-caption uppercase text-muted">{s.css}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="smooth"
        title="Smooth by default"
        description="A plain CSS gradient blends in sRGB and rounds every colour to 8 bits, so a wide gradient shows bands and muddy middles. Backdrop draws that CSS gradient first, as the server-rendered fallback. Then it redraws on a canvas, blending the stops in OKLab along an eased curve. Before each pixel is rounded, an 8×8 Bayer pattern nudges it by up to half a step. The bands disappear, and no visible texture is added."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <figure>
            <Backdrop bg="g-midnight" dither="none" className="h-48 rounded-2xl" />
            <figcaption className="mt-2 text-caption text-muted">dither="none": the plain CSS gradient</figcaption>
          </figure>
          <figure>
            <Backdrop bg="g-midnight" className="h-48 rounded-2xl" />
            <figcaption className="mt-2 text-caption text-muted">dither="smooth" (default)</figcaption>
          </figure>
        </div>
      </Section>

      <Section
        id="dither"
        title="Stylized dithering"
        description="Choose an algorithm to give the gradient a visible, print-like texture. The gradient is reduced to a few colours taken from along its own length, then drawn with large pixels. Ordered algorithms make a regular crosshatch. Error diffusion passes each pixel’s rounding error to its neighbours, which gives a looser, more natural grain."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DITHER_ALGORITHMS.map((a) => (
            <figure key={a.value}>
              <Backdrop bg="m-aurora" dither={a.value} pixelSize={3} levels={5} className="h-28 rounded-2xl" />
              <figcaption className="mt-2 flex items-baseline justify-between gap-2 text-caption">
                <span className="font-medium text-ink">{ditherLabel(a.value)}</span>
                <code className="font-mono text-muted">{a.value}</code>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="max-w-2xl text-label leading-relaxed text-pretty text-muted">
          The algorithms follow their standard definitions, as listed in{' '}
          <a href="https://github.com/makew0rld/dither" className="font-medium text-ink underline decoration-line-control/60 underline-offset-2 hover:decoration-ink">
            makew0rld/dither
          </a>
          . Error diffusion scans each row in the opposite direction to the last, so error doesn’t build up on one side. Colours are matched by how close they look, not by raw RGB values.
        </p>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Backdrop"
          rows={[
            { name: 'bg', type: 'string', description: "A preset name ('g-violet', 'm-aurora', 'r-glow', 's-ink'), any hex value, or 'none'." },
            { name: 'dither', type: "'smooth' | 'none' | DitherAlgorithm | boolean", default: "'smooth'", description: "'smooth' removes banding invisibly, 'none' uses the plain CSS gradient, and an algorithm name adds a visible texture. true means 'smooth' and false means 'none'." },
            { name: 'pixelSize', type: 'number', default: '3', description: 'How many CSS pixels wide each dither pixel is. Applies to the visible algorithms only.' },
            { name: 'levels', type: 'number', default: '6', description: 'How many colours the visible algorithms reduce the gradient to, sampled along its length.' },
            { name: 'children', type: 'ReactNode', description: 'Content drawn on top of the backdrop. Give the element a size, because the canvas fills it.' },
          ]}
        />
        <p className="max-w-2xl text-label leading-relaxed text-pretty text-muted">
          <code className="font-mono">HeroPanel</code> is a Backdrop with media inside. It adds the <code className="font-mono">src</code>, <code className="font-mono">alt</code>,{' '}
          <code className="font-mono">padding</code> and <code className="font-mono">onExpand</code> props. If you draw your own canvases, <code className="font-mono">dither()</code>,{' '}
          <code className="font-mono">renderSpec()</code> and the OKLab helpers are exported too.
        </p>
      </Section>
    </>
  )
}
