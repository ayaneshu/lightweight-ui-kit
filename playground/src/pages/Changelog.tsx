import { Badge, cn, Table, TBody, TD, TH, THead, TR, type BadgeTone } from 'lightweight-ui'
import { ArrowUpRight } from 'lightweight-ui/icons'
import raw from '../../../CHANGELOG.md?raw'
import { CodeBlock, PageHeader, ScrollTable, Section } from '../ui/Demo'
import { REPO } from '../ui/site'

/*
 * The changelog page reads CHANGELOG.md itself, so it can't drift from what's
 * released. Only what the file uses is understood: "## [x.y.z] - date"
 * headings, "### Kind" subheadings, "- " items that may wrap onto indented
 * lines, and inline `code`, **bold** and links.
 */

interface Release {
  version: string
  date?: string
  groups: { kind: string; items: string[] }[]
}

function parse(md: string): Release[] {
  const releases: Release[] = []
  for (const line of md.replace(/\r\n/g, '\n').split('\n')) {
    const head = line.match(/^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?/)
    const release = releases.at(-1)
    if (head) releases.push({ version: head[1], date: head[2], groups: [] })
    else if (!release) continue
    else if (line.startsWith('### ')) release.groups.push({ kind: line.slice(4).trim(), items: [] })
    else if (line.startsWith('- ')) release.groups.at(-1)?.items.push(line.slice(2).trim())
    else if (/^\s+\S/.test(line)) {
      const items = release.groups.at(-1)?.items
      if (items?.length) items[items.length - 1] += ` ${line.trim()}`
    }
  }
  return releases.filter((r) => r.groups.some((g) => g.items.length))
}

const RELEASES = parse(raw)
const VERSIONS = RELEASES.filter((r) => r.version !== 'Unreleased')

