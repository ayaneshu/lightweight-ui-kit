import { useState } from 'react'
import { Callout, SegmentedControl } from 'lightweight-ui'
import { CodeBlock, PageHeader, Section } from '../ui/Demo'
import { REPO } from '../ui/site'

type Setup = 'plain' | 'tailwind'

export default function Install() {
  const [setup, setSetup] = useState<Setup>('plain')

  return (
    <>
      <PageHeader
        eyebrow="Get started"
        title="Installation"
        description="There are three ways to start. Install the package with one command, copy the components into your own repo so you can change them, or clone the repo and run this playground."
      />

      <Section id="package" title="1 · Install the package" description="Add the whole kit as a dependency. npm installs it straight from GitHub and builds it during install, so nothing needs publishing first.">
        <CodeBlock title="terminal" code={`npm install github:${REPO}`} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-ui font-medium">Then load the styles for your setup:</p>
          <SegmentedControl
            label="Setup"
            value={setup}
            onChange={setSetup}
            items={[
              { value: 'plain', label: 'No Tailwind' },
              { value: 'tailwind', label: 'Tailwind v4' },
            ]}
          />
        </div>
        {setup === 'plain' ? (
          <CodeBlock
            title="main.tsx"
            code={`// Precompiled: reset, tokens, fonts and every class the components use.
import 'lightweight-ui/styles.css'`}
          />
        ) : (
          <CodeBlock
            title="globals.css"
            code={`@import "tailwindcss";
@import "lightweight-ui/theme.css";   /* tokens → bg-ink, text-label, rounded-sheet, shadow-card… */
@import "lightweight-ui/base.css";    /* optional: page face, pixel headings, press feedback */

/* Let Tailwind see the classes inside the kit */
@source "../node_modules/lightweight-ui/dist";`}
          />
        )}
        <CodeBlock
          title="App.tsx"
          code={`import { Button, StatusBadge, ToastProvider, useToast } from 'lightweight-ui'

export default function App() {
  return (
    <ToastProvider>
      <StatusBadge status="open" />
      <Button onClick={() => {}}>Publish form</Button>
    </ToastProvider>
  )
}`}
        />
      </Section>

      <Section id="copy" title="2 · Copy the components" description="Like shadcn/ui, this copies the source into your repo so you can change anything. Anything a component imports comes too: adding Dialog also adds the Button it uses and the helpers they share. Your project needs Tailwind v4.">
        <CodeBlock
          title="terminal"
          code={`npx github:${REPO} add button dialog      # by file or by export name (ConfirmDialog works too)
npx github:${REPO} add --all              # everything
npx github:${REPO} list                   # what's available
npx github:${REPO} init                   # just the theme + fonts

# options: --dir src/ui/lightweight   --force`}
        />
        <CodeBlock
          title="globals.css"
          code={`@import "tailwindcss";
@import "./components/lightweight-ui/styles/theme.css";
@import "./components/lightweight-ui/styles/base.css";`}
        />
        <p className="text-label text-muted">
          Then run <code className="font-mono">npm i @phosphor-icons/react</code> and import components from your own folder:{' '}
          <code className="font-mono">{`import { Button } from '@/components/lightweight-ui/components/Button'`}</code>
        </p>
      </Section>

      <Section id="clone" title="3 · Clone and explore" description="The repo holds both the package and this playground. The playground imports the kit’s source directly, so when you edit a component, the change shows up here straight away.">
        <CodeBlock
          title="terminal"
          code={`git clone https://github.com/${REPO}.git
cd ${REPO.split('/')[1]}
npm install
npm run dev              # playground → http://localhost:5173
npm run build            # the package → dist/
npm run build:playground # a static playground → playground/dist/`}
        />
      </Section>

      <Section id="nextjs" title="Next.js" description="The main bundle starts with 'use client', so you can import it from server components with no extra setup. The tokens entry has no 'use client', so you can still use tokens in server code.">
        <CodeBlock
          title="app/layout.tsx (optional: load the fonts with next/font instead of the bundled files)"
          code={`import { GeistSans } from 'geist/font/sans'
import { GeistPixelSquare } from 'geist/font/pixel'
import 'lightweight-ui/styles.css'

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={\`\${GeistSans.variable} \${GeistPixelSquare.variable}\`}
      style={{ '--lui-font-sans': 'var(--font-geist-sans)', '--lui-font-pixel': 'var(--font-geist-pixel-square)' }}
    >
      <body>{children}</body>
    </html>
  )
}`}
        />
      </Section>

      <Section
        id="dark-mode"
        title="Dark mode"
        description="Every token has a light and a dark value, so you don’t need to write dark: variants. Set a theme and the whole kit follows it. Without a data-theme attribute, it follows the operating system setting."
      >
        <CodeBlock
          title="app/layout.tsx"
          code={`import { ThemeSwitch, themeScript } from 'lightweight-ui'

<html lang="en" data-theme="system" suppressHydrationWarning>
  <head>
    {/* applies the saved choice before first paint — no flash of light */}
    <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
  </head>
  <body>
    <ThemeSwitch />   {/* Light · Dark · System, remembered in localStorage */}
  </body>
</html>`}
        />
        <p className="text-label text-pretty text-muted">
          To build your own theme control, use <code className="font-mono">const [theme, setTheme, resolved] = useTheme()</code>. To keep one region dark, add{' '}
          <code className="font-mono">data-theme="dark"</code> to any element. Tailwind’s <code className="font-mono">dark:</code> variant also works. It matches{' '}
          <code className="font-mono">.dark</code> and <code className="font-mono">[data-theme=dark]</code>.
        </p>
      </Section>

      <Section
        id="icons"
        title="Icons"
        description="The kit uses Phosphor Icons and re-exports the full set, so your app’s icons match the components without adding another dependency."
      >
        <CodeBlock
          code={`import { Trash, Plus } from 'lightweight-ui/icons'       // client components
import { Trash } from 'lightweight-ui/icons/ssr'            // React Server Components`}
        />
      </Section>

      <Section id="tokens" title="Tokens" description="The same values in three forms: CSS variables for stylesheets, a typed object for code, and JSON for everything else, such as a Figma sync or a native app.">
        <CodeBlock
          code={`.custom { color: var(--color-ink); border-radius: var(--radius-sheet); box-shadow: var(--shadow-card); }

import { tokens } from 'lightweight-ui'          // or 'lightweight-ui/tokens' — server-safe, no React
tokens.chartColors  // ['#277fff', '#1baf7a', '#eda100', '#008300']
tokens.themes.dark.ink  // '#ececee'

import json from 'lightweight-ui/tokens.json'`}
        />
      </Section>

      <Section id="requirements" title="Requirements">
        <Callout icon={false}>
          <ul className="list-disc space-y-1 ps-4">
            <li>React 18 or 19.</li>
            <li>Tailwind CSS v4, but only if you use the theme or copy the components. The precompiled stylesheet doesn’t need it.</li>
            <li>
              A current, auto-updating browser. Entrance animations use <code className="font-mono">@starting-style</code> and tints use <code className="font-mono">color-mix()</code>. Corner smoothing (<code className="font-mono">corner-shape</code>) is optional: browsers without it show ordinary rounded corners.
            </li>
            <li>
              Theming also needs a current browser, because colours use <code className="font-mono">light-dark()</code>.
            </li>
            <li>Fonts: Geist, Geist Pixel Square and Geist Mono are bundled under the SIL Open Font License.</li>
            <li>
              Icons:{' '}
              <a href="https://phosphoricons.com" target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-line-control/60 underline-offset-2 hover:decoration-ink">
                Phosphor Icons
              </a>{' '}
              (MIT), installed with the kit.
            </li>
          </ul>
        </Callout>
      </Section>
    </>
  )
}
