import * as Kit from 'lightweight-ui'
import { tokens } from 'lightweight-ui'
import { PAGES, type PageDef } from './pages'

/**
 * The ⌘K index. Pages are known up front; everything else — the sections of
 * every page, where each export is documented, the tokens and every Phosphor
 * icon — is gathered the first time the palette opens, from the page sources
 * themselves, so the index can't drift from the docs.
 */

export type EntryKind = 'page' | 'section' | 'component' | 'api' | 'token' | 'icon'

export interface Entry {
  id: string
  kind: EntryKind
  label: string
  group: string
  hint?: string
  keywords?: string[]
  /** A hash route: '#/slug', '#/slug#section', '#/icons?icon=Name'. */
  href: string
  /** Page glyph, or the icon's own Phosphor name. */
  page?: PageDef
  iconName?: string
}

export function pageEntries(): Entry[] {
  return PAGES.map((p) => ({
    id: `page:${p.slug}`,
    kind: 'page',
    label: p.title,
    group: p.group === 'Get started' ? 'Pages' : p.group,
    hint: p.section ?? (p.group === 'Get started' ? undefined : p.group),
    keywords: [...p.keywords, p.blurb, p.section ?? ''],
    href: `#/${p.slug}`,
    page: p,
  }))
}

const sources = import.meta.glob<string>('./pages/**/*.tsx', { query: '?raw', import: 'default' })

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

interface Parsed {
  page: PageDef
  src: string
  sections: { id: string; title: string; at: number }[]
  imports: Set<string>
}

function parse(page: PageDef, src: string): Parsed {
  const sections: Parsed['sections'] = []
  const re = /<Section\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    // Attributes come first in every <Section>; a description can hold a '>'.
    const head = src.slice(m.index, m.index + 700)
    const id = /\bid="([^"]+)"/.exec(head)?.[1]
    const title = /\btitle="([^"]+)"/.exec(head)?.[1]
    if (id && title) sections.push({ id, title, at: m.index })
  }
  const imports = new Set<string>()
  for (const block of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*'lightweight-ui'/g)) {
    block[1]
      .split(',')
      .map((n) => n.trim().replace(/^type\s+/, ''))
      .filter(Boolean)
      .forEach((n) => imports.add(n))
  }
  return { page, src, sections, imports }
}

/** The section a name is first used in, on a page. */
function sectionFor(p: Parsed, name: string): string | undefined {
  const at = p.src.search(new RegExp(`<${name}[\\s/>]`))
  if (at < 0) return undefined
  let found: string | undefined
  for (const s of p.sections) if (s.at < at) found = s.id
  return found
}

let cache: Promise<Entry[]> | null = null

/** Sections, exports and tokens — loaded once, on the first ⌘K. */
export function loadDocEntries(): Promise<Entry[]> {
  cache ??= (async () => {
    const parsed = await Promise.all(PAGES.map(async (p) => parse(p, await sources[p.file]())))
    const out: Entry[] = []

    // Sections
    for (const p of parsed) {
      for (const s of p.sections) {
        out.push({
          id: `section:${p.page.slug}:${s.id}`,
          kind: 'section',
          label: s.title,
          group: 'Sections',
          hint: p.page.title,
          keywords: [p.page.title],
          href: `#/${p.page.slug}#${s.id}`,
          page: p.page,
        })
      }
    }

    // Exports — documented where the registry lists them, else on the first
    // component page that imports them.
    const order = [...parsed].sort((a, b) => rank(a.page) - rank(b.page))
    for (const [name, value] of Object.entries(Kit)) {
      if (name === 'tokens' || name === 'default') continue
      const home = order.find((p) => p.page.keywords.includes(name)) ?? order.find((p) => p.imports.has(name))
      if (!home) continue
      const component = /^[A-Z][a-z]/.test(name) && (typeof value === 'function' || typeof value === 'object')
      const section = sectionFor(home, name)
      out.push({
        id: `export:${name}`,
        kind: component ? 'component' : 'api',
        label: name,
        group: component ? 'Components' : 'Hooks & utilities',
        hint: home.page.title,
        keywords: [home.page.title, kebab(name).replace(/^-/, '')],
        href: `#/${home.page.slug}${section ? `#${section}` : ''}`,
        page: home.page,
      })
    }

    // Tokens
    const pageOf = (slug: string) => PAGES.find((p) => p.slug === slug)
    const token = (label: string, hint: string, slug: string, section: string, keywords: string[] = []) =>
      out.push({ id: `token:${label}`, kind: 'token', label, group: 'Tokens', hint, keywords, href: `#/${slug}#${section}`, page: pageOf(slug) })
    for (const [k, v] of Object.entries(tokens.themes.light)) {
      token(`--color-${kebab(k)}`, `${v} · ${tokens.themes.dark[k as keyof typeof tokens.themes.dark]}`, 'colour', 'core', ['colour', 'color', k])
    }
    tokens.washes.forEach((w) => token(`--color-${w.token}`, `ink / ${w.alpha}`, 'colour', 'washes', ['wash', 'hover', w.use]))
    tokens.typeScale.forEach((t) => token(`text-${t.token}`, `${t.size}px · ${t.use}`, 'typography', 'scale', ['font size', 'type']))
    tokens.radii.forEach((r) => token(`rounded-${r.token}`, `${r.px === 9999 ? 'full' : `${r.px}px`} · ${r.use}`, 'shape', 'radius', ['radius', 'corner']))
    tokens.shadows.forEach((s) => token(`shadow-${s.token}`, s.use, 'shape', 'elevation', ['shadow', 'elevation']))
    tokens.durations.forEach((d) => token(`--lui-duration-${d.token}`, `${d.ms}ms · ${d.use}`, 'motion', 'durations', ['duration', 'motion', 'timing']))
    tokens.motionClasses.forEach((m) => token(`.${m.name}`, m.use, 'motion', 'classes', ['animation', 'motion', 'class']))
    return out
  })()
  return cache
}

/** Get started, then Foundations, Components, Patterns. */
function rank(p: PageDef) {
  return ['Components', 'Foundations', 'Get started', 'Patterns'].indexOf(p.group)
}

/** Every Phosphor icon, with Phosphor's own tags — loaded on the first query. */
let icons: Promise<Entry[]> | null = null
export function loadIconEntries(): Promise<Entry[]> {
  icons ??= import('@phosphor-icons/core').then((mod) =>
    (mod.icons as unknown as { name: string; pascal_name: string; categories: string[]; tags: string[] }[]).map((i) => ({
      id: `icon:${i.pascal_name}`,
      kind: 'icon' as const,
      label: i.pascal_name,
      group: 'Icons',
      hint: i.categories[0],
      keywords: [...i.tags.filter((t) => !t.startsWith('*')), ...i.categories, i.name],
      href: `#/icons?icon=${i.pascal_name}`,
      iconName: i.pascal_name,
    })),
  )
  return icons
}
