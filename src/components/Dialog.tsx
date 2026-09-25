import { createContext, useContext, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { useDismiss, useFocusTrap, usePresence } from '../lib/hooks'
import { Button } from './Button'

/* ---------------------------------------------------------------- Dialog */

interface DialogCtx {
  titleId: string
  descriptionId: string
  onClose: () => void
  setTitled: (on: boolean) => void
  setDescribed: (on: boolean) => void
}
const DialogContext = createContext<DialogCtx | null>(null)

/** Registers a title or description with the dialog, so aria-* never points at nothing. */
function useRegister(key: 'setTitled' | 'setDescribed', active = true) {
  const ctx = useContext(DialogContext)
  const set = ctx?.[key]
  useEffect(() => {
    if (!active) return
    set?.(true)
    return () => set?.(false)
  }, [set, active])
  return ctx
}

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl'

const WIDTH: Record<DialogSize, string> = {
  sm: 'max-w-[400px] rounded-panel',
  md: 'max-w-[460px] rounded-sheet',
  lg: 'max-w-[520px] rounded-sheet',
  xl: 'max-w-[640px] rounded-sheet',
}

export interface DialogProps {
  open: boolean
  onClose: () => void
  size?: DialogSize
  /** `alertdialog` for a confirmation that interrupts. */
  role?: 'dialog' | 'alertdialog'
  /** Centre vertically (short dialogs) or hang from the top and scroll (tall ones). */
  placement?: 'center' | 'top'
  /** Element to focus on open; defaults to the first focusable inside. */
  initialFocus?: React.RefObject<HTMLElement | null>
  /** Accessible name when there's no DialogHeader. */
  label?: string
  className?: string
  children: React.ReactNode
}

/**
 * A modal card over a scrim. Scales in from 0.96 and leaves faster than it
 * arrived; closes on Escape (only when it's the top layer) or a press on the
 * scrim; keeps Tab inside; makes the page behind it inert; and returns focus
 * on the way out. Portalled to <body> so transformed ancestors can't trap it.
 */
export function Dialog({ open, onClose, size = 'md', role = 'dialog', placement = 'top', initialFocus, label, className, children }: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [titled, setTitled] = useState(false)
  const [described, setDescribed] = useState(false)
  const { mounted, closing } = usePresence(open, 150)
  useFocusTrap(panelRef, open, initialFocus)
  useDismiss(open, panelRef, onClose, { outside: false })

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div
      data-closing={closing || undefined}
      className={cn(
        'u-overlay fixed inset-0 z-[60] flex justify-center overflow-y-auto overscroll-contain bg-scrim p-4 backdrop-blur-sm',
        placement === 'top' ? 'items-start py-10' : 'items-center',
      )}
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titled ? titleId : undefined}
        aria-label={titled ? undefined : label}
        aria-describedby={described ? descriptionId : undefined}
        tabIndex={-1}
        data-closing={closing || undefined}
        className={cn('u-modal relative w-full border border-line bg-card shadow-modal outline-none', WIDTH[size], className)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DialogContext.Provider value={{ titleId, descriptionId, onClose, setTitled, setDescribed }}>{children}</DialogContext.Provider>
      </div>
    </div>,
    document.body,
  )
}

export interface DialogHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** Actions beside the close button — "Copy link". */
  actions?: React.ReactNode
  /** A hairline under the header, for dialogs whose body is its own section. */
  divided?: boolean
  /** Hide the × (a confirmation, where Cancel is the way out). */
  hideClose?: boolean
  className?: string
}

