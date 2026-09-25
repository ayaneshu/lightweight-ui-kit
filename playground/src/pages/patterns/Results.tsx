import { useState } from 'react'
import { ArrowUpRight } from 'lightweight-ui/icons'
import {
  Avatar,
  Breadcrumb,
  Button,
  ChartCard,
  DistributionColumns,
  EmptyState,
  Heading,
  HeroFigure,
  LetterBadge,
  NominalBars,
  optionColor,
  personName,
  PillTabs,
  PresenceBar,
  Rating,
  ratingBuckets,
  ShareBar,
  ShareLegend,
  StatTile,
  StatusBadge,
  Table,
  TBody,
  TD,
  Text,
  TH,
  THead,
  Toolbar,
  TR,
  UpvoteChip,
  useToast,
  type Peer,
  type Slice,
} from 'lightweight-ui'
import { Demo, PageHeader, Section } from '../../ui/Demo'

const ME = 'sara.k@example.com'
const OMAR = 'omar.h@example.com'
const LENA = 'lena.m@example.com'
const RAVI = 'ravi.p@example.com'
const MEI = 'mei.l@example.com'

/* ------------------------------------------------------------ Sample data */

const OPTIONS = [
  { id: 'a', letter: 'A', name: 'One-page checkout' },
  { id: 'b', letter: 'B', name: 'Two-step checkout' },
]

const SLICES: Slice[] = [
  { id: 'a', label: 'One-page checkout', value: 27, color: optionColor(0) },
  { id: 'b', label: 'Two-step checkout', value: 15, color: optionColor(1) },
  { id: 'tie', label: 'Both feel equal', value: 6, color: optionColor(2) },
]
const VOTES = SLICES.reduce((s, x) => s + x.value, 0)

const RATINGS: Record<string, number> = { '1': 2, '2': 3, '3': 9, '4': 17, '5': 10 }
const RATED = Object.values(RATINGS).reduce((s, n) => s + n, 0)
const AVERAGE = Object.entries(RATINGS).reduce((s, [k, n]) => s + Number(k) * n, 0) / RATED

const PAYMENT = [
  { label: 'Card', value: 21 },
  { label: 'Apple Pay', value: 12 },
  { label: 'Cash on delivery', value: 8 },
  { label: 'Wallet credit', value: 3 },
]
const PAYMENT_TOTAL = PAYMENT.reduce((s, b) => s + b.value, 0)

const TEXT_ANSWERS = [
  { id: 't1', text: 'The one-page version made me double-check the address twice — a summary right above Pay would help.', upvotes: 7 },
  { id: 't2', text: 'Two-step felt safer for cash on delivery. I always knew where I was.', upvotes: 4 },
  { id: 't3', text: 'Loved seeing the delivery date before the payment step.', upvotes: 3 },
  { id: 't4', text: 'The promo code field is easy to miss on B.', upvotes: 1 },
]

const RESPONDENTS: { email: string | null; session?: string; when: string; choice: string; rating: number }[] = [
  { email: OMAR, when: '2h ago', choice: 'a', rating: 5 },
  { email: LENA, when: '5h ago', choice: 'b', rating: 4 },
  { email: null, session: 'a81f03c2', when: '9h ago', choice: 'a', rating: 4 },
  { email: RAVI, when: '1d ago', choice: 'a', rating: 3 },
  { email: MEI, when: '3d ago', choice: 'tie', rating: 4 },
]

const PEERS: Peer[] = [
  { person: ME, self: true, owner: true },
  { person: OMAR, where: 'on Results' },
  { person: LENA, where: 'on Introduction' },
]

/**
 * TD is align-top. Rather than fight that with a className (cn doesn't merge
 * conflicting utilities), cells beside the two-line voter cell centre their own
 * content in a box of the same height.
 */
const CELL = 'flex min-h-[38px] items-center'

/** The view tabs are routes — here they jump to the matching pattern pages. */
const VIEWS = [
  { value: 'edit', label: 'Editor', href: '#/builder' },
  { value: 'preview', label: 'Preview', href: '#/voting' },
  { value: 'results', label: 'Results', href: '#/results' },
]

/* ------------------------------------------------------------------- Page */

