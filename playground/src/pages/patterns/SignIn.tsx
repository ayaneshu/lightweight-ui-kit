import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, ClockCountdown, EnvelopeSimple, Eye, EyeSlash, GithubLogo, GoogleLogo, LinkBreak, LockSimple, type Icon } from 'lightweight-ui/icons'
import {
  AvatarStack,
  Backdrop,
  Button,
  buttonClasses,
  Callout,
  Card,
  Checkbox,
  cn,
  Divider,
  Eyebrow,
  Field,
  FieldError,
  Heading,
  IconButton,
  Input,
  Loader,
  Logo,
  optionColor,
  personName,
  ShareBar,
  SlidingSwitch,
  StatusBadge,
  SuccessMark,
  Text,
  useToast,
} from 'lightweight-ui'
import { Demo, PageHeader, Section } from '../../ui/Demo'

const DOMAIN = '@example.com'

export default function SignIn() {
  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title="Sign in"
        description="The screens around the product: signing in or creating an account, the landing page in front of it, and what a voter sees when a link can’t open a form. Each has one clear thing to do."
      />

      <Section
        id="auth"
        title="Sign in"
        description="Signing in and creating an account share one card, with a sliding switch between them. The product sits beside the form, so people see what they’re signing in to."
      >
        <Demo
          stage="none"
          description={`Try any ${DOMAIN} address. A password under 8 characters shows the error; anything longer signs you in.`}
          code={AUTH_CODE}
        >
          <AuthScreen />
        </Demo>
        <Notes
          items={[
            'One primary button, full width. Single sign-on comes first because it’s the fastest way in.',
            'Errors appear under the fields they’re about, above the button, and say how to fix the problem.',
            'Creating an account shows how strong the password is as you type, and ticks off each rule as you meet it.',
            'The button keeps its width while it works, so the card doesn’t shift under the pointer.',
          ]}
        />
        <Demo
          stage="none"
          title="Demo mode"
          description="When no sign-in service is connected, the card says so plainly and offers the one way forward."
          code={DEMO_CODE}
        >
          <AuthScreen demo />
        </Demo>
      </Section>

      <Section
        id="landing"
        title="Landing"
        description="A headline, one paragraph and two buttons, then three short feature cards. The buttons go to other pages, so they’re links styled with buttonClasses()."
      >
        <Demo stage="none" code={LANDING_CODE}>
          <Landing />
        </Demo>
      </Section>

      <Section
        id="status"
        title="Status screens"
        description="What a voter sees instead of a form. Each screen says what happened, why, and offers one way on."
      >
        <Demo stage="none" code={STATUS_CODE}>
          <StatusScreens />
        </Demo>
      </Section>
    </>
  )
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="max-w-2xl list-disc space-y-1.5 ps-5 text-ui leading-relaxed text-pretty text-muted marker:text-line-strong">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------- Auth */

type Mode = 'signin' | 'signup'

/** Four plain rules, scored as you type. */
const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'number', label: 'A number', test: (p: string) => /\d/.test(p) },
  { id: 'symbol', label: 'A symbol, like ! or #', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { id: 'long', label: '12 characters or more', test: (p: string) => p.length >= 12 },
]
const STRENGTH = ['Too short', 'Weak', 'Okay', 'Strong', 'Very strong']

