// Versions and the changelog.
//
//   npm run release                   cut the next version from the Unreleased notes
//   npm run release -- minor          …or choose the bump: patch, minor, major, or an exact x.y.z
//   node scripts/changelog.mjs notes 0.2.0         print one version's notes (a GitHub release body)
//   node scripts/changelog.mjs check origin/main   the pull-request check
//
// The size of a bump comes from the notes, not from how many files changed:
// Added or Deprecated need a minor, Removed or a note starting with **Breaking**
// need a major, anything else is a patch. Below 1.0.0 a breaking change bumps
// the minor instead, since npm already treats each 0.x minor as breaking.

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHANGELOG = join(root, 'CHANGELOG.md')
const PKG = join(root, 'package.json')
const REPO_URL = 'https://github.com/ayaneshu/lightweight-ui-kit'
/** Files that ship in the package. Changing them needs a new version. */
const KIT = /^(src|bin)\//

const HEADING = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?\s*$/
const LINK = /^\[[^\]]+\]:\s+\S+\s*$/
const RANK = { patch: 1, minor: 2, major: 3 }

/* ----------------------------------------------------------------- parse */

/** The changelog as its intro, its releases (Unreleased first) and nothing else. */
function parse(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n').filter((l) => !LINK.test(l))
  const intro = []
  const releases = []
  for (const line of lines) {
    const m = line.match(HEADING)
    if (m) releases.push({ name: m[1], date: m[2], lines: [] })
    else if (releases.length) releases.at(-1).lines.push(line)
    else intro.push(line)
  }
  for (const r of releases) r.body = r.lines.join('\n').trim()
  if (releases[0]?.name !== 'Unreleased') fail('CHANGELOG.md needs a "## [Unreleased]" section above the first version.')
  return { intro: intro.join('\n').trim(), releases }
}

function render({ intro, releases }) {
  const versions = releases.filter((r) => r.name !== 'Unreleased').map((r) => r.name)
  const blocks = releases.map((r) => {
    const head = r.name === 'Unreleased' ? '## [Unreleased]' : `## [${r.name}] - ${r.date}`
    return r.body ? `${head}\n\n${r.body}` : head
  })
  const links = [
    `[Unreleased]: ${REPO_URL}/compare/v${versions[0]}...HEAD`,
    ...versions.map((v, i) =>
      versions[i + 1] ? `[${v}]: ${REPO_URL}/compare/v${versions[i + 1]}...v${v}` : `[${v}]: ${REPO_URL}/releases/tag/v${v}`,
    ),
  ]
  return `${intro}\n\n${blocks.join('\n\n')}\n\n${links.join('\n')}\n`
}

const hasItems = (body) => /^- /m.test(body ?? '')

