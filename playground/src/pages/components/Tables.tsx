import { useState } from 'react'
import {
  Avatar,
  Button,
  Count,
  FilterPills,
  LetterBadge,
  ListHeader,
  ListRow,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  personName,
  type Status,
} from 'lightweight-ui'
import { Demo, KnobSegment, PageHeader, PropsTable, Section } from '../../ui/Demo'

/* ------------------------------------------------------------------ Data */

const RESPONDENTS = [
  { person: 'sara.k@example.com', pick: 'B', option: 'Two steps', rating: 5, seconds: 74, when: '3m ago', order: 1 },
  { person: 'omar.h@example.com', pick: 'A', option: 'One page', rating: 4, seconds: 131, when: '18m ago', order: 2 },
  { person: 'lena.m@example.com', pick: 'B', option: 'Two steps', rating: 4, seconds: 96, when: '1h ago', order: 3 },
  { person: 'ravi.p@example.com', pick: 'C', option: 'Express pay', rating: 2, seconds: 212, when: '2h ago', order: 4 },
  { person: 'mei.l@example.com', pick: 'B', option: 'Two steps', rating: 3, seconds: 58, when: 'Yesterday', order: 5 },
]

type SortKey = 'latest' | 'name' | 'rating' | 'time'

const fmt = (s: number) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`

const FORMS: { id: string; title: string; status: Status; edited: string; responses: number }[] = [
  { id: 'f1', title: 'Checkout flow test', status: 'open', edited: 'Edited 2h ago', responses: 128 },
  { id: 'f2', title: 'Onboarding illustration, round two', status: 'draft', edited: 'Edited yesterday', responses: 0 },
  { id: 'f3', title: 'Pricing page headline', status: 'closed', edited: 'Closed Aug 16', responses: 342 },
  { id: 'f4', title: 'App icon — dark or light?', status: 'open', edited: 'Edited 3d ago', responses: 57 },
  { id: 'f5', title: 'Empty state copy', status: 'draft', edited: 'Edited last week', responses: 0 },
]

/** Cell content at avatar height, so every column shares one baseline row. */
function Cell({ end = false, children }: { end?: boolean; children: React.ReactNode }) {
  return <span className={end ? 'flex min-h-7 items-center justify-end gap-2' : 'flex min-h-7 items-center gap-2'}>{children}</span>
}

/** One template for the header and every row, so the columns line up. */
const GRID = 'grid-cols-[minmax(0,1fr)_auto] @xl:grid-cols-[minmax(0,1fr)_96px_120px_88px]'

export default function Tables() {
  const [sort, setSort] = useState<SortKey>('latest')
  const [filter, setFilter] = useState<'all' | Status>('all')

  const rows = [...RESPONDENTS].sort((a, b) =>
    sort === 'name'
      ? personName(a.person).localeCompare(personName(b.person))
      : sort === 'rating'
        ? b.rating - a.rating
        : sort === 'time'
          ? a.seconds - b.seconds
          : a.order - b.order,
  )
  const forms = FORMS.filter((f) => filter === 'all' || f.status === filter)
  const countOf = (s: Status) => FORMS.filter((f) => f.status === s).length

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Tables & lists"
        description="Two ways to show rows of data. Use a real <table> when people compare values down a column, such as respondents and their answers. Use list rows when each row is an item with its own status and action."
      />

      <Section
        id="table"
        title="Table"
        description="For data people read and compare down a column. Thin lines separate the rows, and headers are muted at 13px. Numbers align right with equal-width digits, so a column of times lines up and is easy to scan."
      >
        <Demo
          stage="none"
          code={`<div className="overflow-x-auto">
  <Table className="min-w-[560px]">
    <THead>
      <TR>
        <TH>Respondent</TH>
        <TH>Picked</TH>
        <TH align="end">Rating</TH>
        <TH align="end">Time</TH>
        <TH align="end">Submitted</TH>
      </TR>
    </THead>
    <TBody>
      {responses.map((r) => (
        <TR key={r.id}>
          <TD>
            <span className="flex items-center gap-2.5">
              <Avatar person={r.email} />
              {personName(r.email)}
            </span>
          </TD>
          <TD>{r.option}</TD>
          <TD align="end">{r.rating}★</TD>
          <TD align="end">{formatDuration(r.seconds)}</TD>
          <TD align="end" className="text-muted">{timeAgo(r.submittedAt)}</TD>
        </TR>
      ))}
    </TBody>
  </Table>
</div>`}
          controls={<KnobSegment label="sort" value={sort} options={['latest', 'name', 'rating', 'time'] as const} onChange={setSort} />}
        >
          <div className="overflow-x-auto p-6" tabIndex={0} role="region" aria-label="Responses table">
            <Table className="min-w-[520px]">
              <THead>
                <TR>
                  <TH>Respondent</TH>
                  <TH>Picked</TH>
                  <TH align="end">Rating</TH>
                  <TH align="end">Time</TH>
                  <TH align="end">Submitted</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((r) => (
                  <TR key={r.person}>
                    <TD>
                      <span className="flex items-center gap-2.5 font-medium">
                        <Avatar person={r.person} />
                        {personName(r.person)}
                      </span>
                    </TD>
                    <TD>
                      <Cell>
                        <LetterBadge letter={r.pick} />
                        {r.option}
                      </Cell>
                    </TD>
                    <TD align="end">
                      <Cell end>{r.rating}★</Cell>
                    </TD>
                    <TD align="end">
                      <Cell end>{fmt(r.seconds)}</Cell>
                    </TD>
                    <TD align="end" className="text-muted">
                      <Cell end>{r.when}</Cell>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Demo>
        <Demo
          title="Compact"
          description="In a narrow card, a two-column table of labels and values is often all a breakdown needs."
          code={`<Table>
  <TBody>
    <TR><TD className="text-muted">Opened</TD><TD align="end">156</TD></TR>
    <TR><TD className="text-muted">Started</TD><TD align="end">141</TD></TR>
    <TR><TD className="text-muted">Submitted</TD><TD align="end">128</TD></TR>
  </TBody>
