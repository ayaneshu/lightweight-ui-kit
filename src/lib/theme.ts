import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const KEY = 'lui-theme'

/** Which theme is actually showing — 'system' resolved against the OS. */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Switch theme without the switch smearing. A theme flip changes colour,
 * background, border and shadow on nearly every element at once, and every
 * transition on those fires together — so transitions are suppressed for the
 * one frame the swap happens in.
 *
 * Sets `data-theme` (what the kit reads) and toggles a `dark` class for
 * Tailwind-convention code, on <html> by default. An element marked
 * `data-lui-motion` keeps its transition — the thumb of the switch that was
 * just pressed still slides, since it only animates position.
 */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  const freeze = document.createElement('style')
  freeze.textContent = '*:not([data-lui-motion]),*::before,*::after{transition:none!important}'
  document.head.appendChild(freeze)

  root.dataset.theme = theme
  root.classList.toggle('dark', resolveTheme(theme) === 'dark')

  // Force a style recalc so the new colours land with transitions off…
  void window.getComputedStyle(root).opacity
  // …then give transitions back on the next frame.
  requestAnimationFrame(() => requestAnimationFrame(() => freeze.remove()))
}

/**
 * The current theme preference, persisted, with 'system' kept live as the OS
 * setting changes. Returns [preference, set, resolved].
 */
export function useTheme(storageKey = KEY): [Theme, (t: Theme) => void, 'light' | 'dark'] {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    let saved: Theme = 'system'
    try {
      const v = localStorage.getItem(storageKey)
      if (v === 'light' || v === 'dark' || v === 'system') saved = v
    } catch {
      /* storage blocked — fall back to system */
    }
    setThemeState(saved)
    setResolved(resolveTheme(saved))
    // Without the inline script the page painted with no preference; apply it now.
    if (document.documentElement.dataset.theme !== saved) applyTheme(saved)
  }, [storageKey])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => {
      document.documentElement.classList.toggle('dark', mq.matches)
      setResolved(mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [theme])

  const set = useCallback(
    (next: Theme) => {
      setThemeState(next)
      setResolved(resolveTheme(next))
      applyTheme(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        /* storage blocked — the choice lasts this visit */
      }
    },
    [storageKey],
  )

  return [theme, set, resolved]
}

/**
 * Inline this in <head>, before any CSS paints, so a returning dark-mode user
 * never sees a flash of the light theme:
 *
 *   <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
 */
export function themeScript(storageKey = KEY): string {
  return `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)})||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=t;r.classList.toggle('dark',d)}catch(e){}})()`
}
