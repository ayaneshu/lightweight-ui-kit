import { useState } from 'react'
import { ArrowRight, Sparkle, UsersThree } from 'lightweight-ui/icons'
import { Button, Callout, EmptyState, Nudge, Placeholder, Skeleton, Spinner, SuccessMark, Toast, useToast, type CalloutTone, type ToastTone } from 'lightweight-ui'
import { Demo, KnobSegment, KnobToggle, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function FeedbackPage() {
  const toast = useToast()
  const [tone, setTone] = useState<ToastTone>('ink')
  const [cTone, setCTone] = useState<CalloutTone>('neutral')
  const [banner, setBanner] = useState(false)
  const [compact, setCompact] = useState(false)
  const [nudge, setNudge] = useState(true)
  const [pop, setPop] = useState(0)

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Feedback"
        description="Components that tell people what happened and what to do next. A toast confirms an action. A callout adds a note to the page. An empty state marks where content will go. A success mark celebrates a finished task."
      />

      <Section id="toast" title="Toast" description="A one-line message at the bottom centre of the screen that disappears after five seconds. Use `ink` to confirm an action and `card` for a neutral note. Wrap your app in ToastProvider once, then call useToast() from any component.">
        <Demo
          code={`// once, at the root
<ToastProvider><App /></ToastProvider>

// anywhere
const toast = useToast()
toast('The form is up to date.'${tone === 'card' ? ", { tone: 'card' }" : ''})`}
          controls={<KnobSegment label="tone" value={tone} options={['ink', 'card'] as const} onChange={setTone} />}
          className="flex-col gap-6"
        >
          <Toast tone={tone} position="static">
            {tone === 'ink' ? 'The form is up to date.' : 'You have view-only access.'}
          </Toast>
          <Button variant="secondary" size="md" onClick={() => toast(tone === 'ink' ? 'The form is up to date.' : 'You have view-only access. Only editors can make changes.', { tone })}>
            Show a toast
          </Button>
        </Demo>
      </Section>

      <Section id="callout" title="Callout" description="A note that sits in the page, next to the content it's about. Use `card` among other content. Use `banner` for a full-width strip under a header.">
        <Demo
          stage="wash"
          code={`<Callout tone="${cTone}"${banner ? ' variant="banner"' : ''}${!banner ? ' actions={<Button size="md" variant="secondary">Review form</Button>}' : ''}>
  You’ve already voted. Your response is locked, but you can still review every page.
</Callout>`}
          controls={
            <>
              <KnobSegment label="tone" value={cTone} options={['neutral', 'danger', 'success'] as const} onChange={setCTone} />
              <KnobToggle label="banner" checked={banner} onChange={setBanner} />
            </>
          }
        >
          <div className="w-full max-w-lg overflow-hidden">
            {banner ? (
              <div className="overflow-hidden rounded-2xl bg-card shadow-card">
                <div className="flex h-12 items-center border-b border-line px-4 text-ui font-medium">Checkout redesign</div>
                <Callout tone={cTone} variant="banner" className="border-b-0">
                  {cTone === 'danger' ? 'Unable to save changes. Check your connection and try again.' : 'The builder needs a larger screen. You can preview the form here.'}
                </Callout>
              </div>
            ) : (
              <Callout
                tone={cTone}
                title={cTone === 'danger' ? 'This form needs at least one Get Vote page' : undefined}
                actions={
                  cTone === 'neutral' ? (
                    <>
                      <Button size="md" variant="secondary">
                        Review form
                      </Button>
                      <Button size="md">Show results</Button>
                    </>
                  ) : undefined
                }
              >
                {cTone === 'danger'
                  ? 'Change this page to Get Vote in Properties, or add one.'
                  : cTone === 'success'
                    ? 'Published. Voters can use the link now.'
                    : 'You’ve already voted. Your response is locked, but you can still review every page and interact with its media.'}
              </Callout>
            )}
          </div>
        </Demo>
      </Section>

      <Section id="empty" title="Empty state" description="A dashed box that marks where content will go. Say what belongs here and how to add it. If people can't add it from here, explain why, so they don't hit a dead end.">
        <Demo
          stage="plain"
          className="block"
          code={`<EmptyState
  icon={<Sparkle size={22} />}
  title="No forms yet"
  description="Build your first feedback form — a welcome screen, options to compare, and the questions you want answered."
  action={<Button>+ Create a form</Button>}
/>`}
          controls={<KnobToggle label="compact" checked={compact} onChange={setCompact} />}
        >
          {compact ? (
            <EmptyState compact title="No forms match “checkout”." description="Try a different search, or clear the filters." />
          ) : (
            <EmptyState
              icon={<Sparkle size={22} />}
              title="No forms yet"
              description="Start with a welcome screen, add options for voters to compare, then ask the questions you want answered."
              action={<Button>+ Create a form</Button>}
            />
          )}
        </Demo>
        <Demo stage="plain" className="block" code={`<EmptyState icon={<UsersThree size={22} />} title="Team workspace unavailable" description={message} action={<Button onClick={retry}>Try again</Button>} />`}>
          <EmptyState icon={<UsersThree size={22} />} title="Team workspace unavailable" description="Unable to load the shared workspace. Check your connection and try again." action={<Button>Try again</Button>} />
        </Demo>
      </Section>

      <Section id="loading" title="Loading" description="Show skeletons shaped like the content that's loading, so the page doesn't jump when it arrives. Use a spinner only when there's no layout to preview.">
        <Demo code={`<Skeleton className="h-52" />\n<Spinner />`} className="gap-6">
          <div className="grid w-full max-w-lg grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
          <Spinner />
        </Demo>
        <Demo title="Placeholder" description="A dashed frame that stands in for missing media and says why it's missing." code={`<Placeholder label="Blocked embed · example.com" detail="This domain isn't on the allowlist." />`}>
          <Placeholder label="No media yet" className="h-[220px] w-[180px]" />
          <Placeholder label="Blocked embed · example.com" detail="This domain isn't on the allowlist." className="h-[220px] w-[240px]" />
        </Demo>
      </Section>

      <Section id="success" title="Success mark" description="Marks the end of a task, such as sending a form. Centre it and give it room. It pops in once with a small overshoot, so save it for moments that matter.">
        <Demo code={`<SuccessMark />\n<h1>Thanks — your feedback's in.</h1>`} className="flex-col gap-0">
          <SuccessMark key={pop} />
          <p className="mt-6 font-pixel text-[26px] font-medium tracking-tight">Thanks — your feedback’s in.</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setPop((p) => p + 1)}>
            Replay animation
          </Button>
        </Demo>
      </Section>

      <Section id="nudge" title="Nudge" description="A prompt that slides up from the bottom when a task is done and suggests the next step. With `sticky`, it stays pinned to the bottom of its own scrolling column, not the whole window.">
        <Demo
          code={`<Nudge
  sticky
  title="Page ready"
  body="Two options and a question — this comparison can go live."
  cta="Add another page"
  onAct={addPage}
  onDismiss={dismiss}
/>`}
          className="min-h-[200px]"
        >
          {nudge ? (
            <Nudge
              title="Page ready"
              body="Two options and a question — this comparison can go live."
              cta="Add another page"
              onAct={() => toast('Page added')}
              onDismiss={() => setNudge(false)}
            />
          ) : (
            <Button variant="secondary" size="md" trailingIcon={<ArrowRight size={15} />} onClick={() => setNudge(true)}>
              Show the nudge again
            </Button>
          )}
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Toast · useToast"
          rows={[
            { name: 'toast(message, { tone?, duration? })', type: '(ReactNode, opts) => void', description: "tone is 'ink' or 'card'. duration defaults to 5000 ms; null keeps it until dismissed. The timer pauses on hover or focus. Showing a toast again replays its entrance." },
            { name: 'Toast.position', type: "'fixed' | 'static'", default: "'fixed'", description: 'For rendering a toast yourself. fixed pins it to the bottom centre of the screen; static renders it in place.' },
          ]}
        />
        <PropsTable
          title="Callout"
          rows={[
            { name: 'tone', type: "'neutral' | 'danger' | 'success'", default: "'neutral'", description: '' },
            { name: 'variant', type: "'card' | 'banner'", default: "'card'", description: '' },
            { name: 'title / actions', type: 'ReactNode', description: '' },
            { name: 'icon', type: 'ReactNode | false', description: 'Each tone has its own default icon. Pass false to hide it.' },
          ]}
        />
        <PropsTable
          title="EmptyState · Nudge · SuccessMark · Skeleton · Spinner · Placeholder"
          rows={[
            { name: 'EmptyState.icon / title / description / action / note', type: 'ReactNode', description: '' },
            { name: 'EmptyState.compact', type: 'boolean', description: 'A smaller version for "no results" inside a list.' },
            { name: 'Nudge.title / body / cta / onAct / onDismiss / icon / sticky', type: '…', description: '' },
            { name: 'SuccessMark.size', type: 'number', default: '64', description: '' },
            { name: 'Skeleton.className', type: 'string', description: 'Size it to match the content that will replace it.' },
            { name: 'Spinner.size', type: 'number', default: '22', description: '' },
          ]}
        />
      </Section>
    </>
  )
}