/** The smallest bump these notes allow. */
function needed(body) {
  if (/^### Removed/m.test(body) || /^- \*\*Breaking\*\*/im.test(body)) return 'major'
  if (/^### (Added|Deprecated)/m.test(body)) return 'minor'
  return 'patch'
}

/* ---------------------------------------------------------------- semver */

const parts = (v) => {
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!m) fail(`"${v}" isn't a version like 1.2.3.`)
  return m.slice(1).map(Number)
}
const compare = (a, b) => {
  const [x, y] = [parts(a), parts(b)]
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}
/** Below 1.0.0, a major bump lands on the minor. */
const effective = (kind, version) => (kind === 'major' && parts(version)[0] === 0 ? 'minor' : kind)
function inc(version, kind) {
  const [ma, mi, pa] = parts(version)
  const k = effective(kind, version)
  return k === 'major' ? `${ma + 1}.0.0` : k === 'minor' ? `${ma}.${mi + 1}.0` : `${ma}.${mi}.${pa + 1}`
}
/** How big the step from `from` to `to` is. */
function step(from, to) {
  const [a, b] = [parts(from), parts(to)]
  return b[0] > a[0] ? 'major' : b[1] > a[1] ? 'minor' : 'patch'
}

/* -------------------------------------------------------------- commands */

function release(arg) {
  const log = parse(readFileSync(CHANGELOG, 'utf8'))
  const unreleased = log.releases[0]
  if (!hasItems(unreleased.body)) fail('Nothing to release: add notes under "## [Unreleased]" in CHANGELOG.md first.')

  const current = JSON.parse(readFileSync(PKG, 'utf8')).version
  const need = effective(needed(unreleased.body), current)
  let next
  if (!arg) next = inc(current, need)
  else if (arg in RANK) next = inc(current, arg)
  else next = arg
  if (compare(next, current) <= 0) fail(`${next} isn't newer than the current ${current}.`)
  if (RANK[step(current, next)] < RANK[need]) {
    fail(`These notes need at least a ${need} release (${inc(current, need)}), not ${next}. ${WHY[need]}`)
  }

  const date = new Date().toLocaleDateString('en-CA')
  log.releases.splice(1, 0, { name: next, date, body: unreleased.body })
  unreleased.body = ''
  writeFileSync(CHANGELOG, render(log))
  execFileSync('npm', ['version', next, '--no-git-tag-version'], { cwd: root, stdio: 'ignore' })

  // The link-preview card shows major.minor, so redraw it when that changes.
  if (step(current, next) !== 'patch') {
    try {
      execFileSync('node', [join(root, 'scripts/og-image.mjs')], { stdio: 'inherit' })
    } catch {
      console.warn('Couldn’t redraw the link-preview card; run `npm run og` before merging.')
    }
  }

  console.log(`\n${current} → ${next} (${step(current, next)}). ${WHY[step(current, next)]}`)
  console.log('Commit CHANGELOG.md and package.json with the rest of the pull request.')
  console.log(`When it merges into main, GitHub tags v${next} and publishes its release notes.`)
}

const WHY = {
  patch: 'Fixes and refinements only.',
  minor: 'The notes add something new.',
  major: 'The notes include a breaking change.',
}

function notes(version) {
  const { releases } = parse(readFileSync(CHANGELOG, 'utf8'))
  const i = releases.findIndex((r) => r.name === version)
  if (i < 0) fail(`CHANGELOG.md has no "## [${version}]" section.`)
  const prev = releases[i + 1]
  const footer = prev ? `**Full changelog:** ${REPO_URL}/compare/v${prev.name}...v${version}` : ''
  process.stdout.write(`${releases[i].body}\n${footer ? `\n${footer}\n` : ''}`)
}

function check(base) {
  if (!base) fail('Usage: node scripts/changelog.mjs check <base-ref>')
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim()
  const changed = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean)
  const kit = changed.filter((f) => KIT.test(f))
  const was = JSON.parse(git('show', `${base}:package.json`)).version
  const now = JSON.parse(readFileSync(PKG, 'utf8')).version
  const out = []
  const errors = []

  if (now === was) {
    if (kit.length) {
      errors.push(
        `This pull request changes the kit (${kit.slice(0, 3).join(', ')}${kit.length > 3 ? ', …' : ''}) but keeps version ${now}. ` +
          'Add notes under "## [Unreleased]" in CHANGELOG.md, then run `npm run release`.',
      )
    } else out.push(`No kit files changed, so version ${now} stays as it is.`)
  } else {
    if (compare(now, was) <= 0) errors.push(`The version went from ${was} to ${now}; it should only go up.`)
    const { releases } = parse(readFileSync(CHANGELOG, 'utf8'))
    const entry = releases.find((r) => r.name === now)
    if (!hasItems(entry?.body)) errors.push(`CHANGELOG.md needs a "## [${now}]" section with notes.`)
    else {
      const need = effective(needed(entry.body), was)
      const got = step(was, now)
      if (RANK[got] < RANK[need]) errors.push(`${was} → ${now} is a ${got} release, but the notes need a ${need}. ${WHY[need]}`)
      else out.push(`${was} → ${now}: a ${got} release. ${WHY[got]}`)
    }
    const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
    if (lock.version !== now || lock.packages?.['']?.version !== now) errors.push('package-lock.json has a different version; run `npm run release` rather than editing package.json by hand.')
  }

  const summary = [...errors.map((e) => `❌ ${e}`), ...out.map((o) => `✅ ${o}`)].join('\n\n')
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, `### Version\n\n${summary}\n`, { flag: 'a' })
  for (const e of errors) console.log(`::error title=Version::${e}`)
  console.log(summary)
  if (errors.length) process.exit(1)
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

const [command, arg] = process.argv.slice(2)
if (command === 'release') release(arg)
else if (command === 'notes') notes(arg)
else if (command === 'check') check(arg)
else fail('Usage: node scripts/changelog.mjs <release [patch|minor|major|x.y.z] | notes <version> | check <base-ref>>')
