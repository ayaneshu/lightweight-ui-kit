import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const src = (p: string) => fileURLToPath(new URL(`../src/${p}`, import.meta.url))

// The playground imports the kit's *source*, not its build, so editing a
// component in ../src hot-reloads here. Consumers import the built package.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react(), tailwindcss()],
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
