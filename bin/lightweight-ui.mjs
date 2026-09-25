#!/usr/bin/env node
// lightweight-ui — copy Lightweight UI components into your own codebase (shadcn-style),
// so you own the source. Local imports are followed, so `add dialog` also
// brings the Button it renders and the helpers both use.
//
//   npx github:ayaneshu/lightweight-ui-kit init              theme + fonts into ./src/components/lightweight-ui/styles
//   npx github:ayaneshu/lightweight-ui-kit add button dialog copy components (+ their dependencies)
//   npx github:ayaneshu/lightweight-ui-kit add --all         everything
//   npx github:ayaneshu/lightweight-ui-kit list              what's available
//
// Options: --dir <path>  target folder (default src/components/lightweight-ui, or components/lightweight-ui)
//          --force       overwrite files that already exist
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(PKG, 'src')
const CWD = process.cwd()

// Colour only on a terminal that shows it.
const tty = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (open, close) => (s) => (tty ? `\x1b[${open}m${s}\x1b[${close}m` : String(s))
const bold = paint(1, 22)
const dim = paint(2, 22)
const green = paint(32, 39)
const yellow = paint(33, 39)

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const option = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const positional = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--dir')
const [command = 'help', ...names] = positional

const dir = resolve(CWD, option('dir') ?? (existsSync(join(CWD, 'src')) ? 'src/components/lightweight-ui' : 'components/lightweight-ui'))
const force = flag('force')

/** Every component file, with the names it exports. */
function catalogue() {
  const files = readdirSync(join(SRC, 'components')).filter((f) => f.endsWith('.tsx'))
  return files.map((file) => {
    const text = readFileSync(join(SRC, 'components', file), 'utf8')
    const exports = new Set()
    for (const m of text.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+([A-Z][\w]*)/g)) exports.add(m[1])
    for (const m of text.matchAll(/export\s*\{([^}]+)\}/g)) {
      for (const part of m[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop()
        if (name && /^[A-Z]/.test(name)) exports.add(name)
      }
    }
    return { file, name: file.replace(/\.tsx$/, ''), exports: [...exports] }
  })
}

/** Match a user's word to a file: by file name, or by any export in it. */
function resolveName(word, cat) {
  const w = word.toLowerCase()
  return (
    cat.find((c) => c.name.toLowerCase() === w) ??
    cat.find((c) => c.exports.some((e) => e.toLowerCase() === w)) ??
    cat.find((c) => c.name.toLowerCase().startsWith(w))
  )
}

/** A source file plus every local file it imports, transitively. */
function withDependencies(entry) {
  const seen = new Set()
  const walk = (abs) => {
    if (seen.has(abs)) return
    seen.add(abs)
    const text = readFileSync(abs, 'utf8')
    for (const m of text.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const base = resolve(dirname(abs), m[1])
      const hit = ['.tsx', '.ts', '/index.ts'].map((ext) => base + ext).find(existsSync)
      if (hit) walk(hit)
    }
  }
  walk(entry)
  return [...seen]
}

function write(fromAbs, toAbs) {
  const rel = relative(CWD, toAbs)
  if (existsSync(toAbs) && !force) {
    console.log(`  ${yellow('skip')}  ${rel} ${dim('(exists — --force to overwrite)')}`)
    return
  }
  mkdirSync(dirname(toAbs), { recursive: true })
  cpSync(fromAbs, toAbs, { recursive: true })
  console.log(`  ${green('add ')}  ${rel}`)
}

function printStyleHelp() {
  const styles = relative(CWD, join(dir, 'styles'))
  console.log(`
${bold('Styles')} — the components are Tailwind v4 classes on the kit's theme:

  ${dim('/* your global CSS */')}
  @import "tailwindcss";
  @import "./${styles}/theme.css";
  @import "./${styles}/base.css";   ${dim('/* optional: page face, heading face, press feedback */')}

${dim('Adjust the paths relative to that CSS file. Runtime dependency:')} npm i @phosphor-icons/react
`)
}

function init() {
  console.log(bold(`\nLightweight UI → ${relative(CWD, dir) || '.'}\n`))
  for (const f of ['theme.css', 'base.css', 'fonts.css']) write(join(SRC, 'styles', f), join(dir, 'styles', f))
  write(join(SRC, 'styles', 'fonts'), join(dir, 'styles', 'fonts'))
  printStyleHelp()
}

function add() {
  const cat = catalogue()
  const picked = flag('all') ? cat : names.map((n) => [n, resolveName(n, cat)])
  if (!flag('all')) {
    const missing = picked.filter(([, c]) => !c).map(([n]) => n)
    if (missing.length) {
      console.error(`Unknown component: ${missing.join(', ')}. Run ${bold('lightweight-ui list')} to see what's available.`)
      process.exit(1)
    }
  }
  const entries = flag('all') ? cat.map((c) => join(SRC, 'components', c.file)) : picked.map(([, c]) => join(SRC, 'components', c.file))
  if (!entries.length) {
    console.error(`Name at least one component, e.g. ${bold('lightweight-ui add button dialog')}, or pass --all.`)
    process.exit(1)
  }
  const files = new Set(entries.flatMap(withDependencies))
  console.log(bold(`\nLightweight UI → ${relative(CWD, dir) || '.'}\n`))
  for (const abs of [...files].sort()) write(abs, join(dir, relative(SRC, abs)))
  if (!existsSync(join(dir, 'styles', 'theme.css'))) {
    console.log(`\n${dim('No theme yet — adding it (run')} lightweight-ui init ${dim('to redo).')}`)
    init()
  } else {
    printStyleHelp()
  }
}

function list() {
  const cat = catalogue()
  console.log(bold('\nLightweight UI components\n'))
  const width = Math.max(...cat.map((c) => c.name.length))
  for (const c of cat) console.log(`  ${c.name.padEnd(width)}  ${dim(c.exports.join(', '))}`)
  console.log(`\n${dim('Add by file or by any export name:')} lightweight-ui add ${cat[0]?.name.toLowerCase()} ConfirmDialog\n`)
}

function help() {
  console.log(`
${bold('lightweight-ui')} — copy Lightweight UI into your codebase

  ${bold('init')}                 add the theme, base styles and fonts
  ${bold('add')} <names…>         add components (by file or export name) and their dependencies
  ${bold('add --all')}            add everything
  ${bold('list')}                 list components and their exports

  --dir <path>   target folder ${dim(`(default: ${relative(CWD, dir)})`)}
  --force        overwrite existing files

Prefer a package? ${bold('npm install github:ayaneshu/lightweight-ui-kit')} and import from 'lightweight-ui'.
`)
}

const commands = { init, add, list, help }
;(commands[command] ?? help)()

// Keep a record of what was installed from where, for upgrades.
if (command === 'add' || command === 'init') {
  const version = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8')).version
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, '.lightweight-ui.json'), JSON.stringify({ version, updated: new Date().toISOString() }, null, 2) + '\n')
}
