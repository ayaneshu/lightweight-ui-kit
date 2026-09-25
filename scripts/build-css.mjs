// Builds the CSS half of the package, after tsup has written the JS:
//   dist/styles.css   precompiled — reset, theme, base and every utility the
//                     components use, for projects that don't run Tailwind
//   dist/theme.css    the Tailwind v4 theme, for projects that do
//   dist/base.css     the global opinions (optional)
//   dist/fonts.css    @font-face rules + dist/fonts/*.woff2
//   dist/tokens.json  the tokens as data
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
mkdirSync(dist, { recursive: true })

const cli = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tailwindcss.cmd' : 'tailwindcss')
const run = spawnSync(cli, ['-i', 'src/styles/index.css', '-o', 'dist/styles.css', '--minify'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
if (run.status !== 0) process.exit(run.status ?? 1)

for (const file of ['theme.css', 'base.css', 'fonts.css']) {
  cpSync(join(root, 'src/styles', file), join(dist, file))
}
cpSync(join(root, 'src/styles/fonts'), join(dist, 'fonts'), { recursive: true })

const { tokens } = await import(pathToFileURL(join(dist, 'tokens.js')).href)
writeFileSync(join(dist, 'tokens.json'), JSON.stringify(tokens, null, 2) + '\n')

console.log('CSS  dist/styles.css, theme.css, base.css, fonts.css, fonts/, tokens.json')