export function DialogHeader({ title, description, actions, divided = false, hideClose = false, className }: DialogHeaderProps) {
  const ctx = useRegister('setTitled')
  useRegister('setDescribed', Boolean(description))
  return (
    <div className={cn('flex justify-between gap-3', divided ? 'items-center border-b border-line px-6 py-4' : 'items-start px-6 pt-6', className)}>
      <div className="min-w-0">
        <h2 id={ctx?.titleId} className="font-sans text-title font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {description && (
          <p id={ctx?.descriptionId} className="mt-0.5 text-ui text-pretty text-muted">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-none items-center gap-3">
        {actions}
        {!hideClose && ctx && (
          <button
            type="button"
            onClick={ctx.onClose}
            aria-label="Close"
            className="u-circle u-press grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2 [&>svg]:transition-[rotate] [&>svg]:duration-200 [&>svg]:ease-out hover:[&>svg]:rotate-90"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

export function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6', className)}>{children}</div>
}

export interface DialogFooterProps {
  /** Left side — the reason an action is blocked, or a quiet escape hatch. */
  note?: React.ReactNode
  divided?: boolean
  className?: string
  children: React.ReactNode
}

/** Actions across the foot, with any note beside them rather than under them. */
export function DialogFooter({ note, divided = true, className, children }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 pb-6',
        divided ? 'border-t border-line pt-5' : 'pt-0',
        className,
      )}
    >
      <div className="min-w-0 flex-1 text-label text-pretty text-muted">{note}</div>
      <div className="flex flex-none items-center gap-2">{children}</div>
    </div>
  )
}

/* ---------------------------------------------------------- ConfirmDialog */

export interface ConfirmDialogProps {
  open: boolean
  title: React.ReactNode
  body?: React.ReactNode
  /** Verb + object — "Delete page". Repeats the consequence, so the dialog
   *  can be answered without reading the body. */
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * A beat of friction before something that can't be undone. For a destructive
 * action, focus lands on Cancel — a held or repeated Enter never confirms a
 * deletion by accident. Escape cancels.
 */
export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel = 'Cancel', tone = 'danger', onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      size="sm"
      role="alertdialog"
      placement="center"
      initialFocus={tone === 'danger' ? cancelRef : confirmRef}
    >
      <div className="p-5">
        <ConfirmTitle>{title}</ConfirmTitle>
        {body && <ConfirmBody>{body}</ConfirmBody>}
        <div className="mt-5 flex justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant={tone === 'danger' ? 'danger' : 'primary'} size="md" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function ConfirmBody({ children }: { children: React.ReactNode }) {
  const ctx = useRegister('setDescribed')
  return (
    <p id={ctx?.descriptionId} className="mt-1.5 text-ui text-pretty text-muted">
      {children}
    </p>
  )
}

function ConfirmTitle({ children }: { children: React.ReactNode }) {
  const ctx = useRegister('setTitled')
  return (
    <h2 id={ctx?.titleId} className="font-sans text-title font-semibold tracking-tight text-balance">
      {children}
    </h2>
  )
}

/* -------------------------------------------------------------- Lightbox */

interface LightboxBase {
  open: boolean
  onClose: () => void
  caption?: React.ReactNode
}

/** An image (with the alt text it requires), or any children — video, an embed. */
export type LightboxProps = LightboxBase & ({ src: string; alt: string; children?: never } | { src?: undefined; alt?: string; children: React.ReactNode })

/**
 * The same media, given the whole window, with nothing cropped. A heavier scrim
 * than a dialog's — the same in both themes — because this one is about looking
 * at what's on it. Only the scrim closes it; the media keeps its clicks.
 */
export function Lightbox({ open, onClose, caption, src, alt, children }: LightboxProps) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const { mounted, closing } = usePresence(open, 150)
  useFocusTrap(ref, open)
  useDismiss(open, ref, onClose, { outside: false })

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={caption ? titleId : undefined}
      aria-label={caption ? undefined : (alt ?? 'Media viewer')}
      tabIndex={-1}
      data-closing={closing || undefined}
      className="u-overlay fixed inset-0 z-[70] flex flex-col overscroll-contain bg-black/85 outline-none backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div className="flex flex-none items-center justify-between gap-3 px-4 py-3 sm:px-6" onMouseDown={(e) => e.stopPropagation()}>
        <p id={titleId} className="min-w-0 break-words text-ui font-medium text-white/90">
          {caption}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="u-circle u-press grid h-9 w-9 flex-none place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-offset-2 [&>svg]:transition-[rotate] [&>svg]:duration-200 [&>svg]:ease-out hover:[&>svg]:rotate-90"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        data-closing={closing || undefined}
        onMouseDown={(e) => e.stopPropagation()}
        className="u-modal flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-6"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="max-h-full max-w-full rounded-xl object-contain outline outline-1 -outline-offset-1 outline-white/10" />
        ) : (
          children
        )}
      </div>
    </div>,
    document.body,
  )
}