export default function Results() {
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Results report"
        description="A report that leads with one number: how many people responded. That count tells you whether the rest is worth reading, so it gets the large display type. Below it comes one chart per question, then the list of respondents."
      />

      <Section
        id="report"
        title="The report"
        description="Results is a tab of the form, not a separate page off the dashboard. It shares the builder’s toolbar, so the form’s name, its status and the way back to editing stay in the same place."
      >
        <Demo
          stage="none"
          description="The tabs are real links: Editor and Preview open those pattern pages. Select an avatar in the presence bar to follow that person, or upvote an answer."
          code={REPORT_CODE}
        >
          <ResultsScreen />
        </Demo>
        <Notes
          items={[
            'Each comparison gets its own chart. Options from different Get Vote pages are never pooled into one list, because each page asks a separate question.',
            'Each chart suits its data: a ShareBar for parts of a whole, DistributionColumns for ratings, where the shape of the spread matters, and NominalBars for multiple choice with no set order.',
            'Charts sit on flat ChartCards with the count in the corner, so the report reads as one document rather than a set of floating tiles.',
            'Respondents come last, with a note saying who can see them. It’s the detail behind the charts and the only part of the page that names people.',
          ]}
        />
      </Section>

      <Section
        id="empty"
        title="No responses yet"
        description="The response count still leads, because zero is worth knowing. Where the charts will go, an empty state says what will appear there and how to start collecting responses."
      >
        <Demo stage="none" code={EMPTY_CODE}>
          <ResultsScreen empty />
        </Demo>
      </Section>
    </>
  )
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-ui leading-relaxed text-muted marker:text-line-strong">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

/* ----------------------------------------------------------------- Screen */

