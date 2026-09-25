import { useEffect, useRef, useState } from 'react'
import { ArrowsOut, CircleNotch, Microphone, UploadSimple } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { Lightbox } from './Dialog'
import Tooltip from './Tooltip'

/* ------------------------------------------------------------- DeviceFrame */

export interface DeviceFrameProps {
  /** A URL to embed — sandboxed, since it's usually someone else's prototype. */
  src: string
  title?: string
  /** The viewport the prototype is designed for. Defaults to a 375×812 phone. */
  width?: number
  height?: number
  /** The largest the frame is ever drawn, when the column has room to spare. */
  maxScale?: number
  /** A hairline and soft shadow, so a white prototype has an edge on a white page. */
  bordered?: boolean
  className?: string
}

/**
 * A phone-sized iframe scaled down to whatever width it's given. The iframe
 * keeps its real viewport throughout, so this stays a zoom — the prototype
 * never reflows to a layout nobody designed for. Measured with a
 * ResizeObserver, so it re-fits on every layout change.
 */
export function DeviceFrame({ src, title = 'Prototype', width = 375, height = 812, maxScale = 0.8, bordered = false, className }: DeviceFrameProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(maxScale)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const ro = new ResizeObserver(([entry]) => {
      const avail = entry.contentRect.width
      if (avail > 0) setScale(Math.min(maxScale, avail / width))
    })
    ro.observe(box)
    return () => ro.disconnect()
  }, [width, maxScale])

  return (
    <div ref={boxRef} className={cn('w-full', className)}>
      <div
        className={cn('relative mx-auto', bordered && 'shadow-card ring-1 ring-ink/10')}
        style={{ width: width * scale, height: height * scale, ...(bordered ? { borderRadius: 38 * scale } : null) }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="fullscreen; clipboard-write"
          referrerPolicy="no-referrer"
          className="absolute left-0 top-0 block overflow-hidden rounded-device border-0 bg-white"
          style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Dropzone */

export interface DropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  title?: React.ReactNode
  /** Says both ways in — a keyboard can't drop, so "choose" comes first. */
  hint?: React.ReactNode
  busy?: boolean
  size?: 'md' | 'lg'
  className?: string
}

/**
 * Choose or drop. A dashed well that goes solid ink while something is dragged
 * over it, so the drop target is unmistakable — the edge changes colour and
 * style, not width, so nothing inside shifts.
 */
export function Dropzone({
  onFiles,
  accept = 'image/*',
  multiple = false,
  title = 'Upload an image',
  hint = 'Choose a file, or drag one here',
  busy = false,
  size = 'md',
  className,
}: DropzoneProps) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <>
      <button
        type="button"
        disabled={busy}
        aria-busy={busy || undefined}
        data-static
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!over) setOver(true)
        }}
        // Moving across the well's own children fires dragleave too; only a
        // leave to somewhere outside it counts.
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const files = Array.from(e.dataTransfer.files)
          if (files.length) onFiles(multiple ? files : files.slice(0, 1))
        }}
        className={cn(
          'group flex w-full flex-col items-center justify-center rounded-2xl border px-6 text-center transition-colors focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-70',
          size === 'lg' ? 'min-h-[300px]' : 'min-h-[212px]',
          over ? 'border-solid border-ink bg-ink/[0.03]' : 'border-dashed border-line-control bg-ink/[0.015] not-disabled:hover:border-ink not-disabled:hover:bg-ink/[0.03]',
          className,
        )}
      >
        {busy ? (
          <CircleNotch size={22} aria-hidden="true" className="animate-spin text-muted [animation-duration:700ms]" />
        ) : (
          // The arrow rises toward the well's edge under the pointer, and higher with a file over it.
          <UploadSimple
            size={22}
            className={cn('text-muted transition-[translate,color] duration-200 ease-out group-hover:-translate-y-1 group-hover:text-ink', over && '-translate-y-1.5 text-ink')}
            aria-hidden="true"
          />
        )}
        <span className={cn('text-balance', size === 'lg' ? 'mt-4 text-stat font-semibold tracking-tight' : 'mt-2.5 text-body font-medium')}>
          {busy ? 'Uploading…' : over ? 'Drop to upload' : title}
        </span>
        {hint && <span className={cn('mt-1 text-pretty text-muted', size === 'lg' ? 'text-body' : 'text-label')}>{hint}</span>}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
    </>
  )
}

/* ----------------------------------------------------------- Media actions */

/**
 * A dark square with a tooltip — the controls that sit over a piece of media.
 * Shade rather than ink: it's drawn on a photo, not on the page, so it stays
 * dark in both themes.
 */
export function MediaActionButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip label={label} instant>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        aria-label={label}
        className="u-press grid h-9 w-9 place-items-center rounded-xl bg-shade/85 text-white hover:scale-105 hover:bg-shade focus-visible:outline-offset-2"
      >
        {children}
      </button>
    </Tooltip>
  )
}

/**
 * Media with a scrim and a row of actions over it — expand, edit, delete.
 * Revealed on hover where there is hover, always shown where there isn't, and
 * shown whenever focus is inside. The scrim never takes a click meant for the
 * media under it.
 */
