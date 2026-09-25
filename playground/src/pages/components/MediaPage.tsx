import { useEffect, useRef, useState } from 'react'
import { ArrowCounterClockwise, ArrowsOut, PaintBrush, Trash } from 'lightweight-ui/icons'
import {
  Button,
  CustomColorSwatch,
  DeviceFrame,
  Dropzone,
  HERO_GRADIENTS,
  HERO_SOLIDS,
  HeroPanel,
  Lightbox,
  MediaActionButton,
  MediaActions,
  Swatch,
  VoiceRecorder,
  ZoomableImage,
  isCustomHeroBg,
  isHeroGradient,
} from 'lightweight-ui'
import { Caption, Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section } from '../../ui/Demo'

const LANDSCAPE = './thumbnails/ascii-1.webp'
const PORTRAIT = './thumbnails/ascii-3.webp'

/* ----------------------------------------------------------- Phone mock */

const PHONE_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box}
  body{margin:0;height:100vh;font:15px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f6f5;color:#18191d;position:relative;overflow:hidden}
  .bar{height:48px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 24px 6px;font-size:13px;font-weight:600}
  header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;font-weight:600;font-size:17px}
  .dot{width:32px;height:32px;border-radius:50%;background:#4f46e5;color:#fff;display:grid;place-items:center;font-size:12px}
  .hero{margin:6px 16px 0;height:280px;border-radius:26px;background:radial-gradient(120% 100% at 22% 2%,rgba(255,255,255,.2),rgba(255,255,255,0) 62%),linear-gradient(158deg,#6f6df2 0%,#7b4fd8 44%,#3b2a86 100%)}
  h1{font-size:26px;line-height:1.15;letter-spacing:-.02em;margin:22px 20px 6px}
  p{margin:0 20px;color:#76798a}
  .row{display:flex;gap:10px;margin:18px 20px 0}
  .chip{flex:1;padding:12px;border-radius:16px;background:#fff;border:1px solid #ededec;font-size:13px;color:#76798a}
  .chip b{display:block;color:#18191d;font-size:17px}
  button{position:absolute;left:20px;right:20px;bottom:34px;height:52px;border:0;border-radius:16px;background:#18191d;color:#fff;font-family:inherit;font-size:16px;font-weight:600;cursor:pointer}
</style></head>
<body>
  <div class="bar"><span>9:41</span><span>●●● ▮</span></div>
  <header><span>Acme Store</span><span class="dot">SK</span></header>
  <div class="hero"></div>
  <h1>Violet lamp, second edition</h1>
  <p>Softer light, the same square shade. Ships in two days.</p>
  <div class="row"><div class="chip"><b>$84</b>price</div><div class="chip"><b>4.8★</b>212 reviews</div></div>
  <button onclick="this.textContent='Added to bag ✓'">Add to bag</button>
</body></html>`

const PHONE_SRC = `data:text/html;charset=utf-8,${encodeURIComponent(PHONE_HTML)}`

/* ------------------------------------------------------------------ Page */

export default function MediaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Media"
        description="Components for images, prototypes and voice notes. Media sits on a colour background instead of a grey box. Controls appear over it only when you point at it. If anything is cropped, there's always a way to see it in full."
      />

      <Section
        id="hero-panel"
        title="Hero panel"
        description="Shows an image on an edge-to-edge colour or gradient background. Give the panel a fixed height. Padding sets the space around the image, and the image scales to fit inside that space, so it never overflows, whatever its shape."
      >
        <HeroPlayground />
      </Section>

      <Section
        id="dropzone"
        title="Dropzone"
        description="An area where people click to choose a file, or drop one in. The dashed border turns solid while a file is dragged over it, so it's clear where to drop. It gives you File objects, and you handle the upload. Pass busy while the upload runs."
      >
        <DropzoneDemo />
      </Section>

      <Section
        id="device-frame"
        title="Device frame"
        description="Shows a web page or prototype at phone size, scaled to fit the space it's given. The iframe keeps its real 375×812 viewport, so the prototype is zoomed, not reflowed into a layout nobody designed. It re-fits whenever the layout changes."
      >
        <DeviceDemo />
      </Section>

      <Section
        id="media-actions"
        title="Media actions"
        description="A row of dark buttons over a piece of media, for actions like expand, edit and delete. They appear with a dimmed overlay on hover. On touch screens, where there's no hover, they're always visible. A click on a button doesn't reach the media underneath."
      >
        <MediaActionsDemo />
      </Section>

      <Section
        id="zoomable-image"
        title="Zoomable image"
        description="An image that fits its column and opens in full in a lightbox. Click the image or the corner button to open it. The button stays visible on phones, where the image is smallest and most worth enlarging."
      >
        <Demo
          code={`<ZoomableImage src={answer.imageUrl} alt="Option C — portrait" caption="Option C · uploaded by Lena M" />`}
          className="gap-8"
        >
          <div className="w-[220px]">
            <ZoomableImage src={PORTRAIT} alt="A figure with a television for a head, under a rainbow" caption="Option C · uploaded by Lena M" />
          </div>
          <div className="w-[300px]">
            <ZoomableImage src={LANDSCAPE} alt="A meadow under a bright sky" caption="Option A · uploaded by Sara K" />
          </div>
        </Demo>
      </Section>

      <Section
        id="voice-recorder"
        title="Voice recorder"
        description="Lets people record a voice note, play it back and record again. Each of its three states has one control. By default, the recording becomes a local object URL. To store it somewhere, pass upload. It receives the audio blob and returns its URL."
      >
        <VoiceDemo />
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="HeroPanel"
          rows={[
            { name: 'bg', type: 'string', description: "A preset such as 'g-violet' or 's-ink', a hex colour, or 'none'." },
            { name: 'src / alt', type: 'string', description: 'The image. Pass children instead to show something else.' },
            { name: 'dither', type: 'boolean', default: 'true', description: 'Adds a fine pixel pattern over gradients to break up banding. Ignored on solid colours.' },
            { name: 'padding', type: 'number', default: '40', description: 'Space between the media and the panel edge, in px.' },
            { name: 'onExpand', type: '() => void', description: 'Adds a corner button and makes the image clickable.' },
            { name: 'className', type: 'string', description: 'Set a height here, such as h-[340px] or aspect-video.' },
          ]}
        />
        <PropsTable
          title="Dropzone"
          rows={[
            { name: 'onFiles', type: '(files: File[]) => void', description: 'The chosen or dropped files. Only one, unless multiple is set.' },
            { name: 'accept', type: 'string', default: "'image/*'", description: 'Which file types the file picker allows.' },
            { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows several files at once.' },
            { name: 'title / hint', type: 'ReactNode', default: "'Upload an image'", description: 'The two lines of text inside the drop area.' },
            { name: 'busy', type: 'boolean', default: 'false', description: 'Shows a spinner and “Uploading…”, and blocks new files.' },
            { name: 'size', type: "'md' | 'lg'", default: "'md'", description: '212px or 300px tall.' },
          ]}
        />
        <PropsTable
          title="DeviceFrame"
          rows={[
            { name: 'src', type: 'string', description: 'The URL to embed. It runs sandboxed, with scripts allowed.' },
            { name: 'title', type: 'string', default: "'Prototype'", description: 'The iframe’s title for screen readers.' },
            { name: 'width / height', type: 'number', default: '375 / 812', description: 'The viewport the prototype is designed for.' },
            { name: 'maxScale', type: 'number', default: '0.8', description: 'The largest scale it’s shown at, even when the column has room to spare.' },
          ]}
        />
        <PropsTable
          title="MediaActions · MediaActionButton"
          rows={[
            { name: 'children', type: 'ReactNode', description: 'MediaActions: the media.' },
            { name: 'actions', type: 'ReactNode', description: 'MediaActions: a row of MediaActionButtons.' },
            { name: 'label', type: 'string', description: 'MediaActionButton: the name for screen readers, also shown as a tooltip with no delay.' },
            { name: 'onClick', type: '() => void', description: 'MediaActionButton: the click doesn’t reach the media underneath.' },
          ]}
        />
        <PropsTable
          title="ZoomableImage"
          rows={[
            { name: 'src / alt', type: 'string', description: 'The image.' },
            { name: 'caption', type: 'ReactNode', default: 'alt', description: 'The title shown in the lightbox.' },
          ]}
        />
        <PropsTable
          title="VoiceRecorder"
          rows={[
            { name: 'value', type: 'string', description: "A playable URL once recorded, or '' before that." },
            { name: 'onChange', type: '(url: string) => void', description: "Gets the new URL, or '' when someone chooses Re-record." },
            { name: 'upload', type: '(blob: Blob) => Promise<string>', default: 'object URL', description: 'Saves the recording and returns its URL.' },
            { name: 'onBusyChange', type: '(busy: boolean) => void', description: 'True while recording or saving. Use it to hold back the form’s submit.' },
            { name: 'maxSeconds', type: 'number', default: '120', description: 'Recording stops automatically at this limit.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents recording and hides Re-record.' },
          ]}
        />
      </Section>
    </>
  )
}

/* ------------------------------------------------------------ Hero panel */

function HeroPlayground() {
  const [bg, setBg] = useState('g-violet')
  const [dither, setDither] = useState(true)
  const [padding, setPadding] = useState<'0' | '24' | '40' | '64'>('40')
  const [media, setMedia] = useState<'landscape' | 'portrait'>('landscape')
  const [expandable, setExpandable] = useState(true)
  const [open, setOpen] = useState(false)
  const src = media === 'landscape' ? LANDSCAPE : PORTRAIT
  const custom = isCustomHeroBg(bg) ? bg : undefined

  const code = `<HeroPanel
  bg="${bg}"
  src={image.url}${!dither ? '\n  dither={false}' : ''}${padding !== '40' ? `\n  padding={${padding}}` : ''}${expandable ? '\n  onExpand={() => setOpen(true)}' : ''}
  className="h-[340px] rounded-2xl"
/>`

  return (
    <Demo
      stage="none"
      code={code}
      codeOpen
      controls={
        <>
          <div>
            <p className="mb-1.5 flex justify-between text-label font-medium text-muted">
              bg <span className="font-mono text-caption">{bg}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {HERO_GRADIENTS.map((p) => (
                <Swatch key={p.value} background={p.css} label={p.label} size={24} selected={bg === p.value} onClick={() => setBg(p.value)} />
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {HERO_SOLIDS.map((p) => (
                <Swatch key={p.value} background={p.css} label={p.label} size={24} selected={bg === p.value} onClick={() => setBg(p.value)} />
              ))}
              <CustomColorSwatch value={custom} onChange={setBg} selected={Boolean(custom)} size={24} />
            </div>
          </div>
          <KnobSegment label="padding" value={padding} options={['0', '24', '40', '64'] as const} onChange={setPadding} />
          <KnobSegment label="media" value={media} options={['landscape', 'portrait'] as const} onChange={setMedia} />
          <div>
            <KnobToggle label="dither" checked={dither} onChange={setDither} />
            <KnobToggle label="onExpand" checked={expandable} onChange={setExpandable} />
          </div>
          {!isHeroGradient(bg) && dither && <Caption>Dither only affects gradients. A solid colour has no banding to break up.</Caption>}
        </>
      }
    >
      <div className="p-4">
        <HeroPanel
          bg={bg}
          src={src}
          alt="Sample artwork"
          dither={dither}
          padding={Number(padding)}
          onExpand={expandable ? () => setOpen(true) : undefined}
          className="h-[340px] rounded-2xl"
        />
      </div>
      <Lightbox open={open} onClose={() => setOpen(false)} src={src} alt="Sample artwork" caption="Sample artwork" />
    </Demo>
  )
}

/* --------------------------------------------------------------- Dropzone */

interface Picked {
  url: string
  name: string
  size: number
  image: boolean
}

function DropzoneDemo() {
  const [size, setSize] = useState<'md' | 'lg'>('md')
  const [picked, setPicked] = useState<Picked | null>(null)
  const [uploading, setUploading] = useState(false)
  const url = useRef<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (url.current) URL.revokeObjectURL(url.current)
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  function onFiles(files: File[]) {
    const file = files[0]
    if (!file) return
    if (url.current) URL.revokeObjectURL(url.current)
    url.current = URL.createObjectURL(file)
    const next = { url: url.current, name: file.name, size: file.size, image: file.type.startsWith('image/') }
    // A beat of "Uploading…" so the busy state is visible — a real upload would await here.
    setUploading(true)
    timer.current = setTimeout(() => {
      setUploading(false)
      setPicked(next)
    }, 700)
  }

  function clear() {
    if (url.current) URL.revokeObjectURL(url.current)
    url.current = null
    setPicked(null)
  }

  return (
    <Demo
      code={`const [busy, setBusy] = useState(false)

<Dropzone${size === 'lg' ? '\n  size="lg"' : ''}
  busy={busy}
  onFiles={async ([file]) => {
    setBusy(true)
    const url = await uploadImage(file)   // or URL.createObjectURL(file) for a local preview
    setBusy(false)
    onChange(url)
  }}
/>`}
      controls={
        <>
          <KnobSegment label="size" value={size} options={['md', 'lg'] as const} onChange={setSize} />
          <Caption>Choose or drop an image. It stays in your browser as an object URL, and nothing is uploaded.</Caption>
        </>
      }
    >
      <div className="w-full max-w-md">
        {picked ? (
          <div className="u-swap">
            <div className={size === 'lg' ? 'grid h-[300px] place-items-center overflow-hidden rounded-2xl border border-line bg-ink/[0.03]' : 'grid h-[212px] place-items-center overflow-hidden rounded-2xl border border-line bg-ink/[0.03]'}>
              {picked.image ? (
                <img src={picked.url} alt={picked.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <p className="px-6 text-center text-ui text-muted">This file isn’t an image, but the Dropzone still passed it on.</p>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-label text-muted">
                <span className="font-medium text-ink">{picked.name}</span> · {Math.max(1, Math.round(picked.size / 1024))} KB
              </p>
              <Button variant="secondary" size="sm" onClick={clear}>
                Replace file
              </Button>
            </div>
          </div>
        ) : (
          <Dropzone size={size} busy={uploading} onFiles={onFiles} />
        )}
      </div>
    </Demo>
  )
}

/* ----------------------------------------------------------- Device frame */

function DeviceDemo() {
  const [scale, setScale] = useState<'0.5' | '0.65' | '0.8'>('0.5')
  const [viewport, setViewport] = useState<'375×812' | '320×568'>('375×812')
  const [w, h] = viewport === '375×812' ? [375, 812] : [320, 568]

  return (
    <Demo
      code={`<DeviceFrame
  src={prototype.url}   // a Figma prototype, a staging build
  title="Checkout prototype — option B"${viewport !== '375×812' ? `\n  width={${w}}\n  height={${h}}` : ''}${scale !== '0.8' ? `\n  maxScale={${scale}}` : ''}
/>`}
      controls={
        <>
          <KnobSegment label="maxScale" value={scale} options={['0.5', '0.65', '0.8'] as const} onChange={setScale} />
          <KnobSegment label="viewport" value={viewport} options={['375×812', '320×568'] as const} onChange={setViewport} />
          <Caption>The page inside is a live data: URL. Try the “Add to bag” button.</Caption>
        </>
      }
    >
      <div className="w-full">
        <DeviceFrame key={viewport} src={PHONE_SRC} title="Sample store prototype" width={w} height={h} maxScale={Number(scale)} />
      </div>
    </Demo>
  )
}

/* ---------------------------------------------------------- Media actions */

const EDIT_BGS = ['g-sunset', 'g-mint', 'g-ocean', 'g-violet', 's-ink']

function MediaActionsDemo() {
  const [bg, setBg] = useState(0)
  const [removed, setRemoved] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <Demo
      code={`<MediaActions
  className="overflow-hidden rounded-2xl"
  actions={
    <>
      <MediaActionButton label="Expand" onClick={() => setOpen(true)}><ArrowsOut size={17} /></MediaActionButton>
      <MediaActionButton label="Edit backdrop" onClick={openEditor}><PaintBrush size={17} /></MediaActionButton>
      <MediaActionButton label="Delete" onClick={remove}><Trash size={17} /></MediaActionButton>
    </>
  }
>
  <HeroPanel bg={option.bg} src={option.imageUrl} className="h-[260px]" />
</MediaActions>`}
    >
      <div className="w-full max-w-md">
        {removed ? (
          <div className="u-swap flex h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong bg-ink/[0.015]">
            <p className="text-ui text-muted">Image removed.</p>
            <Button variant="secondary" size="sm" leadingIcon={<ArrowCounterClockwise size={14} aria-hidden="true" />} onClick={() => setRemoved(false)}>
              Undo
            </Button>
          </div>
        ) : (
          <MediaActions
            className="overflow-hidden rounded-2xl"
            actions={
              <>
                <MediaActionButton label="Expand" onClick={() => setOpen(true)}>
                  <ArrowsOut size={17} />
                </MediaActionButton>
                <MediaActionButton label="Edit backdrop" onClick={() => setBg((i) => (i + 1) % EDIT_BGS.length)}>
                  <PaintBrush size={17} />
                </MediaActionButton>
                <MediaActionButton label="Delete" onClick={() => setRemoved(true)}>
                  <Trash size={17} />
                </MediaActionButton>
              </>
            }
          >
            <HeroPanel bg={EDIT_BGS[bg]} src={LANDSCAPE} alt="A meadow under a bright sky" padding={32} className="h-[260px]" />
          </MediaActions>
        )}
        <Caption className="mt-2">Hover over the image. Edit changes the background. Delete offers an undo.</Caption>
      </div>
      <Lightbox open={open} onClose={() => setOpen(false)} src={LANDSCAPE} alt="A meadow under a bright sky" caption="Option A · A meadow under a bright sky" />
    </Demo>
  )
}

/* ---------------------------------------------------------- Voice recorder */

function VoiceDemo() {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [disabled, setDisabled] = useState(false)

  return (
    <Demo
      code={`const [note, setNote] = useState('')
const [busy, setBusy] = useState(false)

<VoiceRecorder
  value={note}
  onChange={setNote}
  onBusyChange={setBusy}${disabled ? '\n  disabled' : ''}
  // upload={(blob) => uploadAudio(blob)}   — omit for a local object URL
/>
<Button disabled={busy}>Submit</Button>`}
      controls={
        <>
          <KnobToggle label="disabled" checked={disabled} onChange={setDisabled} />
          <Caption>Your browser will ask to use your microphone. The recording stays in this tab.</Caption>
        </>
      }
    >
      <div className="w-full max-w-sm rounded-panel bg-card p-5 shadow-card">
        <p className="text-body font-semibold tracking-tight">Anything else we should know?</p>
        <p className="mb-4 mt-0.5 text-label text-muted">Optional. Record a voice note instead of typing.</p>
        <VoiceRecorder value={value} onChange={setValue} onBusyChange={setBusy} disabled={disabled} />
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-caption text-muted">{busy ? 'Recording. Submit waits until it’s done.' : value ? 'Voice note attached' : 'No voice note'}</span>
          <Button size="md" disabled={busy}>
            Submit
          </Button>
        </div>
      </div>
    </Demo>
  )
}
