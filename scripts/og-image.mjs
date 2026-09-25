// Renders the link-preview card (scripts/og-image.html) to playground/public/og.png.
//
//   npm run og
//
// Fonts are inlined as data URLs (Chrome won't load fonts across file:// URLs),
// then headless Chrome captures the page at exactly 1200×630. Set CHROME_PATH
// if Chrome isn't in the default macOS location.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fonts = join(root, 'src/styles/fonts')
const out = join(root, 'playground/public/og.png')
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const dataUrl = (file) => `data:font/woff2;base64,${readFileSync(join(fonts, file)).toString('base64')}`
const html = readFileSync(join(root, 'scripts/og-image.html'), 'utf8')
  .replace('__GEIST__', dataUrl('Geist-Variable.woff2'))
  .replace('__PIXEL__', dataUrl('GeistPixel-Square.woff2'))
  .replace('__MONO__', dataUrl('GeistMono-Variable.woff2'))

const dir = mkdtempSync(join(tmpdir(), 'lui-og-'))
const page = join(dir, 'og.html')
writeFileSync(page, html)

try {
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      // Give the fonts and the canvas a moment before the capture.
      '--virtual-time-budget=3000',
      `--screenshot=${out}`,
      `file://${page}`,
    ],
    { stdio: 'pipe' },
  )
} finally {
  rmSync(dir, { recursive: true, force: true })
}

const kb = Math.round(statSync(out).size / 1024)
console.log(`og.png → ${out.replace(root + '/', '')} (${kb} KB)`)
// WhatsApp skips previews much above ~300 KB.
if (kb > 300) console.warn('Warning: over 300 KB — some apps (WhatsApp) may not show it.')
