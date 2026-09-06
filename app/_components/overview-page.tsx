"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowRight, Bot, Check, CircleAlert, RefreshCw, ShieldCheck, WalletCards, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOwnerApi } from "@/lib/api/provider";
import { useOwnerEvents } from "@/lib/api/use-owner-events";
import { formatMoney, formatTimestamp, isStatus, normalizeStatus, ratioPercent, sumMoney } from "@/lib/api/format";
import type { Agent, HealthStatus, OwnerStats, Payment } from "@/lib/api/types";

function StatusBadge({ status }: { status: string }) {
  const value = normalizeStatus(status);
  if (["active", "approved", "executed"].includes(value)) return <Badge variant="outline" className="border-primary/45 bg-primary/15 text-primary-ink"><Check aria-hidden="true" />{value}</Badge>;
  if (["frozen", "blocked", "failed"].includes(value)) return <Badge variant="outline" className="border-destructive/25 bg-destructive/8 text-destructive"><X aria-hidden="true" />{value}</Badge>;
  if (value === "submitted") return <Badge variant="secondary"><RefreshCw className="animate-spin motion-reduce:animate-none" aria-hidden="true" />pending</Badge>;
  return <Badge variant="secondary">{value}</Badge>;
}

function Stat({ label, value, detail, danger = false }: { label: string; value: string; detail: string; danger?: boolean }) {
  return (
    <div className={cn("rounded-lg bg-card p-4 surface-ring sm:p-5", danger && "bg-destructive/5")}>
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-4 font-heading text-2xl font-semibold tracking-[-0.04em] tabular-nums", danger && "text-destructive")}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function OverviewPage() {
  const { client, authReady } = useOwnerApi();
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [stats, setStats] = React.useState<OwnerStats | null>(null);
  const [health, setHealth] = React.useState<HealthStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!authReady) return;
    const [agentsResult, activityResult, statsResult, healthResult] = await Promise.allSettled([
        client.listAgents(),
        client.activity({ limit: 8 }),
        client.stats(),
        client.health(),
    ]);
    if (healthResult.status === "fulfilled") setHealth(healthResult.value);
    if (agentsResult.status === "fulfilled" && activityResult.status === "fulfilled" && statsResult.status === "fulfilled") {
      setAgents(agentsResult.value);
      setPayments(activityResult.value.items);
      setStats(statsResult.value);
      setError(null);
    } else {
      const reason = [agentsResult, activityResult, statsResult].find((result) => result.status === "rejected");
      setError(
        healthResult.status === "fulfilled" && healthResult.value.clerk_configured === false
          ? "Workspace access is not available yet. Please contact your administrator."
          : reason?.status === "rejected" && reason.reason instanceof Error
            ? reason.reason.message
            : "The owner control room could not be loaded.",
      );
    }
    setLoading(false);
  }, [authReady, client]);

  React.useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  const connected = useOwnerEvents(() => void refresh(), () => void refresh());

  const agentNames = React.useMemo(() => Object.fromEntries(agents.map((agent) => [agent.id, agent.name])), [agents]);
  const commonCurrency = agents.length && agents.every((agent) => agent.base_currency === agents[0].base_currency) ? agents[0].base_currency : null;
  const capital = agents.length ? sumMoney(agents.map((agent) => agent.balance)) : "0.00";

  return (
    <>
      {health?.wewire_mode === "mock" && <div className="mb-5 flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive"><CircleAlert className="size-4 shrink-0" aria-hidden="true" /><p><span className="font-medium">Test mode.</span> Payments are simulated.</p></div>}
      {error && <div role="alert" className="mb-5 flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive"><CircleAlert className="size-4 shrink-0" aria-hidden="true" /><p className="flex-1">{error}</p><Button variant="outline" size="sm" onClick={refresh}>Retry</Button></div>}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-primary-ink uppercase">Owner control room</p>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Overview</h1>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-6 text-muted-foreground">Your agents, balances, and recent activity.</p>
        </div>
        <div className="flex gap-2"><Button variant="outline" size="lg" onClick={refresh}><RefreshCw className={cn(loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh</Button><Button size="lg" asChild><Link href="/agents">Manage agents<ArrowRight aria-hidden="true" /></Link></Button></div>
      </header>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Agent accounts" value={String(stats?.agents ?? agents.length).padStart(2, "0")} detail="Total accounts" />
        <Stat label="Available capital" value={commonCurrency ? formatMoney(capital, commonCurrency) : agents.length ? "Mixed currencies" : formatMoney("0.00", "GHST")} detail="Across your accounts" />
        <Stat label="Executed today" value={String(stats?.executed_today ?? 0).padStart(2, "0")} detail="Completed payments" />
        <Stat label="Blocked today" value={String(stats?.blocked_today ?? 0).padStart(2, "0")} detail="Prevented by your rules" danger />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
        <section aria-labelledby="live-activity-heading">
          <div className="mb-4 flex items-end justify-between gap-4"><div><div className="flex items-center gap-2"><h2 id="live-activity-heading" className="text-lg font-semibold tracking-[-0.02em]">Recent activity</h2><span className={cn("flex items-center gap-1.5 font-mono text-[10px]", connected ? "text-primary-ink" : "text-muted-foreground")}><span className={cn("size-1.5 rounded-full", connected ? "bg-primary" : "bg-muted-foreground")} />{connected ? "LIVE" : "RECONNECTING"}</span></div></div><Button variant="ghost" size="sm" asChild><Link href="/activity">Full ledger<ArrowRight aria-hidden="true" /></Link></Button></div>
          <div className="overflow-hidden rounded-lg bg-card surface-ring">
            {payments.map((payment) => { const blocked = isStatus(payment.status, "blocked"); return <article key={payment.id} className={cn("grid gap-3 border-b border-border p-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center", blocked && "bg-destructive/5")}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-medium">{payment.memo ?? payment.kind.replaceAll("_", " ").toLowerCase()}</p><StatusBadge status={payment.status} /></div><p className="mt-1 truncate text-xs text-muted-foreground">{agentNames[payment.agent_id] ?? payment.agent_id} · {formatTimestamp(payment.created_at)}</p>{blocked && <p className="mt-2 text-xs font-medium text-destructive">{payment.failure_reason ?? payment.rule_violated ?? "Blocked by policy"}</p>}</div><p className={cn("font-heading text-sm font-semibold tabular-nums", blocked && "text-destructive")}>{formatMoney(payment.amount, payment.currency)}</p></article>; })}
            {!payments.length && <div className="grid min-h-52 place-items-center p-6 text-center"><div>{loading ? <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" /> : <Activity className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />}<p className="mt-3 text-sm font-medium">{loading ? "Loading activity" : "No payment attempts yet"}</p><p className="mt-1 text-xs text-muted-foreground">Approved and blocked attempts will appear in one trail.</p></div></div>}
          </div>
        </section>

        <section aria-labelledby="agent-watch-heading">
          <div className="mb-4"><h2 id="agent-watch-heading" className="text-lg font-semibold tracking-[-0.02em]">Agents</h2><p className="mt-1 text-sm text-muted-foreground">Balances and daily spending.</p></div>
          <div className="overflow-hidden rounded-lg bg-card surface-ring">
            {agents.slice(0, 5).map((agent) => { const usage = ratioPercent(agent.spent_today, agent.rules?.max_per_day ?? "0"); return <Link key={agent.id} href={`/agents/${agent.id}`} className="block border-b border-border p-4 transition-colors duration-150 last:border-0 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{agent.name}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{formatMoney(agent.balance, agent.base_currency)}</p></div><StatusBadge status={agent.status} /></div><div className="mt-4 flex items-center justify-between text-xs"><span className="text-muted-foreground">{formatMoney(agent.remaining_today, agent.base_currency)} left today</span><span className="font-mono tabular-nums">{Math.round(usage)}%</span></div><Progress value={usage} className="mt-2 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" /></Link>; })}
            {!agents.length && !loading && <div className="grid min-h-52 place-items-center p-6 text-center"><div><Bot className="mx-auto size-5 text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm font-medium">No agents yet</p><Button className="mt-4" size="sm" asChild><Link href="/agents">Create an agent</Link></Button></div></div>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-inset p-4 surface-ring"><WalletCards className="size-4 text-muted-foreground" aria-hidden="true" /><p className="mt-3 font-heading text-lg font-semibold tabular-nums">{agents.filter((agent) => agent.status.toUpperCase() === "ACTIVE").length}</p><p className="mt-1 text-xs text-muted-foreground">Active agents</p></div><div className="rounded-lg bg-inset p-4 surface-ring"><ShieldCheck className="size-4 text-primary-ink" aria-hidden="true" /><p className="mt-3 font-heading text-lg font-semibold tabular-nums">{stats?.frozen ?? 0}</p><p className="mt-1 text-xs text-muted-foreground">Agents frozen</p></div></div>
        </section>
      </div>

      
    </>
  );
}
