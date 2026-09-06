import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Braces,
  Check,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Landmark,
  LockKeyhole,
  PauseCircle,
  Radio,
  ShieldCheck,
  Snowflake,
  WalletCards,
} from "lucide-react";
import { KeruxMark } from "@/components/kerux-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_DOCS_URL = "https://kerux-backend.onrender.com/docs";

const traceRows = [
  { label: "Request received", detail: "50.00 GHST → Helios", state: "done" },
  { label: "Agent status", detail: "ACTIVE", state: "done" },
  { label: "Currency", detail: "GHST", state: "done" },
  { label: "Per-transaction limit", detail: "5.00 GHST", state: "blocked" },
] as const;

const steps = [
  {
    number: "01",
    title: "Provision",
    description: "Create an isolated GHST account and receive the agent credential exactly once.",
    icon: WalletCards,
  },
  {
    number: "02",
    title: "Govern",
    description: "Set per-payment, daily, and counterparty rules that apply to the very next request.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Observe",
    description: "Watch the live ledger, understand every block, and freeze an agent in one action.",
    icon: Radio,
  },
] as const;

const faqs = [
  {
    question: "Is a blocked payment an error?",
    answer:
      "No. In Kērux, a blocked payment is proof that a rule worked. It is recorded as a first-class ledger event with the exact policy and human-readable reason that stopped it.",
  },
  {
    question: "What happens when I freeze an agent?",
    answer:
      "Freezing stops new payments and revokes the agent’s keys. Reactivating the agent issues a new key.",
  },
  {
    question: "Can two agents share funds or credentials?",
    answer:
      "No. Every agent gets its own account, balance, limits, ledger, and copy-once key. That isolation keeps one agent's behavior from silently becoming another agent's risk.",
  },
  {
    question: "Where can I see my account currency?",
    answer:
      "Each account displays its currency alongside its balance and payments.",
  },
] as const;

function Eyebrow({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-medium tracking-[0.16em] uppercase",
        inverse ? "text-primary" : "text-primary-ink",
      )}
    >
      {children}
    </p>
  );
}