function ResultsScreen({ empty = false }: { empty?: boolean }) {
  const toast = useToast()
  const [following, setFollowing] = useState<string | null>(null)
  const [answers, setAnswers] = useState(TEXT_ANSWERS)

  return (
    <div className="@container h-[680px] overflow-y-auto bg-bg">
      <Toolbar
        start={
          <>
            <Breadcrumb label={empty ? 'Breadcrumb, empty report' : 'Breadcrumb'} items={[{ label: 'Forms', href: '#/dashboard' }, { label: 'Checkout redesign' }]} />
            <StatusBadge status="open" />
          </>
        }
        center={
          // Wrapped, not className'd: the tabs' own inline-flex would fight a hidden passed in.
          <span className="hidden @3xl:block">
            <PillTabs label="Form views" items={VIEWS} value="results" />
          </span>
        }
        end={
          <>
            <PresenceBar peers={PEERS} following={following} onFollow={setFollowing} onStopFollowing={() => setFollowing(null)} />
            <Button size="md" onClick={() => toast('Voter link copied')}>
              Share
            </Button>
          </>
        }
      />

      <div className="u-view mx-auto w-full max-w-[820px] px-6 py-10">
        <Heading size="display-sm" level={2}>
          Checkout redesign
        </Heading>
        <Text tone="muted" className="mt-1">
          Which checkout gets people to pay faster?
        </Text>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
          <HeroFigure label="Responses" value={empty ? 0 : VOTES} sub={empty ? undefined : 'First 3d ago · latest 2h ago'} />
          <div className="grid flex-1 grid-cols-2 gap-3 @xl:max-w-[400px]">
            <StatTile label="Pod" value="Delivery" />
            <StatTile label="Closes" value="12 Oct" sub="in 17 days" />
          </div>
        </div>

        {empty ? (
          <EmptyState
            compact
            className="mt-8"
            title="No responses yet"
            description="Charts appear here once people respond. Share the voter link to start collecting responses."
            action={
              <Button variant="secondary" size="md" trailingIcon={<ArrowUpRight size={14} aria-hidden="true" />} onClick={() => toast('Opening the voter link in a new tab')}>
                Open voter link
              </Button>
            }
          />
        ) : (
          <div className="mt-8 space-y-8">
            <ChartCard title="Which checkout feels faster?" meta={`${VOTES} votes`}>
              <div className="space-y-3.5">
                <ShareBar slices={SLICES} total={VOTES} />
                <ShareLegend slices={SLICES} total={VOTES} />
              </div>
            </ChartCard>

            <ChartCard title="How would you rate this?" meta={`Average ${AVERAGE.toFixed(1)} · ${RATED} answers`}>
              <DistributionColumns buckets={ratingBuckets(RATINGS)} unit="rating" />
            </ChartCard>

            <ChartCard title="Which payment method do you reach for first?" meta={`${PAYMENT_TOTAL} answers`}>
              <NominalBars buckets={PAYMENT} total={PAYMENT_TOTAL} />
            </ChartCard>

            <ChartCard title="Anything we missed?" meta={`${answers.length} answers`}>
              <ul className="space-y-2">
                {answers.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm leading-relaxed">
                    <span className="min-w-0">{a.text}</span>
                    <UpvoteChip
                      count={a.upvotes}
                      onClick={() => setAnswers((all) => all.map((x) => (x.id === a.id ? { ...x, upvotes: x.upvotes + 1 } : x)))}
                    />
                  </li>
                ))}
              </ul>
            </ChartCard>

            <ChartCard
              title={
                <>
                  Respondents <span className="ml-1 font-normal tabular-nums text-muted">{VOTES}</span>
                </>
              }
              meta="Only form editors can see respondent details."
            >
              <div className="-mx-1 overflow-x-auto px-1">
                <Table className="min-w-[480px]">
                  <THead>
                    <TR>
                      <TH>Voter</TH>
                      <TH>Responded</TH>
                      <TH>Which checkout feels faster?</TH>
                      <TH>Rating</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {RESPONDENTS.map((r, i) => {
                      const option = OPTIONS.find((o) => o.id === r.choice)
                      return (
                        <TR key={i}>
                          <TD>
                            <div className="flex items-center gap-2.5">
                              <Avatar person={r.email ?? 'Anonymous'} tone={r.email ? 'color' : 'neutral'} />
                              <div className="min-w-0">
                                <span className="block text-ui font-medium">{r.email ? personName(r.email) : 'Anonymous'}</span>
                                {r.email ? (
                                  <span className="block text-label text-muted">{r.email}</span>
                                ) : (
                                  <span className="block font-mono text-caption text-muted">{r.session}…</span>
                                )}
                              </div>
                            </div>
                          </TD>
                          <TD>
                            <span className={CELL + ' whitespace-nowrap text-label text-muted'}>{r.when}</span>
                          </TD>
                          <TD>
                            {option ? (
                              <span className={CELL + ' gap-2 whitespace-nowrap'}>
                                <LetterBadge letter={option.letter} />
                                {option.name}
                              </span>
                            ) : (
                              <span className={CELL + ' text-muted'}>Both feel equal</span>
                            )}
                          </TD>
                          <TD>
                            <span className={CELL}>
                              <Rating value={r.rating} readOnly size={14} />
                            </span>
                          </TD>
                        </TR>
                      )
                    })}
                  </TBody>
                </Table>
              </div>
              <Text size="label" tone="muted" className="mt-3">
                Showing the latest 5 of {VOTES}.
              </Text>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Code */

const REPORT_CODE = `<Toolbar
  start={<><Breadcrumb items={[{ label: 'Forms', href: '/creator' }, { label: 'Checkout redesign' }]} /><StatusBadge status="open" /></>}
  center={<PillTabs items={[{ value: 'edit', label: 'Editor', href }, { value: 'preview', label: 'Preview', href }, { value: 'results', label: 'Results', href }]} value="results" />}
  end={<><PresenceBar peers={peers} following={following} onFollow={setFollowing} /><Button size="md">Share</Button></>}
/>

<Heading size="display-sm">Checkout redesign</Heading>
<Text tone="muted">Which checkout gets people to pay faster?</Text>

{/* The one number leads; the rest are its footnotes */}
<div className="flex items-end justify-between border-b border-line pb-6">
  <HeroFigure label="Responses" value={48} sub="First 3d ago · latest 2h ago" />
  <div className="grid grid-cols-2 gap-3">
    <StatTile label="Pod" value="Delivery" />
    <StatTile label="Closes" value="12 Oct" sub="in 17 days" />
  </div>
</div>

<ChartCard title="Which checkout feels faster?" meta="48 votes">
  <ShareBar slices={slices} />
  <ShareLegend slices={slices} />
</ChartCard>
<ChartCard title="How would you rate this?" meta="Average 3.7 · 41 answers">
  <DistributionColumns buckets={ratingBuckets(distribution)} unit="rating" />
</ChartCard>
<ChartCard title="Which payment method do you reach for first?" meta="44 answers">
  <NominalBars buckets={buckets} total={44} />
</ChartCard>
<ChartCard title="Anything we missed?" meta="4 answers">
  {answers.map((a) => <li>{a.text} <UpvoteChip count={a.upvotes} onClick={() => upvote(a.id)} /></li>)}
</ChartCard>
<ChartCard title="Respondents" meta="Only form editors can see respondent details.">
  <Table>
    <THead><TR><TH>Voter</TH><TH>Responded</TH><TH>Choice</TH></TR></THead>
    <TBody>{voters.map((v) => <TR><TD><Avatar person={v.email} /> …</TD>…</TR>)}</TBody>
  </Table>
</ChartCard>`

const EMPTY_CODE = `<HeroFigure label="Responses" value={0} />

<EmptyState
  compact
  title="No responses yet"
  description="Charts appear here once people respond. Share the voter link to start collecting responses."
  action={
    <Button variant="secondary" size="md" trailingIcon={<ArrowUpRight size={14} />}>
      Open voter link
    </Button>
  }
/>`
