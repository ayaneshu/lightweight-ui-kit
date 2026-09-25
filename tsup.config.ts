import { defineConfig, type Options } from 'tsup'

const shared: Options = {
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime', /^@phosphor-icons\/react/],
}

// Every interactive component uses state or effects, so these bundles are
// client modules. Without the directive, importing the kit from a Next.js
// server component fails at build time.
const client = { js: '"use client";' }

export default defineConfig([
  { ...shared, entry: { index: 'src/index.ts' }, clean: true, banner: client },
  // Phosphor's default entry reads a React context, so it's a client module too.
  { ...shared, entry: { icons: 'src/icons.ts' }, banner: client },
  // Server-safe entries — plain data and context-free icons, no directive.
  { ...shared, entry: { tokens: 'src/tokens/index.ts', 'icons-ssr': 'src/icons-ssr.ts' } },
])
