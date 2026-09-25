import { useState } from 'react'
import { ArrowClockwise } from 'lightweight-ui/icons'
import { Button, cn, Menu, MenuItem, SuccessMark, Table, TBody, TD, TH, THead, tokens, Tooltip, TR } from 'lightweight-ui'
import { ArrowClockwise as Redo, CopySimple, PencilSimple, Trash } from 'lightweight-ui/icons'
import { Demo, PageHeader, ScrollTable, Section } from '../../ui/Demo'

const { easings, durations, motionClasses } = tokens

export default function Motion() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Motion"
        description="Motion in the kit is quick and responsive. Custom ease-out curves replace the weaker built-in ones. Everything you can press reacts to a press. Things appear from where they came from, never out of nowhere. Only transform and opacity animate, so motion stays smooth even while the page is busy. When reduced motion is on, fades stay and movement is removed."
      />

      <Section id="rules" title="The rules" description="Every component in the kit follows these. Follow them too when you build your own.">
        <Table>
          <TBody>
          {[
            ['Should it animate?', 'Don\u2019t animate things people see a hundred times a day, like a keyboard shortcut or a list they arrow through. Do animate occasional things, like menus, dialogs and toasts. Rare moments can celebrate.'],
            ['Name the properties', 'Use transition-colors or transition-[translate]. Never use transition: all, which animates anything that happens to change.'],
            ['Only transform and opacity', 'A bar grows by sliding a full-size fill into view, not by animating its width or height. That way the browser never recalculates layout mid-animation.'],
            ['Enter fast, with ease-out', 'Keep interface motion under 300ms. A 150ms menu feels more responsive than a 400ms one with the same curve.'],
            ['Exit faster than you enter', 'Entrances take 150–220ms and exits take 120ms. The element stays mounted until its exit animation has finished.'],
            ['Start from somewhere', 'Scale up from 0.96 while fading in, not from 0. Popovers grow from their trigger, and dialogs from the centre.'],
            ['Warm tooltips', 'The first tooltip opens after a short delay. Once one is open, the next ones open instantly, with no fade.'],
            ['Faster spinners', 'The spinner turns once every 700ms instead of every second. The same wait feels shorter.'],
          ].map(([t, d]) => (
            <TR key={t}>
              <TD className="w-[220px] font-semibold">{t}</TD>
              <TD className="text-label leading-relaxed text-pretty text-muted">{d}</TD>
            </TR>
          ))}
          </TBody>
        </Table>
      </Section>

      <Section id="easing" title="Easing" description="The built-in CSS curves are too gentle to feel quick. These two replace Tailwind’s ease-out and ease-in-out, and become the default for every transition-* utility.">
        <div className="grid gap-4 sm:grid-cols-2">
          <CurveCard name="ease-out" value={easings.out} note="The default for everything: entrances, exits, hovers and state changes." />
          <CurveCard name="ease-in-out" value={easings.inOut} note="For moving something from one resting place to another." />
        </div>
        <EaseRace />
      </Section>

      <Section id="durations" title="Durations" description="Small changes are short. Things that move across the screen take longer. Interface motion stays under 300ms, and only rare moments that explain something go over. Each duration is also a CSS variable, such as var(--lui-duration-popover).">
        <ScrollTable label="Durations">
          <Table className="min-w-[520px]">
            <THead>
              <TR>
                <TH className="w-[130px]">Token</TH>
                <TH>Length</TH>
                <TH className="w-[260px]">Used for</TH>
              </TR>
            </THead>
            <TBody>
              {durations.map((d) => (
                <TR key={d.token}>
                  <TD className="align-middle font-mono text-caption font-medium">
                    {d.ms}ms <span className="text-muted">{d.token}</span>
                  </TD>
                  <TD className="align-middle">
                    <div className="h-2 rounded-full bg-ink/[0.05]">
                      <div className="h-2 rounded-full bg-ink/80" style={{ width: `${(d.ms / 500) * 100}%` }} />
                    </div>
                  </TD>
                  <TD className="text-label text-muted">{d.use}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </ScrollTable>
      </Section>

      <Section id="press" title="Press feedback" description="Every button shrinks to 0.97 while you hold it, so you can tell the press registered. Disabled and aria-disabled controls don’t shrink. A blocked control stays focusable so you can still reach its tooltip, but it shouldn’t look as if the press did something. Full-width controls opt out with data-static, because the same percentage would move their edges too far.">
        <Demo code={`<button className="u-press">…</button>   // or globally, via base.css
<button className="u-press" data-static>…</button>   // wide rows: no scale`}>
          <Button>Press and hold</Button>
          <Button variant="secondary">Press and hold</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </Demo>
      </Section>

      <Section id="exits" title="Exits and tooltips" description="Open and close the menu a few times, then move across the icons. The menu closes faster than it opens. After the first tooltip, the rest appear at once.">
        <Demo className="gap-6" code={`const { mounted, closing } = usePresence(open)   // keeps it mounted for its exit
{mounted && <div className="u-popover" data-closing={closing || undefined}>…</div>}`}>
          <Menu label="Actions" trigger={<Button variant="secondary">Open menu</Button>} align="start">
            <MenuItem icon={<PencilSimple size={15} />}>Rename</MenuItem>
            <MenuItem icon={<CopySimple size={15} />}>Duplicate</MenuItem>
            <MenuItem icon={<Trash size={15} />} tone="danger">
              Delete
            </MenuItem>
          </Menu>
          <div className="flex gap-1">
            {[
              ['Rename', PencilSimple],
              ['Duplicate', CopySimple],
              ['Reset', Redo],
              ['Delete', Trash],
            ].map(([label, Glyph]) => {
              const G = Glyph as typeof Trash
              return (
                <Tooltip key={label as string} label={label as string}>
                  <button
                    type="button"
                    aria-label={label as string}
                    className="u-press grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2"
                  >
                    <G size={17} aria-hidden="true" />
                  </button>
                </Tooltip>
              )
            })}
          </div>
        </Demo>
      </Section>

      <Section id="entrances" title="Entrances" description="Utility classes for things appearing on screen, built on @starting-style or keyframes. Press Replay to see each one again.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Replay name="u-rise" note="For moving between screens. The next screen rises 20px and fades in (360ms).">
            {(k) => (
              <div key={k} className="u-rise w-full rounded-2xl bg-card p-4 shadow-card">
                <p className="text-ui font-semibold">Which checkout reads faster?</p>
                <p className="mt-1 text-label text-muted">Page 1 of 3</p>
              </div>
            )}
          </Replay>
          <Replay name="u-view" note="For switching views within one screen. The new view settles in from 6px (240ms).">
            {(k) => (
              <div key={k} className="u-view w-full rounded-2xl bg-card p-4 shadow-card">
                <p className="text-ui font-semibold">Results</p>
                <p className="mt-1 text-label text-muted">48 responses</p>
              </div>
            )}
          </Replay>
          <Replay name="u-stagger" note="Child elements appear one after another, 45ms apart (300ms each).">
            {(k) => (
              <div key={k} className="u-stagger grid w-full grid-cols-3 gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-card shadow-card" />
                ))}
              </div>
            )}
          </Replay>
          <Replay name="u-pop" note="Grows slightly past full size, then settles. Save it for rare, first-time moments.">
            {(k) => (
              <div key={k} className="grid w-full place-items-center">
                <SuccessMark size={56} />
              </div>
            )}
          </Replay>
          <Replay name="u-flash" note="Two quick pulses that draw attention to something after a related action elsewhere on the page.">
            {(k) => (
              <div key={k} className="u-flash w-full rounded-2xl p-4 bg-ink/[0.03]">
                <p className="text-ui font-semibold">Feedback inputs</p>
                <p className="mt-1 text-label text-muted">Drag one onto the page</p>
              </div>
            )}
          </Replay>
          <Replay name="u-popover · u-modal" note="Popovers grow from the edge nearest their trigger (150ms). Dialogs grow from the centre (220ms). Both start at 0.96, never 0.">
            {(k) => (
              <div key={k} className="u-popover w-full origin-top-left rounded-control bg-card p-1 shadow-menu">
                {['Edit form', 'Rename', 'Delete form'].map((t, i) => (
                  <p key={t} className={cn('rounded-chip px-2.5 py-2 text-label font-medium', i === 2 && 'text-danger')}>
                    {t}
                  </p>
                ))}
              </div>
            )}
          </Replay>
        </div>
      </Section>

      <Section id="classes" title="Class reference">
        <Table>
          <THead>
            <TR>
              <TH className="w-[140px]">Class</TH>
              <TH>What it does</TH>
            </TR>
          </THead>
          <TBody>
            {motionClasses.map((m) => (
              <TR key={m.name}>
                <TD className="font-mono text-caption font-medium">.{m.name}</TD>
                <TD className="text-label text-muted">{m.use}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>
    </>
  )
}

function CurveCard({ name, value, note }: { name: string; value: string; note: string }) {
  const [x1, y1, x2, y2] = value.match(/[\d.]+/g)!.map(Number)
  const S = 120
  const P = (x: number, y: number) => `${8 + x * S},${8 + (1 - y) * S}`
  return (
    <div className="flex gap-5 rounded-panel bg-ink/[0.03] p-5">
      <svg width={S + 16} height={S + 16} className="flex-none" aria-hidden="true">
        <rect x="8" y="8" width={S} height={S} rx="8" fill="var(--color-wash-1)" stroke="var(--color-line)" />
        <line x1={8} y1={8 + S} x2={8 + x1 * S} y2={8 + (1 - y1) * S} stroke="var(--color-line-strong)" />
        <line x1={8 + S} y1={8} x2={8 + x2 * S} y2={8 + (1 - y2) * S} stroke="var(--color-line-strong)" />
        <path d={`M ${P(0, 0)} C ${P(x1, y1)} ${P(x2, y2)} ${P(1, 1)}`} fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="min-w-0">
        <p className="font-mono text-ui font-semibold">--{name}</p>
        <p className="mt-1 break-all font-mono text-caption text-muted">{value}</p>
        <p className="mt-3 text-label leading-relaxed text-muted">{note}</p>
      </div>
    </div>
  )
}

function EaseRace() {
  const [on, setOn] = useState(false)
  const rows = [
    { label: 'ease (CSS default)', curve: 'ease' },
    { label: 'ease-out (CSS)', curve: 'cubic-bezier(0, 0, 0.58, 1)' },
    { label: 'Kit ease-out', curve: easings.out },
  ]
  return (
    <Demo
      title="Side by side"
      description="Three curves over the same 500ms. The kit’s curve covers most of the distance almost at once, which is what makes it feel quick."
      stage="plain"
      className="flex-col items-stretch gap-3"
    >
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-4">
          <p className="w-36 flex-none text-label text-muted">{r.label}</p>
          {/* A size container, so the dot can travel the track's width with a transform. */}
          <div className="relative h-8 flex-1 rounded-full bg-ink/[0.04] [container-type:inline-size]">
            <span
              className="u-circle absolute start-1 top-1 h-6 w-6 rounded-full bg-ink"
              style={{ transform: on ? 'translateX(calc(100cqw - 32px))' : 'translateX(0)', transition: `transform 500ms ${r.curve}` }}
            />
          </div>
        </div>
      ))}
      <div>
        <Button size="sm" variant="secondary" onClick={() => setOn((o) => !o)} leadingIcon={<ArrowClockwise size={14} />}>
          Run
        </Button>
      </div>
    </Demo>
  )
}

function Replay({ name, note, children }: { name: string; note: string; children: (key: number) => React.ReactNode }) {
  const [k, setK] = useState(0)
  return (
    <div className="flex flex-col overflow-hidden rounded-panel bg-ink/[0.03]">
      <div className="pg-stage flex min-h-[150px] flex-1 items-center justify-center p-6">{children(k)}</div>
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-caption font-medium">.{name}</p>
          <p className="mt-0.5 text-caption leading-snug text-muted">{note}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setK((x) => x + 1)} leadingIcon={<ArrowClockwise size={14} />}>
          Replay
        </Button>
      </div>
    </div>
  )
}