/** What kind of release this was, from the step since the one before. */
function bump(i: number): string {
  const prev = VERSIONS[i + 1]
  if (!prev) return 'First release'
  const [a, b] = [prev.version.split('.').map(Number), VERSIONS[i].version.split('.').map(Number)]
  return b[0] > a[0] ? 'Major' : b[1] > a[1] ? 'Minor' : 'Patch'
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const slug = (version: string) => (version === 'Unreleased' ? 'unreleased' : `v${version.replaceAll('.', '-')}`)

/** Inline markdown: `code`, **bold**, [text](url) and bare https links. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https:\/\/[^\s)]+[^\s).,])/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('`') && p.endsWith('`') && p.length > 1)
          return (
            <code key={i} className="rounded-md bg-ink/[0.05] px-1 py-px font-mono text-[0.9em] text-ink">
              {p.slice(1, -1)}
            </code>
          )
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4)
          return (
            <strong key={i} className="font-semibold text-ink">
              {p.slice(2, -2)}
            </strong>
          )
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/) ?? (p.startsWith('https://') ? [p, p.replace(/^https:\/\//, ''), p] : null)
        if (link)
          return (
            <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-line-control/60 underline-offset-2 hover:decoration-ink">
              {link[1]}
            </a>
          )
        return p
      })}
    </>
  )
}

const KINDS = [
  { kind: 'Patch', example: '0.2.0 → 0.2.1', means: 'A fix or a visual refinement. Nothing to change in your code.' },
  { kind: 'Minor', example: '0.2.0 → 0.3.0', means: 'Something new: a component, a prop, a variant or a token. Your code keeps working.' },
  {
    kind: 'Major',
    example: '1.0.0 → 2.0.0',
    means: 'A breaking change. Something was removed or renamed, or behaves differently, so your code may need updating. Until 1.0.0, a breaking change bumps the minor version instead.',
  },
]

/** Each kind of note gets its own tag, so a release reads at a glance. */
const TONE: Record<string, BadgeTone> = {
  Added: 'open',
  Changed: 'neutral',
  Deprecated: 'draft',
  Removed: 'danger',
  Fixed: 'outline',
  Security: 'danger',
}

export default function Changelog() {
  const latest = VERSIONS[0]?.version ?? __LUI_VERSION__
  return (
    <>
      <PageHeader
        eyebrow="Get started"
        title="Changelog"
        description="Every release of the kit, newest first. The version number tells you what kind of change it was, so you know whether updating needs any work."
      >
        <CodeBlock title="Install exactly this version" code={`npm install github:${REPO}#v${latest}`} className="max-w-2xl" />
      </PageHeader>

      <ol aria-label="Releases" className="mb-16">
        {RELEASES.map((r, n) => (
          <Entry key={r.version} release={r} index={VERSIONS.indexOf(r)} first={n === 0} last={n === RELEASES.length - 1} />
        ))}
      </ol>

      <Section id="versions" title="How versions work" description="Each release is a patch, a minor or a major, depending on what changed rather than how much. Pin a version with `#v1.2.3` at the end of the install command.">
        <ScrollTable label="Kinds of release">
          <Table className="min-w-[520px]">
            <THead>
              <TR>
                <TH>Kind</TH>
                <TH>Example</TH>
                <TH>What it means for you</TH>
              </TR>
            </THead>
            <TBody>
              {KINDS.map((k) => (
                <TR key={k.kind}>
                  <TD className="font-medium">{k.kind}</TD>
                  <TD className="whitespace-nowrap font-mono text-[12.5px] text-muted">{k.example}</TD>
                  <TD className="text-label leading-relaxed text-pretty text-muted">{k.means}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ScrollTable>
      </Section>
    </>
  )
}

/**
 * One release on the timeline. Three columns from `md` up — the version, the
 * rail, the notes — and two on a phone, where the version sits above its
 * notes. The rail is drawn a segment per release, so it runs unbroken from the
 * newest node and fades out below the oldest. The version and its node stay in
 * view while you read a long release, so the node travels down the line.
 */
function Entry({ release: r, index, first, last }: { release: Release; index: number; first: boolean; last: boolean }) {
  const released = r.version !== 'Unreleased'
  const newest = released && index === 0
  const title = released ? `v${r.version}` : 'Unreleased'
  return (
    <li
      id={slug(r.version)}
      data-section={title}
      className="grid scroll-mt-20 grid-cols-[20px_minmax(0,1fr)] gap-x-4 md:grid-cols-[176px_20px_minmax(0,1fr)] md:gap-x-8"
    >
      {/* The rail */}
      <div aria-hidden="true" className="relative col-start-1 row-span-2 row-start-1 md:col-start-2 md:row-span-1">
        <span
          className={cn(
            'absolute bottom-0 left-1/2 w-px -translate-x-1/2',
            first ? 'top-4' : 'top-0',
            last ? 'bg-linear-to-b from-line to-transparent' : 'bg-line',
          )}
        />
        <div className="relative h-8 md:sticky md:top-20">
          <span
            className={cn(
              'u-circle absolute left-1/2 top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full',
              newest
                ? 'bg-ink shadow-[0_0_0_4px_var(--color-bg),0_0_0_7px_color-mix(in_oklab,var(--color-ink)_10%,transparent)]'
                : cn('border-[1.5px] border-line-control bg-bg shadow-[0_0_0_4px_var(--color-bg)]', !released && 'border-dashed'),
            )}
          />
        </div>
      </div>

      {/* The version */}
      <div className="col-start-2 row-start-1 pb-4 md:col-start-1 md:pb-16">
        <div className="md:sticky md:top-20">
          <h2 className="font-pixel text-2xl leading-8 font-medium tracking-tight">{title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {newest && (
              <Badge size="sm" tone="ink">
                Latest
              </Badge>
            )}
            <Badge size="sm">{released ? bump(index) : 'Not released yet'}</Badge>
          </div>
          {r.date && (
            <time dateTime={r.date} className="mt-2 block text-label text-muted">
              {DATE.format(new Date(`${r.date}T00:00:00Z`))}
            </time>
          )}
          {released && (
            <a
              href={`https://github.com/${REPO}/releases/tag/v${r.version}`}
              target="_blank"
              rel="noreferrer"
              className="group mt-1 inline-flex items-center gap-1 rounded-md text-label font-medium text-muted hover:text-ink focus-visible:outline-offset-2"
            >
              Release on GitHub
              <ArrowUpRight size={12} weight="bold" aria-hidden="true" className="transition-transform duration-150 ease-out group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
          )}
        </div>
      </div>

      {/* The notes */}
      <div className={cn('col-start-2 row-start-2 max-w-2xl space-y-7 md:col-start-3 md:row-start-1 md:pt-1', last ? 'pb-4' : 'pb-16')}>
        {r.groups
          .filter((g) => g.items.length)
          .map((g) => (
            <div key={g.kind}>
              <h3>
                <Badge size="sm" tone={TONE[g.kind] ?? 'neutral'} dot>
                  {g.kind}
                </Badge>
              </h3>
              <ul className="mt-3 list-disc space-y-2.5 ps-5 text-ui leading-relaxed text-pretty text-muted marker:text-line-control">
                {g.items.map((item) => (
                  <li key={item} className="ps-1">
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </li>
  )
}