function AuthScreen({ demo = false }: { demo?: boolean }) {
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<false | 'form' | 'google' | 'github'>(false)
  const [done, setDone] = useState<null | { kind: Mode; email: string }>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const signup = mode === 'signup'
  const met = RULES.filter((r) => r.test(password)).length
  const score = password.length < 8 ? 0 : met

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  function later(fn: () => void, ms = 900) {
    timer.current = setTimeout(fn, ms)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const address = email.trim().toLowerCase()
    if (signup && !name.trim()) return setError('Enter your name.')
    if (!address || !password) return setError('Enter your email and password.')
    if (!address.endsWith(DOMAIN)) return setError(`Use your ${DOMAIN} email address.`)
    if (signup && password.length < 8) return setError('Choose a password with at least 8 characters.')
    setBusy('form')
    later(() => {
      setBusy(false)
      if (!signup && password.length < 8) return setError('That email and password don’t match. Check them and try again.')
      setDone({ kind: mode, email: address })
    })
  }

  function sso(provider: 'google' | 'github') {
    setError(null)
    setBusy(provider)
    later(() => {
      setBusy(false)
      toast(`Continuing with ${provider === 'google' ? 'Google' : 'GitHub'}`)
    })
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  function reset() {
    setDone(null)
    setPassword('')
  }

  return (
    <div className="@container overflow-hidden rounded-panel bg-bg">
      <div className="grid min-h-[640px] @2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* The form */}
        <div className="flex flex-col px-6 py-8 @4xl:px-12">
          <Logo name="Acme Forms" />
          <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center py-10">
            {demo ? (
              <DemoMode onContinue={() => toast('Continuing as a demo creator')} />
            ) : done ? (
              <Done done={done} name={name} onBack={reset} />
            ) : (
              <div key={mode} className="u-swap">
                <Heading size="display-sm" level={2}>
                  {signup ? 'Create your account' : 'Welcome back'}
                </Heading>
                <Text size="body" tone="muted" relaxed className="mt-1.5">
                  {signup ? 'Start collecting feedback in a few minutes.' : 'Sign in to pick up where you left off.'}
                </Text>

                <SlidingSwitch
                  label="Account"
                  value={mode}
                  onChange={switchMode}
                  items={[
                    { value: 'signin', label: 'Sign in' },
                    { value: 'signup', label: 'Create account' },
                  ]}
                  className="mt-6 w-full"
                />

                <div className="mt-6 grid gap-2 @sm:grid-cols-2">
                  <Button variant="secondary" size="md" loading={busy === 'google'} disabled={Boolean(busy)} onClick={() => sso('google')} leadingIcon={<GoogleLogo size={16} weight="bold" aria-hidden="true" />}>
                    Google
                  </Button>
                  <Button variant="secondary" size="md" loading={busy === 'github'} disabled={Boolean(busy)} onClick={() => sso('github')} leadingIcon={<GithubLogo size={16} weight="fill" aria-hidden="true" />}>
                    GitHub
                  </Button>
                </div>

                <Divider label="or with email" className="my-5" />

                <form onSubmit={submit} noValidate className="space-y-3.5">
                  {signup && (
                    <Field label="Name">
                      <Input value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" invalid={Boolean(error) && !name.trim()} />
                    </Field>
                  )}
                  <Field label="Work email">
                    <Input type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} placeholder={`ada${DOMAIN}`} invalid={Boolean(error) && !email.trim().toLowerCase().endsWith(DOMAIN)} />
                  </Field>
                  <Field label="Password">
                    <div className="relative">
                      <Input
                        type={reveal ? 'text' : 'password'}
                        value={password}
                        autoComplete={signup ? 'new-password' : 'current-password'}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pe-11"
                        invalid={Boolean(error) && (signup ? password.length < 8 : !password)}
                      />
                      <div className="absolute inset-y-0 end-1.5 grid place-items-center">
                        <IconButton label={reveal ? 'Hide password' : 'Show password'} size="sm" shape="square" pressed={reveal} onClick={() => setReveal((r) => !r)}>
                          {reveal ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </div>
                    </div>
                  </Field>

                  {signup && <Strength password={password} score={score} />}

                  {!signup && (
                    <div className="flex items-center justify-between gap-3">
                      <Checkbox label="Keep me signed in" defaultChecked className="text-label" />
                      <button type="button" onClick={() => toast('Password reset link sent')} className="rounded-md text-label font-medium text-muted underline decoration-line-control/60 underline-offset-4 hover:text-ink hover:decoration-current focus-visible:outline-offset-2">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {error && <FieldError>{error}</FieldError>}

                  <Button type="submit" block loading={busy === 'form'} disabled={Boolean(busy) && busy !== 'form'} trailingIcon={<ArrowRight size={15} aria-hidden="true" />}>
                    {busy === 'form' ? (signup ? 'Creating account…' : 'Signing in…') : signup ? 'Create account' : 'Sign in'}
                  </Button>
                </form>

                <p className="mt-6 text-center text-caption leading-relaxed text-muted">
                  {signup ? (
                    <>
                      By creating an account, you agree to the{' '}
                      <a href="#/sign-in" className="underline decoration-line-control underline-offset-2 hover:text-ink">
                        terms
                      </a>{' '}
                      and{' '}
                      <a href="#/sign-in" className="underline decoration-line-control underline-offset-2 hover:text-ink">
                        privacy policy
                      </a>
                      .
                    </>
                  ) : (
                    <>New here? Choose <span className="font-medium text-ink">Create account</span> above.</>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* The product, beside the form */}
        <Backdrop bg="m-aurora" className="hidden flex-col items-center justify-center gap-6 p-8 @2xl:flex">
          <Glimpse />
        </Backdrop>
      </div>
    </div>
  )
}

/** How strong the password is, and which rules it meets — read as you type. */
function Strength({ password, score }: { password: string; score: number }) {
  return (
    <div aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i <= score ? (score >= 3 ? 'bg-open' : 'bg-ink') : 'bg-ink/10')} />
        ))}
      </div>
      <p className="mt-1.5 text-caption text-muted">
        Password strength: <span className="font-medium text-ink">{password ? STRENGTH[score] : '—'}</span>
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {RULES.map((r) => {
          const ok = r.test(password)
          return (
            <li key={r.id} className={cn('flex items-center gap-1.5 text-caption transition-colors', ok ? 'text-ink' : 'text-muted')}>
              <span className="grid h-3.5 w-3.5 flex-none place-items-center" aria-hidden="true">
                {ok ? <Check size={12} weight="bold" className="u-icon-in text-open" /> : <span className="u-circle h-1 w-1 rounded-full bg-current" />}
              </span>
              {r.label}
              <span className="sr-only">{ok ? ', done' : ''}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** After a submit: a pop for the moment, then what happens next. */
function Done({ done, name, onBack }: { done: { kind: Mode; email: string }; name: string; onBack: () => void }) {
  const first = (done.kind === 'signup' ? name.trim() : personName(done.email)).split(' ')[0]
  return (
    <div className="u-swap flex flex-col items-center text-center" role="status">
      <SuccessMark size={56} />
      {done.kind === 'signup' ? (
        <>
          <Heading size="title" level={2} className="mt-6">
            Check your inbox
          </Heading>
          <Text tone="muted" relaxed className="mt-1.5 max-w-[300px]">
            We sent a link to <span className="font-medium text-ink">{done.email}</span>. Open it to confirm your email, then you’re in.
          </Text>
          <Button variant="secondary" size="md" className="mt-6" leadingIcon={<EnvelopeSimple size={16} aria-hidden="true" />} onClick={onBack}>
            Use a different email
          </Button>
        </>
      ) : (
        <>
          <Heading size="title" level={2} className="mt-6">
            Welcome back, {first}
          </Heading>
          <p className="mt-2 flex items-center gap-2 text-ui text-muted">
            <Loader variant="dots" size="sm" label="Opening your workspace" /> Opening your workspace…
          </p>
          <Button variant="link" className="mt-6" onClick={onBack}>
            Sign out and start over
          </Button>
        </>
      )}
    </div>
  )
}

function DemoMode({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <Heading size="display-sm" level={2}>
        Try it out
      </Heading>
      <Callout title="Demo mode" className="mt-5">
        No sign-in service is connected, so you can look around as a demo creator. Your forms are saved in this browser only.
      </Callout>
      <Button block className="mt-4" trailingIcon={<ArrowRight size={15} aria-hidden="true" />} onClick={onContinue}>
        Continue in demo mode
      </Button>
    </div>
  )
}

/** A floating slice of the product: a live form, its votes, the people on it. */
function Glimpse() {
  return (
    <>
      <div className="cursor-default select-none pg-float w-full max-w-[320px] rounded-tile bg-card p-4 shadow-modal">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status="open" />
          <AvatarStack people={[{ person: 'ada@example.com' }, { person: 'sam@example.com' }, { person: 'lee@example.com' }, { person: 'kim@example.com' }]} max={3} tooltips={false} />
        </div>
        <p className="mt-3 text-title font-semibold tracking-tight">Checkout redesign</p>
        <p className="mt-0.5 text-label text-muted">Which checkout feels faster?</p>
        <ShareBar
          className="mt-4"
          slices={[
            { id: 'a', label: 'One page', value: 38, color: optionColor(0) },
            { id: 'b', label: 'Two steps', value: 61, color: optionColor(1) },
          ]}
        />
        <p className="mt-2.5 text-caption text-muted">99 votes · closes Friday</p>
      </div>
      <div className="cursor-default select-none pg-float-late flex items-center gap-2 rounded-full bg-card py-1.5 ps-1.5 pe-3.5 text-label font-medium shadow-card">
        <span className="u-circle grid h-6 w-6 place-items-center rounded-full bg-open text-white" aria-hidden="true">
          <Check size={13} weight="bold" />
        </span>
        Two steps is leading with 61%
      </div>
      <p className="max-w-[300px] text-center text-ui font-medium text-balance text-white/90">Compare prototypes, collect votes, pick a winner.</p>
    </>
  )
}

/* ---------------------------------------------------------------- Landing */

const FEATURES = [
  { title: 'Three screens, start to finish', body: 'Welcome voters, show them what to compare, then thank them. You write every screen.' },
  { title: 'Real prototypes', body: 'Add images, video, Figma frames or live React prototypes that voters can click through.' },
  { title: 'Results your way', body: 'Show voters the live tally, or keep it to yourself. It’s one switch.' },
]

function Landing() {
  return (
    <div className="@container bg-bg px-6 py-16">
      <div className="mx-auto w-full max-w-[720px]">
        <Eyebrow>Acme Forms</Eyebrow>
        <Heading size="display-lg" level={2} className="mt-2">
          Get clear feedback,
          <br />
          in minutes.
        </Heading>
        <Text size="body" tone="muted" relaxed className="mt-4 max-w-lg">
          Build a short feedback form, share it with a link, and read results you can act on. Voters compare prototypes, rate, choose and comment.
        </Text>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#/dashboard" className={buttonClasses()}>
            Go to your workspace <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a
            href="#/sign-in"
            onClick={(e) => {
              // Same page in the playground — scroll up to the sign-in demo instead.
              e.preventDefault()
              document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={buttonClasses({ variant: 'secondary' })}
          >
            Sign in
          </a>
        </div>

        <div className="mt-14 grid gap-4 @2xl:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} variant="raised" radius="sheet" interactive className="border-transparent">
              <Heading size="subtitle" level={3}>
                {f.title}
              </Heading>
              <Text tone="muted" relaxed className="mt-1.5">
                {f.body}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- Status screens */

const STATUS: { icon: Icon; title: string; body: React.ReactNode; action: string; toast: string }[] = [
  {
    icon: LinkBreak,
    title: 'Form not found',
    body: 'Check the link for typos, or ask whoever sent it for a new one.',
    action: 'Go to your workspace',
    toast: 'Opening your workspace',
  },
  {
    icon: ClockCountdown,
    title: 'This form has closed',
    body: 'It stopped taking responses on 14 September 2026. You can still see the results.',
    action: 'See the results',
    toast: 'Opening the results',
  },
  {
    icon: LockSimple,
    title: 'Sign in to respond',
    body: (
      <>
        Each person can respond once, so sign in with your <span className="font-medium text-ink">{DOMAIN}</span> account. You’ll come straight
        back here.
      </>
    ),
    action: 'Sign in',
    toast: 'Opening sign-in. You’ll come straight back.',
  },
]

function StatusScreens() {
  const toast = useToast()
  return (
    <div className="@container bg-bg">
      <div className="grid gap-2 p-2 @2xl:grid-cols-3">
        {STATUS.map((s) => (
          <div key={s.title} className="group flex min-h-[320px] flex-col items-center justify-center rounded-tile bg-ink/[0.025] px-6 py-12 text-center">
            <span
              className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-card text-ink shadow-card transition-[translate,rotate] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:-rotate-6"
              aria-hidden="true"
            >
              <s.icon size={22} />
            </span>
            <Heading size="title" level={3}>
              {s.title}
            </Heading>
            <Text size="body" tone="muted" relaxed className="mt-2 max-w-[280px]">
              {s.body}
            </Text>
            <Button className="mt-6" onClick={() => toast(s.toast)}>
              {s.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Code */

const AUTH_CODE = `<SlidingSwitch label="Account" value={mode} onChange={setMode}
  items={[{ value: 'signin', label: 'Sign in' }, { value: 'signup', label: 'Create account' }]} />

<Button variant="secondary" leadingIcon={<GoogleLogo />} onClick={google}>Google</Button>
<Button variant="secondary" leadingIcon={<GithubLogo />} onClick={github}>GitHub</Button>
<Divider label="or with email" />

<form onSubmit={submit} noValidate>
  <Field label="Work email"><Input type="email" placeholder="ada@example.com" … /></Field>
  <Field label="Password">
    <Input type={reveal ? 'text' : 'password'} className="pe-11" … />
    <IconButton label={reveal ? 'Hide password' : 'Show password'} pressed={reveal} onClick={toggleReveal}>…</IconButton>
  </Field>
  {error && <FieldError>{error}</FieldError>}
  <Button type="submit" block loading={busy}>{mode === 'signup' ? 'Create account' : 'Sign in'}</Button>
</form>

// After a successful sign-up
<SuccessMark size={56} />
<Heading size="title">Check your inbox</Heading>`

const DEMO_CODE = `<Callout title="Demo mode">
  No sign-in service is connected, so you can look around as a demo creator. Your forms are saved in this browser only.
</Callout>
<Button block className="mt-4" trailingIcon={<ArrowRight size={15} />}>Continue in demo mode</Button>`

const LANDING_CODE = `<Eyebrow>Acme Forms</Eyebrow>
<Heading size="display-lg">Get clear feedback,<br />in minutes.</Heading>
<Text size="body" tone="muted" relaxed>Build a short feedback form, share it with a link, …</Text>

<a href="/creator" className={buttonClasses()}>Go to your workspace <ArrowRight size={15} /></a>
<a href="/login" className={buttonClasses({ variant: 'secondary' })}>Sign in</a>

<div className="grid gap-4 sm:grid-cols-3">
  {features.map((f) => (
    <Card variant="raised" radius="sheet">
      <Heading size="subtitle" level={3}>{f.title}</Heading>
      <Text tone="muted" relaxed>{f.body}</Text>
    </Card>
  ))}
</div>`

const STATUS_CODE = `<div className="mx-auto flex min-h-dvh max-w-[600px] flex-col items-center justify-center px-6 text-center">
  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-card shadow-card"><ClockCountdown size={22} /></span>
  <Heading size="title">This form has closed</Heading>
  <Text size="body" tone="muted" relaxed>It stopped taking responses on 14 September 2026. You can still see the results.</Text>
  <Button className="mt-6">See the results</Button>
</div>`
