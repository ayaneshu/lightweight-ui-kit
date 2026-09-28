import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const src = (p: string) => fileURLToPath(new URL(`../src/${p}`, import.meta.url))

// The kit's version: shown in the sidebar (__LUI_VERSION__) and used to bust the
// link-preview image's cache in index.html (%LUI_VERSION%).
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }

// The playground imports the kit's *source*, not its build, so editing a
// component in ../src hot-reloads here. Consumers import the built package.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    { name: 'lui-version', transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%LUI_VERSION%', version) } },
  ],
  define: { __LUI_VERSION__: JSON.stringify(version) },
  resolve: {
    alias: [
      { find: /^lightweight-ui\/icons$/, replacement: src('icons.ts') },
      { find: /^lightweight-ui\/tokens$/, replacement: src('tokens/index.ts') },
      { find: /^lightweight-ui$/, replacement: src('index.ts') },
    ],
  },
  server: { port: 5173 },
  // The Iconography page and icon search load every Phosphor glyph — one
  // lazy chunk of ~5 MB (~1 MB gzipped) that no other page waits for.
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 6000 },
})