function ProductConsole() {
  return (
    <div className="relative mx-auto mt-12 max-w-[1180px] px-4 sm:px-6 lg:mt-14">
      <div className="absolute -top-8 right-[9%] hidden items-center gap-2 rounded-md bg-primary px-3 py-2 font-mono text-[10px] font-medium text-primary-foreground shadow-[0_0_0_1px_rgb(28_27_23_/_0.14),0_8px_24px_rgb(28_27_23_/_0.12)] lg:flex">
        <Radio className="size-3.5" strokeWidth={2} aria-hidden="true" />
        POLICY PREVIEW
      </div>

      <div className="landing-preview overflow-hidden bg-foreground p-2 sm:p-3">
        <div className="flex h-11 items-center border-b border-white/10 px-3 text-white sm:px-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-white/25" />
            <span className="size-2 rounded-full bg-white/25" />
            <span className="size-2 rounded-full bg-primary" />
          </div>
          <span className="mx-auto font-mono text-[10px] tracking-[0.12em] text-white/60 uppercase">
            Owner control room / Example decision
          </span>
          <span className="hidden font-mono text-[10px] text-primary sm:block">48ms</span>
        </div>

        <div className="grid min-h-[470px] overflow-hidden rounded-b-xl bg-background md:grid-cols-[170px_minmax(0,1fr)] lg:grid-cols-[185px_minmax(0,1.25fr)_minmax(280px,.75fr)]">
          <aside className="hidden border-r border-border bg-muted p-4 md:block" aria-label="Product preview navigation">
            <KeruxMark />
            <p className="mb-2 mt-8 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">Agents</p>
            {[
              ["Concierge", "active"],
              ["Helios", "active"],
              ["Bookkeeper", "frozen"],
            ].map(([name, state], index) => (
              <div
                key={name}
                className={cn(
                  "mb-1 flex items-center gap-2 rounded-md px-2.5 py-2.5 text-xs",
                  index === 0 ? "bg-card font-medium surface-ring" : "text-muted-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full", state === "active" ? "bg-primary-ink" : "bg-destructive")} />
                {name}
              </div>
            ))}
            <div className="mt-8 rounded-lg bg-foreground p-3 text-white">
              <p className="font-mono text-[9px] tracking-[0.12em] text-white/60 uppercase">Total balance</p>
              <p className="mt-2 font-heading text-lg font-semibold tabular-nums">1,240.00</p>
              <p className="font-mono text-[9px] text-primary">GHST</p>
            </div>
          </aside>

          <section className="min-w-0 p-4 sm:p-6 lg:p-7" aria-label="Payment policy trace preview">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">Payment trace</p>
                <h2 className="mt-2 font-heading text-base font-semibold tracking-[-0.04em] sm:text-lg">Concierge → Helios</h2>
              </div>
              <span className="rounded-sm bg-destructive/10 px-2 py-1 font-mono text-[9px] font-semibold tracking-[0.1em] text-destructive uppercase">
                Blocked
              </span>
            </div>

            <div className="mt-7">
              {traceRows.map((row, index) => (
                <div key={row.label} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-3 pb-6 last:pb-0">
                  {index < traceRows.length - 1 && <span className="absolute left-[11px] top-5 h-full w-px bg-border" aria-hidden="true" />}
                  <span
                    className={cn(
                      "relative z-10 grid size-6 place-items-center rounded-full",
                      row.state === "blocked" ? "bg-destructive text-white" : "bg-primary text-primary-foreground",
                    )}
                  >
                    {row.state === "blocked" ? (
                      <PauseCircle className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg bg-card px-3.5 py-3 surface-ring">
                    <span className="truncate text-xs font-medium sm:text-sm">{row.label}</span>
                    <span className={cn("shrink-0 font-mono text-[10px]", row.state === "blocked" ? "text-destructive" : "text-muted-foreground")}>{row.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-border pt-5">
              {[
                ["Balance", "847.50"],
                ["Spent today", "2.50"],
                ["Remaining", "7.50"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-mono text-[8px] tracking-[0.08em] text-muted-foreground uppercase sm:text-[9px]">{label}</p>
                  <p className="mt-1 font-heading text-xs font-semibold tabular-nums sm:text-sm">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="border-t border-border bg-card p-5 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:p-6" aria-label="Policy decision preview">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="grid size-8 place-items-center rounded-md bg-destructive/10 text-destructive">
                <ShieldCheck className="size-4" strokeWidth={2} aria-hidden="true" />
              </span>
              Policy decision
            </div>
            <div className="mt-6 rounded-lg bg-destructive/[0.06] p-4 shadow-[inset_0_0_0_1px_rgb(190_18_60_/_0.14)]">
              <p className="font-mono text-[9px] font-semibold tracking-[0.1em] text-destructive uppercase">Transaction limit exceeded</p>
              <p className="mt-3 text-sm font-medium leading-5">Amount exceeds the per-transaction limit.</p>
            </div>
            <dl className="mt-6 space-y-4 text-xs">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <dt className="text-muted-foreground">Requested</dt>
                <dd className="font-mono font-medium tabular-nums">50.00 GHST</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <dt className="text-muted-foreground">Allowed</dt>
                <dd className="font-mono font-medium tabular-nums">5.00 GHST</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Funds moved</dt>
                <dd className="flex items-center gap-1.5 font-medium"><Check className="size-3.5 text-primary-ink" strokeWidth={2} aria-hidden="true" /> No</dd>
              </div>
            </dl>
            <p className="mt-8 border-l-2 border-primary pl-3 text-xs leading-5 text-muted-foreground">
              Payment blocked. No funds moved.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[60] -translate-y-20 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white transition-transform duration-150 ease-out focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="landing-header sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Kērux home" className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <KeruxMark />
          </Link>
          <nav className="ml-12 hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex" aria-label="Landing navigation">
            <a className="transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="#product">Product</a>
            <a className="transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="#guardrails">Guardrails</a>
            <a className="transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="#how-it-works">How it works</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/sign-in" className="hidden min-h-10 items-center px-2 text-sm font-medium transition-colors duration-150 hover:text-primary-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:flex">Sign in</Link>
            <Button asChild>
              <Link href="/dashboard">Open control room <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="landing-hero relative border-b border-border pb-12 pt-14 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary" aria-hidden="true" />
          <div className="mx-auto max-w-[1120px] px-4 text-center sm:px-6 lg:px-8">
            <div className="hero-eyebrow mx-auto inline-flex min-h-8 items-center gap-2 rounded-full bg-card px-3.5 font-mono text-[10px] font-medium tracking-[0.11em] text-primary-ink uppercase surface-ring">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-ink opacity-30 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-primary-ink" />
              </span>
              Financial control for autonomous agents
            </div>
            <h1 className="mx-auto mt-8 max-w-5xl text-balance font-heading text-[clamp(2.5rem,6.8vw,6rem)] font-semibold leading-[0.95] tracking-[-0.075em]">
              Let agents spend.
              <span className="mt-2 block text-primary-ink">Keep the final say.</span>
            </h1>
            <p className="hero-copy mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Give every AI agent an isolated account, hard spending limits, and a complete audit trail—then stop it instantly when the behavior changes.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">Create your workspace <ArrowRight aria-hidden="true" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={API_DOCS_URL} target="_blank" rel="noreferrer" aria-label="Explore the API documentation (opens in a new tab)">Explore the API <ExternalLink aria-hidden="true" /></a>
              </Button>
            </div>
          </div>
          <ProductConsole />
        </section>

        <section className="border-b border-border bg-card" aria-label="Platform principles">
          <div className="mx-auto grid max-w-[1240px] divide-y divide-border px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
            {[
              [Landmark, "One account per agent", "No pooled balances"],
              [LockKeyhole, "Spending controls", "Limits you define"],
              [Fingerprint, "Every attempt recorded", "Approved or blocked"],
            ].map(([Icon, title, detail]) => (
              <div key={title as string} className="flex items-center gap-4 py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary-ink">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title as string}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground uppercase">{detail as string}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="product" className="scroll-mt-24 border-b border-border py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
              <div className="max-w-xl">
                <Eyebrow>Control before money moves</Eyebrow>
                <h2 className="mt-5 text-balance font-heading text-4xl font-semibold leading-[1.03] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                  Policy is the payment layer.
                </h2>
              </div>
              <div className="max-w-xl lg:justify-self-end">
                <p className="text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  Set spending limits and approved recipients. Every payment is checked against your rules.
                </p>
              </div>
            </div>

            <div className="mt-14 grid overflow-hidden rounded-2xl bg-card surface-ring-strong lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Rules / Concierge</p>
                    <h3 className="mt-2 font-heading text-xl font-semibold tracking-[-0.04em]">Live policy set</h3>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[9px] font-medium text-primary-ink">ACTIVE</span>
                </div>
                <div className="mt-8 divide-y divide-border border-y border-border">
                  {[
                    ["Per transaction", "5.00 GHST", "20% of daily cap"],
                    ["Per day", "25.00 GHST", "Resets at 00:00 UTC"],
                    ["Counterparties", "2 approved", "Helios, Bookkeeper"],
                  ].map(([label, value, note]) => (
                    <div key={label} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                      </div>
                      <p className="font-heading text-base font-semibold tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex items-center gap-3 rounded-lg bg-inset p-4">
                  <Check className="size-4 shrink-0 text-primary-ink" strokeWidth={2} aria-hidden="true" />
                  <p className="text-xs leading-5 text-muted-foreground">Saved rules apply to the very next payment request.</p>
                </div>
              </div>

              <div className="border-t border-border bg-foreground p-5 text-white sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] tracking-[0.12em] text-white/60 uppercase">Decision volume / 24h</p>
                  <span className="flex items-center gap-2 font-mono text-[9px] text-primary"><span className="size-1.5 rounded-full bg-primary" /> EXAMPLE</span>
                </div>
                <div className="mt-6 flex items-end gap-3">
                  <span className="font-heading text-5xl font-semibold tracking-[-0.07em] tabular-nums">1,284</span>
                  <span className="pb-1 text-xs text-white/60">policy checks</span>
                </div>
                <svg className="mt-9 h-32 w-full" viewBox="0 0 500 130" role="img" aria-label="Policy checks increased steadily over the last 24 hours">
                  <path d="M0 101 C35 98 50 105 80 90 S130 67 165 78 S220 91 250 58 S305 38 340 55 S395 62 420 30 S465 11 500 18" fill="none" stroke="var(--primary)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                  <path d="M0 112H500M0 70H500M0 28H500" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <circle cx="500" cy="18" r="5" fill="var(--primary)" />
                </svg>
                <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div>
                    <p className="font-mono text-[9px] text-white/60 uppercase">Executed</p>
                    <p className="mt-1 font-heading text-lg text-primary tabular-nums">1,243</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-white/60 uppercase">Safely blocked</p>
                    <p className="mt-1 font-heading text-lg text-white tabular-nums">41</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="guardrails" className="scroll-mt-24 border-b border-border bg-muted py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Eyebrow>Designed for delegated spend</Eyebrow>
              <h2 className="mt-5 text-balance font-heading text-4xl font-semibold leading-[1.03] tracking-[-0.06em] sm:text-5xl lg:text-6xl">Autonomy without shared risk.</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Each agent becomes a legible financial actor—with its own money, authority, identity, and history.</p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-12">
              <article className="overflow-hidden rounded-xl bg-card p-5 surface-ring sm:p-7 lg:col-span-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="grid size-10 place-items-center rounded-lg bg-accent text-primary-ink"><Bot className="size-5" strokeWidth={1.75} aria-hidden="true" /></span>
                    <h3 className="mt-6 font-heading text-2xl font-semibold tracking-[-0.05em]">One account per agent</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">No pooled balance. No mystery about which system moved what.</p>
                  </div>
                  <span className="hidden font-mono text-[9px] text-muted-foreground sm:block">03 ACCOUNTS</span>
                </div>
                <div className="mt-8 overflow-hidden rounded-lg shadow-[0_0_0_1px_rgb(28_27_23_/_0.1)]">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-inset px-4 py-3 font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">
                    <span>Agent</span><span>Status</span><span>Balance</span>
                  </div>
                  {[
                    ["Concierge", "ACTIVE", "847.50"],
                    ["Helios", "ACTIVE", "300.00"],
                    ["Bookkeeper", "FROZEN", "92.50"],
                  ].map(([name, status, balance]) => (
                    <div key={name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-border px-4 py-4 text-xs first:border-t-0 sm:text-sm">
                      <span className="font-medium">{name}</span>
                      <span className={cn("rounded-sm px-2 py-1 font-mono text-[8px] font-semibold", status === "ACTIVE" ? "bg-accent text-primary-ink" : "bg-destructive/10 text-destructive")}>{status}</span>
                      <span className="w-20 text-right font-mono tabular-nums sm:w-24">{balance}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-xl bg-primary p-5 text-primary-foreground shadow-[0_0_0_1px_rgb(28_27_23_/_0.12)] sm:p-7 lg:col-span-5">
                <span className="grid size-10 place-items-center rounded-lg bg-foreground text-primary"><KeyRound className="size-5" strokeWidth={1.75} aria-hidden="true" /></span>
                <h3 className="mt-6 font-heading text-2xl font-semibold tracking-[-0.05em]">Keys shown once.</h3>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/90">Agent credentials are hashed server-side, shown only at creation or rotation, and never recoverable later.</p>
                <div className="mt-8 rounded-lg bg-foreground p-4 text-white">
                  <p className="font-mono text-[9px] tracking-[0.12em] text-white/60 uppercase">New agent key</p>
                  <p className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-primary">kx_agent_m73aIY0MjsbhFOrq...</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-white/60"><LockKeyhole className="size-3.5" strokeWidth={1.75} aria-hidden="true" /> Store it now. It will not appear again.</div>
                </div>
              </article>

              <article className="rounded-xl bg-card p-5 surface-ring sm:p-7 lg:col-span-5">
                <span className="grid size-10 place-items-center rounded-lg bg-accent text-primary-ink"><Braces className="size-5" strokeWidth={1.75} aria-hidden="true" /></span>
                <h3 className="mt-6 font-heading text-2xl font-semibold tracking-[-0.05em]">Built for agents and owners</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Manage your workspace securely. Give each agent its own access key and revoke it at any time.</p>
                <a href={API_DOCS_URL} target="_blank" rel="noreferrer" aria-label="Read the API reference (opens in a new tab)" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-ink transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Read the API reference <ExternalLink className="size-4" strokeWidth={2} aria-hidden="true" /></a>
              </article>

              <article className="relative overflow-hidden rounded-xl bg-foreground p-5 text-white shadow-[0_0_0_1px_rgb(28_27_23_/_0.16)] sm:p-7 lg:col-span-7">
                <div className="absolute right-0 top-0 size-40 translate-x-10 -translate-y-12 rounded-full border-[28px] border-primary/10" aria-hidden="true" />
                <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <span className="grid size-10 place-items-center rounded-lg bg-destructive text-white"><Snowflake className="size-5" strokeWidth={1.75} aria-hidden="true" /></span>
                    <h3 className="mt-6 font-heading text-2xl font-semibold tracking-[-0.05em]">Stay in control</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/60">Stop new payments and revoke access with a single action.</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.06] p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.1)] sm:w-48">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[9px] text-white/60 uppercase">Agent state</span>
                      <span className="size-2 rounded-full bg-destructive" />
                    </div>
                    <p className="mt-3 font-heading text-lg font-semibold">FROZEN</p>
                    <p className="mt-1 text-xs text-white/60">3 keys revoked</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-b border-border py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-20">
              <div className="max-w-md">
                <Eyebrow>Three moves to control</Eyebrow>
                <h2 className="mt-5 text-balance font-heading text-4xl font-semibold leading-[1.04] tracking-[-0.06em] sm:text-5xl">Set the boundary. Then let it work.</h2>
                <p className="mt-6 text-base leading-7 text-muted-foreground">Kērux stays out of the agent’s way until a financial decision crosses a line.</p>
              </div>
              <ol className="divide-y divide-border border-y border-border">
                {steps.map((step) => (
                  <li key={step.number} className="grid gap-5 py-7 sm:grid-cols-[52px_1fr_auto] sm:items-center sm:py-8">
                    <span className="font-mono text-xs text-primary-ink">{step.number}</span>
                    <div>
                      <h3 className="font-heading text-xl font-semibold tracking-[-0.04em]">{step.title}</h3>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-lg bg-accent text-primary-ink"><step.icon className="size-5" strokeWidth={1.75} aria-hidden="true" /></span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card py-20 sm:py-28 lg:py-36">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
            <div>
              <Eyebrow>Frequently asked</Eyebrow>
              <h2 className="mt-5 text-balance font-heading text-4xl font-semibold leading-[1.04] tracking-[-0.06em] sm:text-5xl">Clear rules deserve clear answers.</h2>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex min-h-11 list-none items-center justify-between gap-4 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-inset font-mono text-base transition-transform duration-150 ease-out group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="max-w-xl pb-2 pr-10 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-2xl bg-foreground px-5 py-16 text-center text-white shadow-[0_0_0_1px_rgb(28_27_23_/_0.18)] sm:px-10 sm:py-24">
            <div className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-primary" aria-hidden="true" />
            <div className="absolute -left-16 bottom-0 size-48 rounded-full border-[36px] border-primary/[0.07]" aria-hidden="true" />
            <div className="absolute -right-12 top-0 size-44 rounded-full border-[32px] border-white/[0.04]" aria-hidden="true" />
            <div className="relative mx-auto max-w-3xl">
              <Eyebrow inverse>Ready when your agents are</Eyebrow>
              <h2 className="mt-5 text-balance font-heading text-4xl font-semibold leading-[1.03] tracking-[-0.06em] sm:text-5xl lg:text-6xl">Put your agents to work.</h2>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-white/60">Provision the account. Set the policy. Keep every financial decision visible and within bounds.</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild><Link href="/sign-up">Create your workspace <ArrowRight aria-hidden="true" /></Link></Button>
                <Button size="lg" variant="outline" className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white" asChild><Link href="/dashboard">Open control room</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
          <KeruxMark />
          <p className="text-xs text-muted-foreground md:ml-4">Programmable financial boundaries for autonomous agents.</p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground md:ml-auto">
            <a href={API_DOCS_URL} target="_blank" rel="noreferrer" aria-label="API documentation (opens in a new tab)" className="transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">API docs</a>
            <Link href="/sign-in" className="transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Owner sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
