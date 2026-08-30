"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Unplug,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBrowserOwnerClient } from "@/lib/api/client";
import { currencies, type Agent, type Currency, type Payment, type RulesInput } from "@/lib/api/types";
import { agentNames as demoAgentNames, demoAgents, demoPayments } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const apiConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL);
const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatMoney(amount: string | number, currency: string) {
  const value = Number(amount);
  if (currency === "USDC" || currency === "USDT") return `${money.format(value)} ${currency}`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return `${money.format(value)} ${currency}`;
  }
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function agentNameMap(agents: Agent[]) {
  return { ...demoAgentNames, ...Object.fromEntries(agents.map((agent) => [agent.id, agent.name])) };
}

function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-primary-ink uppercase">{eyebrow}</p>
        <h1 className="mt-3 text-balance text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-xl text-pretty text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="mt-10 flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>Kērux control room · WeWire sandbox</p>
      <p className="font-mono">API contract v0.1.0</p>
    </footer>
  );
}

function Notice({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  if (!message) return null;
  return (
    <div role="status" className="mb-5 flex items-start gap-3 rounded-md border border-primary/45 bg-primary/15 px-4 py-3 text-sm text-primary-ink">
      <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <p className="flex-1 text-pretty">{message}</p>
      <button onClick={onDismiss} className="-m-2 grid size-9 place-items-center rounded-md text-primary-ink/70 hover:bg-primary/15 hover:text-primary-ink" aria-label="Dismiss notice">
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (["active", "approved", "executed", "healthy"].includes(status)) {
    return <Badge variant="outline" className="border-primary/45 bg-primary/15 text-primary-ink"><Check aria-hidden="true" />{status}</Badge>;
  }
  if (["frozen", "blocked", "failed", "offline"].includes(status)) {
    return <Badge variant="outline" className="border-destructive/25 bg-destructive/8 text-destructive"><X aria-hidden="true" />{status}</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

function AgentIdentity({ agent }: { agent: Agent }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9 rounded-md">
        <AvatarFallback className="rounded-md bg-secondary font-heading text-xs text-secondary-foreground">{initials(agent.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{agent.name}</p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{agent.id}</p>
      </div>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, tone = "neutral" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "neutral" | "primary" | "danger" }) {
  return (
    <div className="rounded-lg bg-card p-4 surface-ring sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
        <span className={cn("grid size-8 place-items-center rounded-md", tone === "primary" ? "bg-primary/25 text-primary-ink" : tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground")}>
          <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 font-heading text-2xl font-semibold tracking-[-0.04em] tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function OneTimeKeyDialog({ value, onClose }: { value: string | null; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  async function copyKey() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }
  return (
    <Dialog open={Boolean(value)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-lg sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Copy the agent key now</DialogTitle>
          <DialogDescription>This scoped API key is returned once and cannot be retrieved again. Store it in the agent runtime’s secret manager.</DialogDescription>
        </DialogHeader>
        <div className="my-5 rounded-md bg-inset p-4 surface-ring">
          <p className="break-all font-mono text-xs leading-6 text-foreground">{value}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>I stored it</Button>
          <Button onClick={copyKey}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy key"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateAgentDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (agent: Agent, apiKey?: string) => void }) {
  const [currency, setCurrency] = React.useState<Currency>("USD");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const client = React.useMemo(() => createBrowserOwnerClient(), []);
  function changeOpen(nextOpen: boolean) { if (!nextOpen) setError(null); onOpenChange(nextOpen); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const input = {
      name: String(form.get("name")),
      base_currency: currency,
      initial_funding: String(form.get("funding") || "0"),
      max_per_transaction: String(form.get("transaction")),
      max_per_day: String(form.get("daily")),
    };
    try {
      if (apiConfigured) {
        const created = await client.createAgent(input);
        onCreated(created.agent, created.api_key);
      } else {
        const id = `agt_${crypto.randomUUID().slice(0, 8)}`;
        onCreated({
          id,
          name: input.name,
          status: "active",
          base_currency: currency,
          balance: String(input.initial_funding),
          spent_today: "0.00",
          remaining_today: String(input.max_per_day),
          rules: { max_per_transaction: String(input.max_per_transaction), max_per_day: String(input.max_per_day), allowed_counterparty_ids: null },
          wewire_sub_customer_id: `pending_${id}`,
          key_prefix: "krx_demo_new",
          created_at: new Date().toISOString(),
        }, `krx_demo_${crypto.randomUUID().replaceAll("-", "")}`);
      }
      changeOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The account could not be provisioned.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="rounded-lg sm:max-w-[540px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Provision an agent account</DialogTitle>
            <DialogDescription>Creates a WeWire sub-customer, isolated wallet, policy envelope, and one-time scoped key.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="grid gap-2"><Label htmlFor="new-agent-name">Agent name</Label><Input id="new-agent-name" name="name" className="h-10 rounded-md bg-input" placeholder="Invoice reconciler" required maxLength={120} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="new-agent-currency">Base currency</Label><Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}><SelectTrigger id="new-agent-currency" className="h-10 w-full rounded-md bg-input"><SelectValue /></SelectTrigger><SelectContent>{currencies.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label htmlFor="new-agent-funding">Initial funding</Label><Input id="new-agent-funding" name="funding" type="number" min="0" step="0.01" className="h-10 rounded-md bg-input tabular-nums" defaultValue="5000" /></div>
            </div>
            <div className="rounded-md bg-inset p-4 surface-ring">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="size-4 text-primary-ink" aria-hidden="true" />Hard spending limits</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="new-agent-transaction">Per transaction</Label><Input id="new-agent-transaction" name="transaction" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-background tabular-nums" defaultValue="250" required /></div>
                <div className="grid gap-2"><Label htmlFor="new-agent-daily">Per UTC day</Label><Input id="new-agent-daily" name="daily" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-background tabular-nums" defaultValue="1000" required /></div>
              </div>
            </div>
          </div>
          {error && <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => changeOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <RefreshCw className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}{saving ? "Provisioning" : "Create & issue key"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FundAgentDialog({ agent, onOpenChange, onFunded }: { agent: Agent | null; onOpenChange: (open: boolean) => void; onFunded: (agentId: string, amount: number, balance?: string) => void }) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const client = React.useMemo(() => createBrowserOwnerClient(), []);
  function changeOpen(nextOpen: boolean) { if (!nextOpen) setError(null); onOpenChange(nextOpen); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agent) return;
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    try {
      if (apiConfigured) {
        const result = await client.fundAgent(agent.id, { amount, currency: agent.base_currency as Currency });
        onFunded(agent.id, amount, result.balance);
      } else onFunded(agent.id, amount);
      changeOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The wallet could not be funded.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={Boolean(agent)} onOpenChange={changeOpen}>
      <DialogContent className="rounded-lg sm:max-w-[460px]">
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle className="font-heading text-lg">Fund {agent?.name}</DialogTitle><DialogDescription>Top up this isolated wallet from the business wallet through WeWire’s sweep.</DialogDescription></DialogHeader>
          <div className="grid gap-2 py-5"><Label htmlFor="fund-amount">Amount in {agent?.base_currency}</Label><Input id="fund-amount" name="amount" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-input tabular-nums" defaultValue="500" required /><p className="text-xs text-muted-foreground">Current balance: {agent ? formatMoney(agent.balance, agent.base_currency) : "—"}</p></div>
          {error && <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => changeOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Sweeping funds" : "Fund wallet"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AgentsPage() {
  const [agents, setAgents] = React.useState(demoAgents);
  const [search, setSearch] = React.useState("");
  const [notice, setNotice] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [fundingAgent, setFundingAgent] = React.useState<Agent | null>(null);
  const [issuedKey, setIssuedKey] = React.useState<string | null>(null);
  const [busyAgent, setBusyAgent] = React.useState<string | null>(null);
  const client = React.useMemo(() => createBrowserOwnerClient(), []);

  React.useEffect(() => {
    if (!apiConfigured) return;
    client.listAgents().then(setAgents).catch(() => setNotice("Backend unavailable; showing the local demo ledger so the control room remains usable."));
  }, [client]);

  const visibleAgents = agents.filter((agent) => `${agent.name} ${agent.id} ${agent.base_currency}`.toLowerCase().includes(search.toLowerCase()));
  const totalBalance = agents.reduce((sum, agent) => sum + Number(agent.balance), 0);
  const active = agents.filter((agent) => agent.status === "active").length;

  async function toggleAgent(agent: Agent) {
    setBusyAgent(agent.id);
    try {
      const nextStatus = agent.status === "frozen" ? "active" : "frozen";
      if (apiConfigured) {
        const result = agent.status === "frozen" ? await client.unfreezeAgent(agent.id) : await client.freezeAgent(agent.id);
        setAgents((items) => items.map((item) => item.id === agent.id ? { ...item, status: result.status, key_prefix: result.status === "frozen" ? null : item.key_prefix } : item));
        if (result.api_key) setIssuedKey(result.api_key);
      } else setAgents((items) => items.map((item) => item.id === agent.id ? { ...item, status: nextStatus } : item));
      setNotice(`${agent.name} ${nextStatus === "frozen" ? "was stopped before another payment could reach WeWire" : "is active with revoked keys left revoked"}.`);
    } catch {
      setNotice("The rail did not respond. No remote account state was changed.");
    } finally {
      setBusyAgent(null);
    }
  }

  async function rotateKey(agent: Agent) {
    setBusyAgent(agent.id);
    try {
      const key = apiConfigured ? (await client.rotateKey(agent.id)).api_key : `krx_demo_${crypto.randomUUID().replaceAll("-", "")}`;
      setIssuedKey(key);
      setNotice(`${agent.name} received a fresh scoped key. The previous key is revoked.`);
    } catch {
      setNotice("Key rotation failed; the existing key remains in place.");
    } finally {
      setBusyAgent(null);
    }
  }

  function created(agent: Agent, key?: string) {
    setAgents((items) => [agent, ...items]);
    setNotice(`${agent.name} now has an isolated identity, wallet, and policy envelope.`);
    if (key) setIssuedKey(key);
  }

  function funded(agentId: string, amount: number, balance?: string) {
    setAgents((items) => items.map((agent) => agent.id === agentId ? { ...agent, balance: balance ?? String(Number(agent.balance) + amount) } : agent));
    setNotice(`Wallet funded with ${money.format(amount)} through the ${apiConfigured ? "WeWire sweep" : "local demo rail"}.`);
  }

  return (
    <>
      <Notice message={notice} onDismiss={() => setNotice(null)} />
      <PageHeader eyebrow="Wallet registry" title="Agent accounts" description="Provision an identity and wallet for every autonomous system, then fund, stop, or rotate credentials without touching another agent." actions={<Button size="lg" onClick={() => setCreateOpen(true)}><Plus aria-hidden="true" />Create agent</Button>} />

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Registered" value={String(agents.length).padStart(2, "0")} detail="Isolated WeWire sub-customers" icon={Bot} />
        <Metric label="Authorized" value={String(active).padStart(2, "0")} detail={`${agents.length - active} account stopped`} icon={Zap} tone="primary" />
        <Metric label="Capital" value={`$${money.format(totalBalance)}`} detail="Across demo wallet currencies" icon={WalletCards} />
        <Metric label="Credentials" value={`${agents.filter((agent) => agent.key_prefix).length}/${agents.length}`} detail="Scoped keys currently issued" icon={KeyRound} />
      </div>

      <section className="mt-8" aria-labelledby="agent-registry-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="agent-registry-heading" className="text-lg font-semibold tracking-[-0.02em]">Account registry</h2><p className="mt-1 text-sm text-muted-foreground">One account, wallet, policy, and credential boundary per agent.</p></div>
          <div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-md bg-input pl-9" placeholder="Search agents or currency" aria-label="Search agents" /></div>
        </div>

        <div className="overflow-hidden rounded-lg bg-card surface-ring">
          <div className="hidden md:block">
            <Table>
              <TableHeader><TableRow className="border-border hover:bg-transparent"><TableHead className="h-11 pl-4 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Agent account</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Available</TableHead><TableHead className="w-[230px] font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Daily policy</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">State</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
              <TableBody>{visibleAgents.map((agent) => {
                const dailyMax = Number(agent.rules?.max_per_day ?? 0);
                const usage = dailyMax ? Math.min(100, Number(agent.spent_today) / dailyMax * 100) : 0;
                return <TableRow key={agent.id} className="border-border hover:bg-surface-hover/70"><TableCell className="py-3 pl-4"><AgentIdentity agent={agent} /></TableCell><TableCell><p className="font-heading text-sm font-semibold tabular-nums">{formatMoney(agent.balance, agent.base_currency)}</p><p className="mt-1 text-xs text-muted-foreground">{agent.base_currency} wallet</p></TableCell><TableCell><div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{formatMoney(agent.spent_today, agent.base_currency)} spent</span><span className="font-mono text-[10px] tabular-nums">{Math.round(usage)}%</span></div><Progress value={usage} className="mt-2 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" /></TableCell><TableCell><StatusBadge status={agent.status} /></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant={agent.status === "frozen" ? "outline" : "destructive"} size="icon" disabled={busyAgent === agent.id} aria-label={agent.status === "frozen" ? `Reactivate ${agent.name}` : `Freeze ${agent.name}`} onClick={() => toggleAgent(agent)}>{agent.status === "frozen" ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`More actions for ${agent.name}`}><MoreHorizontal aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52 rounded-md"><DropdownMenuLabel>{agent.name}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => setFundingAgent(agent)}><WalletCards aria-hidden="true" />Fund wallet</DropdownMenuItem><DropdownMenuItem asChild><Link href="/guardrails"><SlidersHorizontal aria-hidden="true" />Edit guardrails</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => rotateKey(agent)}><KeyRound aria-hidden="true" />Rotate API key</DropdownMenuItem><DropdownMenuItem onSelect={() => navigator.clipboard.writeText(agent.id)}><Copy aria-hidden="true" />Copy agent ID</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></TableCell></TableRow>;
              })}</TableBody>
            </Table>
          </div>
          <div className="divide-y divide-border md:hidden">{visibleAgents.map((agent) => <article key={agent.id} className="p-4"><div className="flex items-start justify-between gap-3"><AgentIdentity agent={agent} /><StatusBadge status={agent.status} /></div><div className="mt-5 grid grid-cols-2 gap-3"><div><p className="font-mono text-[10px] text-muted-foreground uppercase">Available</p><p className="mt-1 font-heading text-base font-semibold tabular-nums">{formatMoney(agent.balance, agent.base_currency)}</p></div><div><p className="font-mono text-[10px] text-muted-foreground uppercase">Daily cap</p><p className="mt-1 font-heading text-base font-semibold tabular-nums">{formatMoney(agent.rules?.max_per_day ?? "0", agent.base_currency)}</p></div></div><div className="mt-4 flex gap-2"><Button className="flex-1" variant="outline" onClick={() => setFundingAgent(agent)}><WalletCards aria-hidden="true" />Fund</Button><Button variant={agent.status === "frozen" ? "outline" : "destructive"} onClick={() => toggleAgent(agent)}>{agent.status === "frozen" ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}{agent.status === "frozen" ? "Reactivate" : "Freeze"}</Button></div></article>)}</div>
          {visibleAgents.length === 0 && <div className="grid min-h-48 place-items-center px-4 text-center"><div><Search className="mx-auto size-5 text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm font-medium">No matching agent</p><p className="mt-1 text-xs text-muted-foreground">Try an account name, ID, or base currency.</p></div></div>}
        </div>
      </section>

      <CreateAgentDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={created} />
      <FundAgentDialog agent={fundingAgent} onOpenChange={(open) => !open && setFundingAgent(null)} onFunded={funded} />
      <OneTimeKeyDialog value={issuedKey} onClose={() => setIssuedKey(null)} />
      <PageFooter />
    </>
  );
}

function PaymentRows({ payments, agents }: { payments: Payment[]; agents: Agent[] }) {
  const names = agentNameMap(agents);
  return (
    <div className="overflow-hidden rounded-lg bg-card surface-ring">
      <div className="hidden md:block"><Table><TableHeader><TableRow className="border-border hover:bg-transparent"><TableHead className="h-11 pl-4 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Time / agent</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Purpose</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Rail evidence</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Outcome</TableHead><TableHead className="pr-4 text-right font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Amount</TableHead></TableRow></TableHeader><TableBody>{payments.map((payment) => <TableRow key={payment.id} className="border-border hover:bg-surface-hover/70"><TableCell className="py-3 pl-4"><p className="font-mono text-[11px] font-medium tabular-nums">{new Date(payment.created_at ?? "").toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p><p className="mt-1 max-w-36 truncate text-xs text-muted-foreground">{names[payment.agent_id] ?? payment.agent_id}</p></TableCell><TableCell><p className="max-w-72 truncate text-sm">{payment.memo ?? "Unlabeled payment"}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{payment.kind.replaceAll("_", " ")}</p></TableCell><TableCell><p className="max-w-52 truncate font-mono text-[10px] text-muted-foreground">{payment.wewire_transaction_id ?? "stopped pre-rail"}</p>{payment.rule_violated && <p className="mt-1 font-mono text-[10px] text-destructive">{payment.rule_violated}</p>}</TableCell><TableCell><StatusBadge status={payment.status} /></TableCell><TableCell className="pr-4 text-right"><p className="font-heading text-sm font-semibold tabular-nums">{formatMoney(payment.amount, payment.currency)}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{payment.currency}</p></TableCell></TableRow>)}</TableBody></Table></div>
      <div className="divide-y divide-border md:hidden">{payments.map((payment) => <article key={payment.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{payment.memo ?? "Unlabeled payment"}</p><p className="mt-1 text-xs text-muted-foreground">{names[payment.agent_id] ?? payment.agent_id}</p></div><StatusBadge status={payment.status} /></div><div className="mt-4 flex items-end justify-between gap-3"><div><p className="font-mono text-[10px] text-muted-foreground">{payment.wewire_transaction_id ?? "stopped pre-rail"}</p>{payment.rule_violated && <p className="mt-1 font-mono text-[10px] text-destructive">{payment.rule_violated}</p>}</div><p className="font-heading font-semibold tabular-nums">{formatMoney(payment.amount, payment.currency)}</p></div></article>)}</div>
      {payments.length === 0 && <div className="grid min-h-48 place-items-center px-4 text-center"><div><Activity className="mx-auto size-5 text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm font-medium">No activity in this state</p><p className="mt-1 text-xs text-muted-foreground">New payment attempts will appear here.</p></div></div>}
    </div>
  );
}

export function ActivityPage() {
  const [agents, setAgents] = React.useState(demoAgents);
  const [payments, setPayments] = React.useState(demoPayments);
  const [status, setStatus] = React.useState("all");
  const [agentId, setAgentId] = React.useState("all");
  const [refreshing, setRefreshing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const client = React.useMemo(() => createBrowserOwnerClient(), []);

  const refresh = React.useCallback(async () => {
    if (!apiConfigured) return;
    setRefreshing(true);
    try {
      const [agentData, activity] = await Promise.all([client.listAgents(), agentId === "all" ? client.activity({ status: status === "all" ? undefined : status, limit: 50 }) : client.agentTransactions(agentId, { status: status === "all" ? undefined : status, limit: 50 })]);
      setAgents(agentData); setPayments(activity.items);
    } catch {
      setNotice("The live ledger is unavailable; retained the last complete local snapshot.");
    } finally { setRefreshing(false); }
  }, [agentId, client, status]);

  React.useEffect(() => {
    if (!apiConfigured) return;
    let ignore = false;
    Promise.all([
      client.listAgents(),
      agentId === "all"
        ? client.activity({ status: status === "all" ? undefined : status, limit: 50 })
        : client.agentTransactions(agentId, { status: status === "all" ? undefined : status, limit: 50 }),
    ]).then(([agentData, activity]) => {
      if (ignore) return;
      setAgents(agentData);
      setPayments(activity.items);
    }).catch(() => {
      if (!ignore) setNotice("The live ledger is unavailable; retained the last complete local snapshot.");
    });
    return () => { ignore = true; };
  }, [agentId, client, status]);
  const visible = payments.filter((payment) => (status === "all" || payment.status === status) && (agentId === "all" || payment.agent_id === agentId));
  const blocked = payments.filter((payment) => payment.status === "blocked").length;
  const executed = payments.filter((payment) => payment.status === "executed").length;

  return (
    <>
      <Notice message={notice} onDismiss={() => setNotice(null)} />
      <PageHeader eyebrow="Immutable ledger" title="Activity" description="Review every payment attempt across the network—from local policy decision to final WeWire transaction evidence." actions={<Button variant="outline" size="lg" onClick={refresh} disabled={refreshing}><RefreshCw className={cn(refreshing && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh ledger</Button>} />
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Attempts" value={String(payments.length).padStart(2, "0")} detail="Current ledger window" icon={Activity} /><Metric label="Executed" value={String(executed).padStart(2, "0")} detail="Settled on external rails" icon={CheckCircle2} tone="primary" /><Metric label="Pre-rail blocks" value={String(blocked).padStart(2, "0")} detail="Stopped before money moved" icon={ShieldCheck} tone="danger" /></div>
      <section className="mt-8" aria-labelledby="activity-ledger-heading">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><h2 id="activity-ledger-heading" className="text-lg font-semibold tracking-[-0.02em]">Audit ledger</h2><span className="flex items-center gap-1.5 font-mono text-[10px] text-primary-ink"><span className="size-1.5 rounded-full bg-primary" />LIVE</span></div><p className="mt-1 text-sm text-muted-foreground">Approved, executed, blocked, and failed outcomes share one timeline.</p></div><div className="grid gap-2 sm:grid-cols-2"><Select value={agentId} onValueChange={setAgentId}><SelectTrigger className="h-10 w-full rounded-md bg-input sm:w-56" aria-label="Filter by agent"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All agents</SelectItem>{agents.map((agent) => <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-10 w-full rounded-md bg-input sm:w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent>{["all", "approved", "executed", "blocked", "failed"].map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div></div>
        <PaymentRows payments={visible} agents={agents} />
        <div className="mt-4 flex items-center justify-between gap-4"><p className="text-xs text-muted-foreground">Showing {visible.length} of {payments.length} attempts</p><Button variant="outline" disabled={!apiConfigured}>Load earlier activity<ArrowRight aria-hidden="true" /></Button></div>
      </section>
      <PageFooter />
    </>
  );
}

function PolicyEditor({ agent, agents, onClose, onSaved }: { agent: Agent | null; agents: Agent[]; onClose: () => void; onSaved: (agentId: string, rules: RulesInput) => void }) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const client = React.useMemo(() => createBrowserOwnerClient(), []);
  function close() { setError(null); onClose(); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!agent) return; setSaving(true); setError(null);
    const form = new FormData(event.currentTarget);
    const rules: RulesInput = { max_per_transaction: String(form.get("transaction")), max_per_day: String(form.get("daily")), allowed_counterparty_ids: form.getAll("counterparties").map(String) };
    try { if (apiConfigured) await client.setRules(agent.id, rules); onSaved(agent.id, rules); close(); } catch (reason) { setError(reason instanceof Error ? reason.message : "The policy could not be saved."); } finally { setSaving(false); }
  }
  return (
    <Dialog open={Boolean(agent)} onOpenChange={(open) => !open && close()}><DialogContent className="rounded-lg sm:max-w-[560px]"><form onSubmit={submit}><DialogHeader><DialogTitle className="font-heading text-lg">Edit {agent?.name} policy</DialogTitle><DialogDescription>These checks run locally before the payment orchestrator can call WeWire.</DialogDescription></DialogHeader><div className="grid gap-4 py-5"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="policy-transaction">Max per transaction</Label><Input id="policy-transaction" name="transaction" type="number" min="0.01" step="0.01" defaultValue={agent?.rules?.max_per_transaction} className="h-10 rounded-md bg-input tabular-nums" required /></div><div className="grid gap-2"><Label htmlFor="policy-daily">Max per UTC day</Label><Input id="policy-daily" name="daily" type="number" min="0.01" step="0.01" defaultValue={agent?.rules?.max_per_day} className="h-10 rounded-md bg-input tabular-nums" required /></div></div><fieldset className="rounded-md bg-inset p-4 surface-ring"><legend className="px-1 text-sm font-medium">Allowed agent counterparties</legend><p className="mt-1 text-xs text-muted-foreground">Leave all unchecked to allow any counterparty.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{agents.filter((item) => item.id !== agent?.id).map((item) => <label key={item.id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md bg-background px-3 text-sm surface-ring"><input type="checkbox" name="counterparties" value={item.id} defaultChecked={agent?.rules?.allowed_counterparty_ids?.includes(item.id)} className="size-4 accent-primary-ink" /><span className="truncate">{item.name}</span></label>)}</div></fieldset></div>{error && <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving policy" : "Save hard limits"}</Button></DialogFooter></form></DialogContent></Dialog>
  );
}

export function GuardrailsPage() {
  const [agents, setAgents] = React.useState(demoAgents);
  const [selected, setSelected] = React.useState<Agent | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const client = React.useMemo(() => createBrowserOwnerClient(), []);
  React.useEffect(() => { if (apiConfigured) client.listAgents().then(setAgents).catch(() => setNotice("Policy API unavailable; showing the last complete local policy snapshot.")); }, [client]);
  const protectedCount = agents.filter((agent) => agent.rules).length;
  const restricted = agents.filter((agent) => agent.rules?.allowed_counterparty_ids?.length).length;
  function saved(agentId: string, rules: RulesInput) { setAgents((items) => items.map((agent) => agent.id === agentId ? { ...agent, rules: { max_per_transaction: String(rules.max_per_transaction), max_per_day: String(rules.max_per_day), allowed_counterparty_ids: rules.allowed_counterparty_ids ?? null } } : agent)); setNotice("The updated policy is now the local authorization boundary for every payment attempt."); }
  return (
    <>
      <Notice message={notice} onDismiss={() => setNotice(null)} />
      <PageHeader eyebrow="Pre-rail policy engine" title="Guardrails" description="Set hard limits that are evaluated before money movement. A blocked request is recorded, but never reaches WeWire." actions={<Button variant="outline" size="lg" asChild><Link href="/activity?status=blocked"><ShieldCheck aria-hidden="true" />Review blocks</Link></Button>} />
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Policy coverage" value={`${protectedCount}/${agents.length}`} detail="Agents with hard limits" icon={ShieldCheck} tone="primary" /><Metric label="Allowlists" value={String(restricted).padStart(2, "0")} detail="Restricted counterparty sets" icon={LockKeyhole} /><Metric label="Blocks today" value="03" detail="No rail call was made" icon={AlertTriangle} tone="danger" /></div>

      <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" aria-labelledby="policy-envelope-heading">
        <div><div className="mb-4"><h2 id="policy-envelope-heading" className="text-lg font-semibold tracking-[-0.02em]">Policy envelopes</h2><p className="mt-1 text-sm text-muted-foreground">Each agent carries its own transaction cap, daily cap, and optional counterparty list.</p></div><div className="grid gap-3 lg:grid-cols-2">{agents.map((agent) => { const daily = Number(agent.rules?.max_per_day ?? 0); const usage = daily ? Math.min(100, Number(agent.spent_today) / daily * 100) : 0; return <article key={agent.id} className="rounded-lg bg-card p-5 surface-ring"><div className="flex items-start justify-between gap-3"><AgentIdentity agent={agent} /><StatusBadge status={agent.status} /></div><div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border surface-ring"><div className="bg-inset p-3"><p className="font-mono text-[10px] text-muted-foreground uppercase">Single payment</p><p className="mt-2 font-heading font-semibold tabular-nums">{formatMoney(agent.rules?.max_per_transaction ?? "0", agent.base_currency)}</p></div><div className="bg-inset p-3"><p className="font-mono text-[10px] text-muted-foreground uppercase">UTC day</p><p className="mt-2 font-heading font-semibold tabular-nums">{formatMoney(agent.rules?.max_per_day ?? "0", agent.base_currency)}</p></div></div><div className="mt-5"><div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Daily utilization</span><span className="font-mono tabular-nums">{Math.round(usage)}%</span></div><Progress value={usage} className="mt-2 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" /></div><div className="mt-4 flex items-center justify-between gap-3"><p className="truncate text-xs text-muted-foreground">{agent.rules?.allowed_counterparty_ids?.length ? `${agent.rules.allowed_counterparty_ids.length} approved counterparties` : "Open counterparty set"}</p><Button variant="outline" size="sm" onClick={() => setSelected(agent)}><SlidersHorizontal aria-hidden="true" />Edit</Button></div></article>; })}</div></div>
        <aside className="rounded-lg bg-inset p-5 surface-ring xl:sticky xl:top-24 xl:self-start"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Authorization path</p><h2 className="mt-2 font-medium">Before money moves</h2></div><Badge variant="outline" className="border-primary/45 bg-primary/15 text-primary-ink"><span className="size-1.5 rounded-full bg-primary" />4ms</Badge></div><ol className="mt-6 space-y-0">{[{ label: "Agent authenticated", detail: "Scoped X-Agent-Key", icon: KeyRound }, { label: "Policy evaluated", detail: "Amount + daily usage + allowlist", icon: ShieldCheck }, { label: "Decision recorded", detail: "Approved or blocked in audit ledger", icon: Clipboard }, { label: "WeWire called", detail: "Only after local approval", icon: Zap }].map((step, index, items) => <li key={step.label} className="relative flex min-h-20 gap-3">{index < items.length - 1 && <span className="absolute top-8 bottom-0 left-[15px] w-px bg-primary/35" aria-hidden="true" />}<span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-sm border border-primary/45 bg-accent text-primary-ink"><step.icon className="size-4" strokeWidth={2} aria-hidden="true" /></span><div className="pt-1"><p className="text-sm font-medium">{step.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p></div></li>)}</ol><div className="mt-1 rounded-md border border-destructive/20 bg-destructive/8 p-3"><p className="text-xs font-medium text-destructive">Blocked means no rail exposure</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The rejection is still auditable with the exact rule violated.</p></div></aside>
      </section>
      <PolicyEditor agent={selected} agents={agents} onClose={() => setSelected(null)} onSaved={saved} />
      <PageFooter />
    </>
  );
}

export function SettingsPage() {
  const [checking, setChecking] = React.useState(false);
  const [apiHealth, setApiHealth] = React.useState<"idle" | "healthy" | "offline">("idle");
  const [railHealth, setRailHealth] = React.useState<"idle" | "healthy" | "offline">("idle");
  const client = React.useMemo(() => createBrowserOwnerClient(), []);
  async function checkHealth() {
    setChecking(true);
    if (!apiConfigured) { setApiHealth("healthy"); setRailHealth("healthy"); setChecking(false); return; }
    const [api, rail] = await Promise.allSettled([client.health(), client.healthWeWire()]);
    setApiHealth(api.status === "fulfilled" ? "healthy" : "offline"); setRailHealth(rail.status === "fulfilled" ? "healthy" : "offline"); setChecking(false);
  }
  return (
    <>
      <PageHeader eyebrow="Workspace control" title="Settings" description="Verify owner authentication, backend reachability, and the WeWire sandbox before running an autonomous payment demo." actions={<Button size="lg" onClick={checkHealth} disabled={checking}><RefreshCw className={cn(checking && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Run preflight</Button>} />
      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="rounded-lg bg-card surface-ring" aria-labelledby="workspace-settings-heading"><div className="border-b border-border p-5"><h2 id="workspace-settings-heading" className="text-lg font-semibold tracking-[-0.02em]">Workspace</h2><p className="mt-1 text-sm text-muted-foreground">Owner-facing identity and environment defaults.</p></div><dl className="divide-y divide-border"><div className="grid gap-2 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">Workspace name</dt><dd className="text-sm font-medium">Acme agent network</dd></div><div className="grid gap-2 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">Environment</dt><dd><Badge variant="secondary">sandbox</Badge></dd></div><div className="grid gap-2 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">Owner authentication</dt><dd className="flex flex-wrap items-center gap-2"><StatusBadge status={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "active" : "offline"} /><span className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Clerk session tokens protect owner routes" : "Demo mode; add Clerk keys to enable protected routes"}</span></dd></div></dl></section>
          <section className="rounded-lg bg-card surface-ring" aria-labelledby="developer-settings-heading"><div className="border-b border-border p-5"><h2 id="developer-settings-heading" className="text-lg font-semibold tracking-[-0.02em]">Developer contract</h2><p className="mt-1 text-sm text-muted-foreground">The two authentication surfaces are intentionally separate.</p></div><div className="grid gap-px bg-border md:grid-cols-2"><div className="bg-card p-5"><span className="grid size-9 place-items-center rounded-md bg-secondary text-muted-foreground"><LockKeyhole className="size-4" aria-hidden="true" /></span><h3 className="mt-4 font-medium">Owner API</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Clerk bearer token for provisioning, funding, policy changes, freeze, and audit access.</p><code className="mt-4 block rounded-md bg-inset px-3 py-2 font-mono text-[11px]">Authorization: Bearer &lt;session&gt;</code></div><div className="bg-card p-5"><span className="grid size-9 place-items-center rounded-md bg-primary/25 text-primary-ink"><KeyRound className="size-4" aria-hidden="true" /></span><h3 className="mt-4 font-medium">Agent API</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Scoped one-time credential for self-inspection, quotes, and autonomous payments.</p><code className="mt-4 block rounded-md bg-inset px-3 py-2 font-mono text-[11px]">X-Agent-Key: krx_••••</code></div></div></section>
        </div>
        <aside className="space-y-5"><section className="rounded-lg bg-card p-5 surface-ring" aria-labelledby="preflight-heading"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Demo readiness</p><h2 id="preflight-heading" className="mt-2 font-medium">Preflight checks</h2></div><ServerCog className="size-5 text-muted-foreground" aria-hidden="true" /></div><div className="mt-5 space-y-3">{[{ label: "Kērux backend", detail: apiConfigured ? process.env.NEXT_PUBLIC_API_URL ?? "Configured" : "Local demo adapter", status: apiHealth }, { label: "WeWire round-trip", detail: "Sandbox money movement rail", status: railHealth }, { label: "Policy engine", detail: "Local-first authorization", status: "healthy" as const }].map((item) => <div key={item.label} className="flex items-start gap-3 rounded-md bg-inset p-3 surface-ring"><span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm", item.status === "offline" ? "bg-destructive/10 text-destructive" : item.status === "healthy" ? "bg-primary/25 text-primary-ink" : "bg-secondary text-muted-foreground")}>{item.status === "offline" ? <Unplug className="size-3.5" aria-hidden="true" /> : item.status === "healthy" ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <Radio className="size-3.5" aria-hidden="true" />}</span><div><p className="text-sm font-medium">{item.label}</p><p className="mt-1 break-all text-xs leading-5 text-muted-foreground">{item.detail}</p></div></div>)}</div></section><section className="rounded-lg bg-inset p-5 surface-ring"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary-ink" aria-hidden="true" /><h2 className="font-medium">Demo sequence</h2></div><ol className="mt-4 space-y-3 text-sm text-muted-foreground"><li className="flex gap-3"><span className="font-mono text-primary-ink">01</span>Create and fund two agents</li><li className="flex gap-3"><span className="font-mono text-primary-ink">02</span>Execute one autonomous payment</li><li className="flex gap-3"><span className="font-mono text-primary-ink">03</span>Trigger a pre-rail policy block</li><li className="flex gap-3"><span className="font-mono text-primary-ink">04</span>Freeze the offending agent</li></ol><Button className="mt-5 w-full" variant="outline" asChild><Link href="/agents">Open agent registry<ExternalLink aria-hidden="true" /></Link></Button></section></aside>
      </div>
      <PageFooter />
    </>
  );
}