export function MediaActions({ children, actions, className }: { children: React.ReactNode; actions: React.ReactNode; className?: string }) {
  return (
    <div className={cn('group/media relative flex w-full', className)}>
      {children}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 group-hover/media:opacity-100 group-focus-within/media:opacity-100">
        <div className="pointer-events-auto flex items-center gap-1.5">{actions}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ ZoomableImage */

/**
 * An image bounded by its column that opens whole in a lightbox. The image is
 * the button; the corner glyph just says so, and stays visible wherever there's
 * no hover to reveal it.
 */
export function ZoomableImage({ src, alt, caption, className }: { src: string; alt: string; caption?: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('group/zoom relative flex max-w-full items-center justify-center', className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `View full screen: ${alt}` : 'View image full screen'}
        data-static
        className="block max-w-full cursor-zoom-in rounded-2xl focus-visible:outline-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain outline outline-1 -outline-offset-1 outline-ink/10"
        />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-shade/70 text-white transition-opacity duration-150 [@media(hover:hover)]:opacity-0 group-hover/zoom:opacity-100 group-focus-within/zoom:opacity-100"
      >
        <ArrowsOut size={16} />
      </span>
      <Lightbox open={open} onClose={() => setOpen(false)} caption={caption} src={src} alt={alt} />
    </div>
  )
}

/* ------------------------------------------------------------ VoiceRecorder */

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** What went wrong, in terms of what to do next. */
function micError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : ''
  switch (name) {
    case 'NotAllowedError':
      return 'Microphone access is blocked. Allow it in your browser’s site settings, then try again.'
    case 'NotFoundError':
      return 'No microphone was found. Connect one and try again.'
    case 'NotReadableError':
      return 'Your microphone is in use by another app. Close it and try again.'
    case 'SecurityError':
      return 'Recording only works on a secure (https) page.'
    default:
      return 'Recording couldn’t start. Try again.'
  }
}

export interface VoiceRecorderProps {
  /** A playable URL once recorded; '' before. */
  value: string
  onChange: (url: string) => void
  /** Turn the recording into a URL — upload it somewhere. Defaults to a local object URL. */
  upload?: (blob: Blob) => Promise<string>
  /** Busy while recording or uploading, so a form can hold its submit. */
  onBusyChange?: (busy: boolean) => void
  maxSeconds?: number
  disabled?: boolean
}

/** Record from the mic, play it back, re-record. Three states, one control each. */
export function VoiceRecorder({ value, onChange, upload, onBusyChange, maxSeconds = 120, disabled = false }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }
  useEffect(() => clearTimer, [])

  function stop() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    setRecording(false)
    clearTimer()
  }

  // The limit is checked here rather than inside the interval's state updater:
  // updaters must be pure, and StrictMode runs them twice.
  useEffect(() => {
    if (recording && elapsed >= maxSeconds) stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, elapsed, maxSeconds])

  async function start() {
    setError(null)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Recording isn’t supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setSaving(true)
        ;(upload ? upload(blob) : Promise.resolve(URL.createObjectURL(blob)))
          .then(onChange)
          .catch(() => setError('The recording couldn’t be saved. Record it again.'))
          .finally(() => {
            setSaving(false)
            onBusyChange?.(false)
          })
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      onBusyChange?.(true)
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch (err) {
      onBusyChange?.(false)
      setError(micError(err))
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3">
        <audio src={value} controls aria-label="Voice note" className="h-10 w-full min-w-0" />
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={disabled}
          className="u-press flex-none rounded-control border border-line-strong px-3 py-2 text-label font-medium text-muted hover:bg-ink/[0.03] hover:text-ink focus-visible:outline-offset-2 disabled:hidden"
        >
          Re-record
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recording ? (
        <button
          type="button"
          onClick={stop}
          disabled={disabled}
          data-static
          className="u-press flex w-full items-center justify-center gap-2 rounded-2xl bg-danger-solid px-5 py-2.5 text-ui font-medium text-white hover:opacity-90 focus-visible:outline-offset-2"
        >
          <span className="u-circle h-2.5 w-2.5 animate-pulse rounded-full bg-white" aria-hidden="true" /> Stop recording
          <span className="tabular-nums" aria-hidden="true">
            · {fmtTime(elapsed)}
          </span>
        </button>
      ) : saving ? (
        <div
          role="status"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line-strong px-5 py-2.5 text-ui font-medium text-muted"
        >
          Saving recording…
        </div>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          data-static
          className="u-press flex w-full items-center justify-center gap-2 rounded-2xl border border-line-control px-5 py-2.5 text-ui font-medium text-ink hover:bg-ink/[0.03] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-ink/[0.03] disabled:text-muted"
        >
          <Microphone size={16} aria-hidden="true" /> Record a voice note
        </button>
      )}
      {/* Said once when recording starts, not every second the timer ticks. */}
      <p role="status" className="sr-only">
        {recording ? 'Recording' : ''}
      </p>
      {error && (
        <p role="alert" className="text-label text-pretty text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