</Table>`}
        >
          <div className="w-full max-w-[280px] rounded-panel bg-card px-5 py-3 shadow-card">
            <Table>
              <TBody>
                {[
                  ['Opened', 156],
                  ['Started', 141],
                  ['Submitted', 128],
                  ['Completion', '82%'],
                ].map(([label, value]) => (
                  <TR key={label}>
                    <TD className="text-muted">{label}</TD>
                    <TD align="end" className="font-medium">
                      {value}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Demo>
      </Section>

      <Section
        id="list-rows"
        title="List rows"
        description="For a list view on a dashboard, where each row is an item rather than a record. List rows use CSS grid, not a <table>. Give the header and every row the same grid template, and the columns line up. Each row extends 12px past its content on both sides, so the hover background has room without moving the text."
      >
        <Demo
          stage="none"
          code={`const GRID = 'grid-cols-[minmax(0,1fr)_auto] @xl:grid-cols-[minmax(0,1fr)_96px_120px_88px]'

<div className="@container">
  <ListHeader className={GRID}>
    <span>Name</span>
    <span className="hidden @xl:block">Status</span>
    <span className="hidden @xl:block">Responses</span>
    <span />
  </ListHeader>
  {forms.map((form) => (
    <ListRow key={form.id} className={GRID}>
      <div className="min-w-0">
        <p className="truncate text-ui font-medium">{form.title}</p>
        <p className="text-label text-muted">{form.edited}</p>
      </div>
      <span className="hidden @xl:block"><StatusBadge status={form.status} /></span>
      <span className="hidden @xl:block"><Count value={form.responses} unit="responses" /></span>
      <Button variant="soft" size="sm">{form.status === 'draft' ? 'Edit' : 'Results'}</Button>
    </ListRow>
  ))}
</div>`}
        >
          <div className="pg-stage p-6">
            <FilterPills
              label="Status"
              value={filter}
              onChange={setFilter}
              items={[
                { value: 'all', label: 'All', count: FORMS.length },
                { value: 'draft', label: 'Draft', count: countOf('draft') },
                { value: 'open', label: 'Active', count: countOf('open') },
                { value: 'closed', label: 'Closed', count: countOf('closed') },
              ]}
            />
            <div className="mt-5 rounded-panel bg-card px-3 pb-2 pt-4 @container shadow-card">
              <ListHeader className={GRID}>
                <span>Name</span>
                <span className="hidden @xl:block">Status</span>
                <span className="hidden @xl:block">Responses</span>
                <span />
              </ListHeader>
              {forms.map((f) => (
                <ListRow key={f.id} className={GRID}>
                  <div className="min-w-0">
                    <p className="truncate text-ui font-medium">{f.title}</p>
                    <p className="text-label text-muted">{f.edited}</p>
                  </div>
                  <span className="hidden @xl:block">
                    <StatusBadge status={f.status} />
                  </span>
                  <span className="hidden @xl:block">
                    <Count value={f.responses} unit={f.responses === 1 ? 'response' : 'responses'} />
                  </span>
                  <Button variant="soft" size="sm" className="justify-self-end">
                    {f.status === 'draft' ? 'Edit' : 'Results'}
                  </Button>
                </ListRow>
              ))}
              {forms.length === 0 && <p className="px-3 py-6 text-center text-ui text-muted">No forms with this status.</p>}
            </div>
          </div>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Table · THead · TBody · TR"
          rows={[
            { name: 'Table', type: 'TableHTMLAttributes', description: 'Full width, with collapsed borders and left-aligned text. If the columns might be wider than a phone screen, wrap it in overflow-x-auto.' },
            { name: 'THead / TBody', type: 'HTMLAttributes', description: 'A plain <thead> or <tbody>.' },
            { name: 'TR', type: 'HTMLAttributes', description: 'Adds a thin line under every row except the last.' },
          ]}
        />
        <PropsTable
          title="TH · TD"
          rows={[
            { name: 'align', type: "'start' | 'end'", default: "'start'", description: 'end aligns a column to the trailing edge (right, or left in right-to-left). End-aligned TD cells also get equal-width digits.' },
            { name: '…rest', type: 'Th/TdHTMLAttributes', description: 'Passed through, such as colSpan, scope or className.' },
          ]}
        />
        <PropsTable
          title="ListHeader · ListRow"
          rows={[
            { name: 'className', type: 'string', description: 'Give the header and every row the same grid-cols-[…] template.' },
            { name: 'children', type: 'ReactNode', description: 'One child per column.' },
            { name: '…rest', type: 'HTMLAttributes<HTMLDivElement>', description: 'ListRow only. Use it for onClick, role or data-* attributes.' },
          ]}
        />
      </Section>
    </>
  )
}
