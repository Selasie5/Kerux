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
import { currencies, type Agent, type Currency, type Payment, type RulesInput } from "@/lib/api/types";
import { apiKeyPrefix, formatMoney, formatTimestamp, isStatus, normalizeStatus, ratioPercent, sumMoney } from "@/lib/api/format";
import { useOwnerApi } from "@/lib/api/provider";
import { useOwnerEvents } from "@/lib/api/use-owner-events";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function agentNameMap(agents: Agent[]) {
  return Object.fromEntries(agents.map((agent) => [agent.id, agent.name]));
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
  const normalized = normalizeStatus(status);
  if (["active", "approved", "executed", "healthy"].includes(normalized)) {
    return <Badge variant="outline" className="border-primary/45 bg-primary/15 text-primary-ink"><Check aria-hidden="true" />{normalized}</Badge>;
  }
  if (["frozen", "blocked", "failed", "offline"].includes(normalized)) {
    return <Badge variant="outline" className="border-destructive/25 bg-destructive/8 text-destructive"><X aria-hidden="true" />{normalized}</Badge>;
  }
  if (normalized === "submitted") {
    return <Badge variant="secondary"><RefreshCw className="animate-spin motion-reduce:animate-none" aria-hidden="true" />pending</Badge>;
  }
  return <Badge variant="secondary">{normalized}</Badge>;
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
  const [currency, setCurrency] = React.useState<Currency>("GHST");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { client } = useOwnerApi();
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
      const created = await client.createAgent(input);
      onCreated(created.agent, created.api_key);
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
              <div className="grid gap-2"><Label htmlFor="new-agent-funding">Initial funding</Label><Input id="new-agent-funding" name="funding" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-input tabular-nums" defaultValue="50.00" /></div>
            </div>
            <div className="rounded-md bg-inset p-4 surface-ring">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="size-4 text-primary-ink" aria-hidden="true" />Hard spending limits</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="new-agent-transaction">Per transaction</Label><Input id="new-agent-transaction" name="transaction" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-background tabular-nums" defaultValue="5.00" required /></div>
                <div className="grid gap-2"><Label htmlFor="new-agent-daily">Per UTC day</Label><Input id="new-agent-daily" name="daily" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-background tabular-nums" defaultValue="10.00" required /></div>
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
  const { client } = useOwnerApi();
  function changeOpen(nextOpen: boolean) { if (!nextOpen) setError(null); onOpenChange(nextOpen); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agent) return;
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const amount = String(form.get("amount"));
    try {
      const result = await client.fundAgent(agent.id, { amount, currency: agent.base_currency as Currency });
      onFunded(agent.id, Number(amount), result.balance);
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
          <div className="grid gap-2 py-5"><Label htmlFor="fund-amount">Amount in {agent?.base_currency}</Label><Input id="fund-amount" name="amount" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-input tabular-nums" defaultValue="25.00" required /><p className="text-xs text-muted-foreground">Current balance: {agent ? formatMoney(agent.balance, agent.base_currency) : "—"}</p></div>
          {error && <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => changeOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Sweeping funds" : "Fund wallet"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AgentsPage() {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [notice, setNotice] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [fundingAgent, setFundingAgent] = React.useState<Agent | null>(null);
  const [issuedKey, setIssuedKey] = React.useState<string | null>(null);
  const [busyAgent, setBusyAgent] = React.useState<string | null>(null);
  const { client, authReady } = useOwnerApi();

  React.useEffect(() => {
    if (!authReady) return;
    client.listAgents()
      .then(setAgents)
      .catch((reason) => setNotice(reason instanceof Error ? reason.message : "The agent registry is unavailable."))
      .finally(() => setLoading(false));
  }, [authReady, client]);

  const visibleAgents = agents.filter((agent) => `${agent.name} ${agent.id} ${agent.base_currency}`.toLowerCase().includes(search.toLowerCase()));
  const commonCurrency = agents.length && agents.every((agent) => agent.base_currency === agents[0].base_currency) ? agents[0].base_currency : null;
  const totalBalance = sumMoney(agents.map((agent) => agent.balance));
  const active = agents.filter((agent) => isStatus(agent.status, "active")).length;

  async function toggleAgent(agent: Agent) {
    const frozen = isStatus(agent.status, "frozen");
    if (!frozen && !window.confirm(`Freeze ${agent.name} immediately? Its existing agent keys will be revoked.`)) return;
    setBusyAgent(agent.id);
    try {
      const result = frozen ? await client.unfreezeAgent(agent.id) : await client.freezeAgent(agent.id);
      setAgents((items) => items.map((item) => item.id === agent.id ? { ...item, status: result.status, key_prefix: result.api_key ? apiKeyPrefix(result.api_key) : isStatus(result.status, "frozen") ? null : item.key_prefix } : item));
      if (result.api_key) setIssuedKey(result.api_key);
      setNotice(`${agent.name} ${frozen ? "is active with a fresh key; revoked keys remain revoked" : "was stopped before another payment could reach WeWire"}.`);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "The agent state could not be changed.");
    } finally {
      setBusyAgent(null);
    }
  }

  async function rotateKey(agent: Agent) {
    setBusyAgent(agent.id);
    try {
      const key = (await client.rotateKey(agent.id)).api_key;
      setIssuedKey(key);
      setAgents((items) => items.map((item) => item.id === agent.id ? { ...item, key_prefix: apiKeyPrefix(key) } : item));
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
    setNotice(`Wallet funded with ${money.format(amount)} through the WeWire sweep.`);
  }

  return (
    <>
      <Notice message={notice} onDismiss={() => setNotice(null)} />
      <PageHeader eyebrow="Wallet registry" title="Agent accounts" description="Provision an identity and wallet for every autonomous system, then fund, stop, or rotate credentials without touching another agent." actions={<Button size="lg" onClick={() => setCreateOpen(true)}><Plus aria-hidden="true" />Create agent</Button>} />

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Registered" value={String(agents.length).padStart(2, "0")} detail="Isolated WeWire sub-customers" icon={Bot} />
        <Metric label="Authorized" value={String(active).padStart(2, "0")} detail={`${agents.length - active} account stopped`} icon={Zap} tone="primary" />
        <Metric label="Capital" value={commonCurrency ? formatMoney(totalBalance, commonCurrency) : "Mixed currencies"} detail="Across isolated wallets" icon={WalletCards} />
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
                const usage = ratioPercent(agent.spent_today, agent.rules?.max_per_day ?? "0");
                const frozen = isStatus(agent.status, "frozen");
                return <TableRow key={agent.id} className="border-border hover:bg-surface-hover/70"><TableCell className="py-3 pl-4"><Link href={`/agents/${agent.id}`} className="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><AgentIdentity agent={agent} /></Link></TableCell><TableCell><p className="font-heading text-sm font-semibold tabular-nums">{formatMoney(agent.balance, agent.base_currency)}</p><p className="mt-1 text-xs text-muted-foreground">{agent.base_currency} wallet</p></TableCell><TableCell><div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{formatMoney(agent.spent_today, agent.base_currency)} spent</span><span className="font-mono text-[10px] tabular-nums">{Math.round(usage)}%</span></div><Progress value={usage} className="mt-2 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" /></TableCell><TableCell><StatusBadge status={agent.status} /></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant={frozen ? "outline" : "destructive"} size="icon" disabled={busyAgent === agent.id} aria-label={frozen ? `Reactivate ${agent.name}` : `Freeze ${agent.name}`} onClick={() => toggleAgent(agent)}>{frozen ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`More actions for ${agent.name}`}><MoreHorizontal aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52 rounded-md"><DropdownMenuLabel>{agent.name}</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href={`/agents/${agent.id}`}><ExternalLink aria-hidden="true" />Open agent</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => setFundingAgent(agent)}><WalletCards aria-hidden="true" />Fund wallet</DropdownMenuItem><DropdownMenuItem asChild><Link href="/guardrails"><SlidersHorizontal aria-hidden="true" />Edit guardrails</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => rotateKey(agent)}><KeyRound aria-hidden="true" />Rotate API key</DropdownMenuItem><DropdownMenuItem onSelect={() => navigator.clipboard.writeText(agent.id)}><Copy aria-hidden="true" />Copy agent ID</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></TableCell></TableRow>;
              })}</TableBody>
            </Table>
          </div>
          <div className="divide-y divide-border md:hidden">{visibleAgents.map((agent) => { const frozen = isStatus(agent.status, "frozen"); return <article key={agent.id} className="p-4"><div className="flex items-start justify-between gap-3"><Link href={`/agents/${agent.id}`}><AgentIdentity agent={agent} /></Link><StatusBadge status={agent.status} /></div><div className="mt-5 grid grid-cols-2 gap-3"><div><p className="font-mono text-[10px] text-muted-foreground uppercase">Available</p><p className="mt-1 font-heading text-base font-semibold tabular-nums">{formatMoney(agent.balance, agent.base_currency)}</p></div><div><p className="font-mono text-[10px] text-muted-foreground uppercase">Daily cap</p><p className="mt-1 font-heading text-base font-semibold tabular-nums">{formatMoney(agent.rules?.max_per_day ?? "0", agent.base_currency)}</p></div></div><div className="mt-4 flex gap-2"><Button className="flex-1" variant="outline" onClick={() => setFundingAgent(agent)}><WalletCards aria-hidden="true" />Fund</Button><Button variant={frozen ? "outline" : "destructive"} onClick={() => toggleAgent(agent)}>{frozen ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}{frozen ? "Reactivate" : "Freeze"}</Button></div></article>; })}</div>
          {visibleAgents.length === 0 && <div className="grid min-h-48 place-items-center px-4 text-center"><div>{loading ? <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" /> : <Search className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />}<p className="mt-3 text-sm font-medium">{loading ? "Loading agent accounts" : agents.length ? "No matching agent" : "No agents yet"}</p><p className="mt-1 text-xs text-muted-foreground">{loading ? "Reading balances and policy limits from Kērux." : agents.length ? "Try an account name, ID, or base currency." : "Create an agent to issue its first one-time key."}</p></div></div>}
        </div>
      </section>

      <CreateAgentDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={created} />
      <FundAgentDialog agent={fundingAgent} onOpenChange={(open) => !open && setFundingAgent(null)} onFunded={funded} />
      <OneTimeKeyDialog key={issuedKey ?? "closed"} value={issuedKey} onClose={() => setIssuedKey(null)} />
      <PageFooter />
    </>
  );
}

function PaymentRows({ payments, agents }: { payments: Payment[]; agents: Agent[] }) {
  const names = agentNameMap(agents);
  return (
    <div className="overflow-hidden rounded-lg bg-card surface-ring">
      <div className="hidden md:block"><Table><TableHeader><TableRow className="border-border hover:bg-transparent"><TableHead className="h-11 pl-4 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Time / agent</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Purpose</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Decision evidence</TableHead><TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Outcome</TableHead><TableHead className="pr-4 text-right font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Amount</TableHead></TableRow></TableHeader><TableBody>{payments.map((payment) => { const blocked = isStatus(payment.status, "blocked"); return <TableRow key={payment.id} className={cn("border-border hover:bg-surface-hover/70", blocked && "bg-destructive/5 hover:bg-destructive/8")}><TableCell className="py-3 pl-4"><p className="font-mono text-[11px] font-medium tabular-nums">{formatTimestamp(payment.created_at, { hour: "numeric", minute: "2-digit", second: "2-digit" })}</p><p className="mt-1 max-w-36 truncate text-xs text-muted-foreground">{names[payment.agent_id] ?? payment.agent_id}</p></TableCell><TableCell><p className="max-w-72 truncate text-sm">{payment.memo ?? "Unlabeled payment"}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{payment.kind.replaceAll("_", " ").toLowerCase()}</p></TableCell><TableCell><p className={cn("max-w-72 text-xs", blocked ? "font-medium text-destructive" : "font-mono text-[10px] text-muted-foreground")}>{blocked ? payment.failure_reason ?? payment.rule_violated ?? "Blocked by policy" : payment.wewire_transaction_id ?? "Awaiting rail evidence"}</p>{blocked && payment.rule_violated && <p className="mt-1 font-mono text-[10px] text-destructive/75">{payment.rule_violated}</p>}</TableCell><TableCell><StatusBadge status={payment.status} /></TableCell><TableCell className="pr-4 text-right"><p className={cn("font-heading text-sm font-semibold tabular-nums", blocked && "text-destructive")}>{formatMoney(payment.amount, payment.currency)}</p></TableCell></TableRow>; })}</TableBody></Table></div>
      <div className="divide-y divide-border md:hidden">{payments.map((payment) => { const blocked = isStatus(payment.status, "blocked"); return <article key={payment.id} className={cn("p-4", blocked && "bg-destructive/5")}><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{payment.memo ?? "Unlabeled payment"}</p><p className="mt-1 text-xs text-muted-foreground">{names[payment.agent_id] ?? payment.agent_id} · {formatTimestamp(payment.created_at, { hour: "numeric", minute: "2-digit" })}</p></div><StatusBadge status={payment.status} /></div><div className="mt-4 flex items-end justify-between gap-3"><div><p className={cn("text-xs", blocked ? "font-medium text-destructive" : "font-mono text-[10px] text-muted-foreground")}>{blocked ? payment.failure_reason ?? payment.rule_violated ?? "Blocked by policy" : payment.wewire_transaction_id ?? "Awaiting rail evidence"}</p>{blocked && payment.rule_violated && <p className="mt-1 font-mono text-[10px] text-destructive/75">{payment.rule_violated}</p>}</div><p className={cn("font-heading font-semibold tabular-nums", blocked && "text-destructive")}>{formatMoney(payment.amount, payment.currency)}</p></div></article>; })}</div>
      {payments.length === 0 && <div className="grid min-h-48 place-items-center px-4 text-center"><div><Activity className="mx-auto size-5 text-muted-foreground" aria-hidden="true" /><p className="mt-3 text-sm font-medium">No activity in this state</p><p className="mt-1 text-xs text-muted-foreground">New payment attempts will appear here.</p></div></div>}
    </div>
  );
}

export function ActivityPage({ initialStatus = "all", initialAgentId = "all" }: { initialStatus?: string; initialAgentId?: string }) {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState(initialStatus);
  const [agentId, setAgentId] = React.useState(initialAgentId);
  const [refreshing, setRefreshing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const { client, authReady } = useOwnerApi();

  const refresh = React.useCallback(async () => {
    if (!authReady) return;
    setRefreshing(true);
    try {
      const query = { status: status === "all" ? undefined : status.toUpperCase(), limit: 50 };
      const [agentData, activity] = await Promise.all([client.listAgents(), agentId === "all" ? client.activity(query) : client.agentTransactions(agentId, query)]);
      setAgents(agentData); setPayments(activity.items); setNextCursor(activity.next_cursor);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "The live ledger is unavailable.");
    } finally { setRefreshing(false); }
  }, [agentId, authReady, client, status]);

  React.useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const connected = useOwnerEvents(
    (event) => {
      if (event.type === "payment" && "id" in event.data) {
        const payment = event.data as unknown as Payment;
        setPayments((items) => [payment, ...items.filter((item) => item.id !== payment.id)]);
      }
      void refresh();
    },
    () => void refresh(),
  );

  async function loadEarlier() {
    if (!nextCursor) return;
    const query = { status: status === "all" ? undefined : status.toUpperCase(), limit: 50, before: nextCursor };
    try {
      const activity = agentId === "all" ? await client.activity(query) : await client.agentTransactions(agentId, query);
      setPayments((items) => [...items, ...activity.items.filter((item) => !items.some((existing) => existing.id === item.id))]);
      setNextCursor(activity.next_cursor);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Earlier activity could not be loaded.");
    }
  }

  const visible = payments.filter((payment) => (status === "all" || isStatus(payment.status, status)) && (agentId === "all" || payment.agent_id === agentId));
  const blocked = payments.filter((payment) => isStatus(payment.status, "blocked")).length;
  const executed = payments.filter((payment) => isStatus(payment.status, "executed")).length;

  return (
    <>
      <Notice message={notice} onDismiss={() => setNotice(null)} />
      <PageHeader eyebrow="Immutable ledger" title="Activity" description="Review every payment attempt across the network—from local policy decision to final WeWire transaction evidence." actions={<Button variant="outline" size="lg" onClick={refresh} disabled={refreshing}><RefreshCw className={cn(refreshing && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Refresh ledger</Button>} />
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Attempts" value={String(payments.length).padStart(2, "0")} detail="Current ledger window" icon={Activity} /><Metric label="Executed" value={String(executed).padStart(2, "0")} detail="Settled on external rails" icon={CheckCircle2} tone="primary" /><Metric label="Pre-rail blocks" value={String(blocked).padStart(2, "0")} detail="Stopped before money moved" icon={ShieldCheck} tone="danger" /></div>
      <section className="mt-8" aria-labelledby="activity-ledger-heading">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><h2 id="activity-ledger-heading" className="text-lg font-semibold tracking-[-0.02em]">Audit ledger</h2><span className={cn("flex items-center gap-1.5 font-mono text-[10px]", connected ? "text-primary-ink" : "text-muted-foreground")}><span className={cn("size-1.5 rounded-full", connected ? "bg-primary" : "bg-muted-foreground")} />{connected ? "LIVE" : "RECONNECTING"}</span></div><p className="mt-1 text-sm text-muted-foreground">Approved, pending, executed, blocked, and failed outcomes share one timeline.</p></div><div className="grid gap-2 sm:grid-cols-2"><Select value={agentId} onValueChange={setAgentId}><SelectTrigger className="h-10 w-full rounded-md bg-input sm:w-56" aria-label="Filter by agent"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All agents</SelectItem>{agents.map((agent) => <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-10 w-full rounded-md bg-input sm:w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent>{["all", "approved", "submitted", "executed", "blocked", "failed"].map((item) => <SelectItem key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</SelectItem>)}</SelectContent></Select></div></div>
        <PaymentRows payments={visible} agents={agents} />
        <div className="mt-4 flex items-center justify-between gap-4"><p className="text-xs text-muted-foreground">Showing {visible.length} payment attempts</p><Button variant="outline" disabled={!nextCursor} onClick={loadEarlier}>Load earlier activity<ArrowRight aria-hidden="true" /></Button></div>
      </section>
      <PageFooter />
    </>
  );
}

function PolicyEditor({ agent, agents, onClose, onSaved }: { agent: Agent | null; agents: Agent[]; onClose: () => void; onSaved: (agentId: string, rules: RulesInput) => void }) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialAllowed = agent?.rules?.allowed_counterparty_ids;
  const [counterpartyMode, setCounterpartyMode] = React.useState<"any" | "restricted" | "none">(
    initialAllowed === null || initialAllowed === undefined ? "any" : initialAllowed.length ? "restricted" : "none",
  );
  const { client } = useOwnerApi();
  function close() { setError(null); onClose(); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!agent) return; setSaving(true); setError(null);
    const form = new FormData(event.currentTarget);
    const selectedIds = form.getAll("counterparties").map(String);
    if (counterpartyMode === "restricted" && selectedIds.length === 0) {
      setError("Select at least one approved counterparty, or choose a different access mode.");
      setSaving(false);
      return;
    }
    if (counterpartyMode === "none" && !window.confirm(`${agent.name} will be unable to pay any counterparty. Save this policy?`)) {
      setSaving(false);
      return;
    }
    const rules: RulesInput = {
      max_per_transaction: String(form.get("transaction")),
      max_per_day: String(form.get("daily")),
      allowed_counterparty_ids: counterpartyMode === "any" ? null : counterpartyMode === "none" ? [] : selectedIds,
    };
    try { await client.setRules(agent.id, rules); onSaved(agent.id, rules); close(); } catch (reason) { setError(reason instanceof Error ? reason.message : "The policy could not be saved."); } finally { setSaving(false); }
  }
  return (
    <Dialog open={Boolean(agent)} onOpenChange={(open) => !open && close()}><DialogContent className="rounded-lg sm:max-w-[560px]"><form onSubmit={submit}><DialogHeader><DialogTitle className="font-heading text-lg">Edit {agent?.name} policy</DialogTitle><DialogDescription>These checks run locally before the payment orchestrator can call WeWire.</DialogDescription></DialogHeader><div className="grid gap-4 py-5"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="policy-transaction">Max per transaction</Label><Input id="policy-transaction" name="transaction" type="number" min="0.01" step="0.01" defaultValue={agent?.rules?.max_per_transaction} className="h-10 rounded-md bg-input tabular-nums" required /></div><div className="grid gap-2"><Label htmlFor="policy-daily">Max per UTC day</Label><Input id="policy-daily" name="daily" type="number" min="0.01" step="0.01" defaultValue={agent?.rules?.max_per_day} className="h-10 rounded-md bg-input tabular-nums" required /></div></div><fieldset className="rounded-md bg-inset p-4 surface-ring"><legend className="px-1 text-sm font-medium">Counterparty access</legend><div className="mt-2"><Select value={counterpartyMode} onValueChange={(value) => setCounterpartyMode(value as typeof counterpartyMode)}><SelectTrigger className="h-10 w-full rounded-md bg-background" aria-label="Counterparty access mode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Any counterparty</SelectItem><SelectItem value="restricted">Approved agents only</SelectItem><SelectItem value="none">No counterparties</SelectItem></SelectContent></Select></div>{counterpartyMode === "restricted" && <div className="mt-4 grid gap-2 sm:grid-cols-2">{agents.filter((item) => item.id !== agent?.id).map((item) => <label key={item.id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md bg-background px-3 text-sm surface-ring"><input type="checkbox" name="counterparties" value={item.id} defaultChecked={agent?.rules?.allowed_counterparty_ids?.includes(item.id)} className="size-4 accent-primary-ink" /><span className="truncate">{item.name}</span></label>)}</div>}{counterpartyMode === "none" && <p className="mt-3 rounded-md border border-destructive/20 bg-destructive/8 p-3 text-xs leading-5 text-destructive">This sends an empty allowlist, which means the agent can pay nobody. You will confirm once more before saving.</p>}</fieldset></div>{error && <p role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving policy" : "Save hard limits"}</Button></DialogFooter></form></DialogContent></Dialog>
  );
}

export function GuardrailsPage() {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [blockedToday, setBlockedToday] = React.useState(0);
  const [selected, setSelected] = React.useState<Agent | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const { client, authReady } = useOwnerApi();
  React.useEffect(() => {
    if (!authReady) return;
    Promise.all([client.listAgents(), client.stats()])
      .then(([agentData, stats]) => { setAgents(agentData); setBlockedToday(stats.blocked_today); })
      .catch((reason) => setNotice(reason instanceof Error ? reason.message : "The policy API is unavailable."));
  }, [authReady, client]);
  const protectedCount = agents.filter((agent) => agent.rules).length;
  const restricted = agents.filter((agent) => agent.rules?.allowed_counterparty_ids !== null).length;
  function saved(agentId: string, rules: RulesInput) { setAgents((items) => items.map((agent) => agent.id === agentId ? { ...agent, rules: { max_per_transaction: String(rules.max_per_transaction), max_per_day: String(rules.max_per_day), allowed_counterparty_ids: rules.allowed_counterparty_ids ?? null } } : agent)); setNotice("The updated policy is now the local authorization boundary for every payment attempt."); }
  return (
    <>
      <Notice message={notice} onDismiss={() => setNotice(null)} />
      <PageHeader eyebrow="Pre-rail policy engine" title="Guardrails" description="Set hard limits that are evaluated before money movement. A blocked request is recorded, but never reaches WeWire." actions={<Button variant="outline" size="lg" asChild><Link href="/activity?status=blocked"><ShieldCheck aria-hidden="true" />Review blocks</Link></Button>} />
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Policy coverage" value={`${protectedCount}/${agents.length}`} detail="Agents with hard limits" icon={ShieldCheck} tone="primary" /><Metric label="Restricted" value={String(restricted).padStart(2, "0")} detail="Allowlist or pay-nobody modes" icon={LockKeyhole} /><Metric label="Blocks today" value={String(blockedToday).padStart(2, "0")} detail="No rail call was made" icon={AlertTriangle} tone="danger" /></div>

      <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" aria-labelledby="policy-envelope-heading">
        <div><div className="mb-4"><h2 id="policy-envelope-heading" className="text-lg font-semibold tracking-[-0.02em]">Policy envelopes</h2><p className="mt-1 text-sm text-muted-foreground">Each agent carries its own transaction cap, daily cap, and optional counterparty list.</p></div><div className="grid gap-3 lg:grid-cols-2">{agents.map((agent) => { const usage = ratioPercent(agent.spent_today, agent.rules?.max_per_day ?? "0"); const allowed = agent.rules?.allowed_counterparty_ids; return <article key={agent.id} className="rounded-lg bg-card p-5 surface-ring"><div className="flex items-start justify-between gap-3"><Link href={`/agents/${agent.id}`}><AgentIdentity agent={agent} /></Link><StatusBadge status={agent.status} /></div><div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border surface-ring"><div className="bg-inset p-3"><p className="font-mono text-[10px] text-muted-foreground uppercase">Single payment</p><p className="mt-2 font-heading font-semibold tabular-nums">{formatMoney(agent.rules?.max_per_transaction ?? "0", agent.base_currency)}</p></div><div className="bg-inset p-3"><p className="font-mono text-[10px] text-muted-foreground uppercase">UTC day</p><p className="mt-2 font-heading font-semibold tabular-nums">{formatMoney(agent.rules?.max_per_day ?? "0", agent.base_currency)}</p></div></div><div className="mt-5"><div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Daily utilization</span><span className="font-mono tabular-nums">{Math.round(usage)}%</span></div><Progress value={usage} className="mt-2 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" /></div><div className="mt-4 flex items-center justify-between gap-3"><p className={cn("truncate text-xs", Array.isArray(allowed) && allowed.length === 0 ? "font-medium text-destructive" : "text-muted-foreground")}>{allowed === null || allowed === undefined ? "Any counterparty" : allowed.length ? `${allowed.length} approved counterparties` : "No counterparties allowed"}</p><Button variant="outline" size="sm" onClick={() => setSelected(agent)}><SlidersHorizontal aria-hidden="true" />Edit</Button></div></article>; })}</div></div>
        <aside className="rounded-lg bg-inset p-5 surface-ring xl:sticky xl:top-24 xl:self-start"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Authorization path</p><h2 className="mt-2 font-medium">Before money moves</h2></div><Badge variant="outline" className="border-primary/45 bg-primary/15 text-primary-ink"><span className="size-1.5 rounded-full bg-primary" />4ms</Badge></div><ol className="mt-6 space-y-0">{[{ label: "Agent authenticated", detail: "Scoped X-Agent-Key", icon: KeyRound }, { label: "Policy evaluated", detail: "Amount + daily usage + allowlist", icon: ShieldCheck }, { label: "Decision recorded", detail: "Approved or blocked in audit ledger", icon: Clipboard }, { label: "WeWire called", detail: "Only after local approval", icon: Zap }].map((step, index, items) => <li key={step.label} className="relative flex min-h-20 gap-3">{index < items.length - 1 && <span className="absolute top-8 bottom-0 left-[15px] w-px bg-primary/35" aria-hidden="true" />}<span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-sm border border-primary/45 bg-accent text-primary-ink"><step.icon className="size-4" strokeWidth={2} aria-hidden="true" /></span><div className="pt-1"><p className="text-sm font-medium">{step.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p></div></li>)}</ol><div className="mt-1 rounded-md border border-destructive/20 bg-destructive/8 p-3"><p className="text-xs font-medium text-destructive">Blocked means no rail exposure</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The rejection is still auditable with the exact rule violated.</p></div></aside>
      </section>
      <PolicyEditor key={selected?.id ?? "closed"} agent={selected} agents={agents} onClose={() => setSelected(null)} onSaved={saved} />
      <PageFooter />
    </>
  );
}

export function SettingsPage() {
  const [checking, setChecking] = React.useState(false);
  const [apiHealth, setApiHealth] = React.useState<"idle" | "healthy" | "offline">("idle");
  const [railHealth, setRailHealth] = React.useState<"idle" | "healthy" | "offline">("idle");
  const [healthMode, setHealthMode] = React.useState<string | null>(null);
  const [backendClerkConfigured, setBackendClerkConfigured] = React.useState<boolean | null>(null);
  const { client, clerkConfigured } = useOwnerApi();
  async function checkHealth() {
    setChecking(true);
    const [api, rail] = await Promise.allSettled([client.health(), client.healthWeWire()]);
    setApiHealth(api.status === "fulfilled" ? "healthy" : "offline");
    setRailHealth(rail.status === "fulfilled" ? "healthy" : "offline");
    if (api.status === "fulfilled") {
      setHealthMode(api.value.wewire_mode ?? null);
      setBackendClerkConfigured(api.value.clerk_configured ?? null);
    }
    setChecking(false);
  }
  return (
    <>
      <PageHeader eyebrow="Workspace control" title="Settings" description="Verify owner authentication, backend reachability, and the WeWire sandbox before running an autonomous payment demo." actions={<Button size="lg" onClick={checkHealth} disabled={checking}><RefreshCw className={cn(checking && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />Run preflight</Button>} />
      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="rounded-lg bg-card surface-ring" aria-labelledby="workspace-settings-heading"><div className="border-b border-border p-5"><h2 id="workspace-settings-heading" className="text-lg font-semibold tracking-[-0.02em]">Workspace</h2><p className="mt-1 text-sm text-muted-foreground">Owner-facing identity and environment defaults.</p></div><dl className="divide-y divide-border"><div className="grid gap-2 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">API origin</dt><dd className="break-all font-mono text-xs">{process.env.NEXT_PUBLIC_API_URL ?? "https://kerux-backend.onrender.com"}</dd></div><div className="grid gap-2 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">Rail mode</dt><dd><Badge variant="secondary">{healthMode ?? "run preflight"}</Badge>{healthMode === "mock" && <p className="mt-2 text-xs text-destructive">Mock mode: no real rail calls are being made.</p>}</dd></div><div className="grid gap-2 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-muted-foreground">Owner authentication</dt><dd className="flex flex-wrap items-center gap-2"><StatusBadge status={clerkConfigured && backendClerkConfigured !== false ? "active" : "offline"} /><span className="text-sm text-muted-foreground">{!clerkConfigured ? "Local DEV_OWNER_ID mode; configure Clerk before deployment" : backendClerkConfigured === false ? "Frontend ready; backend Clerk verification key is still pending" : "Clerk session tokens protect every owner request"}</span></dd></div></dl></section>
          <section className="rounded-lg bg-card surface-ring" aria-labelledby="developer-settings-heading"><div className="border-b border-border p-5"><h2 id="developer-settings-heading" className="text-lg font-semibold tracking-[-0.02em]">Developer contract</h2><p className="mt-1 text-sm text-muted-foreground">The two authentication surfaces are intentionally separate.</p></div><div className="grid gap-px bg-border md:grid-cols-2"><div className="bg-card p-5"><span className="grid size-9 place-items-center rounded-md bg-secondary text-muted-foreground"><LockKeyhole className="size-4" aria-hidden="true" /></span><h3 className="mt-4 font-medium">Owner API</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Clerk bearer token for provisioning, funding, policy changes, freeze, and audit access.</p><code className="mt-4 block rounded-md bg-inset px-3 py-2 font-mono text-[11px]">Authorization: Bearer &lt;session&gt;</code></div><div className="bg-card p-5"><span className="grid size-9 place-items-center rounded-md bg-primary/25 text-primary-ink"><KeyRound className="size-4" aria-hidden="true" /></span><h3 className="mt-4 font-medium">Agent API</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Scoped one-time credential for self-inspection, quotes, and autonomous payments.</p><code className="mt-4 block rounded-md bg-inset px-3 py-2 font-mono text-[11px]">X-Agent-Key: krx_••••</code></div></div></section>
        </div>
        <aside className="space-y-5"><section className="rounded-lg bg-card p-5 surface-ring" aria-labelledby="preflight-heading"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Demo readiness</p><h2 id="preflight-heading" className="mt-2 font-medium">Preflight checks</h2></div><ServerCog className="size-5 text-muted-foreground" aria-hidden="true" /></div><div className="mt-5 space-y-3">{[{ label: "Kērux backend", detail: process.env.NEXT_PUBLIC_API_URL ?? "https://kerux-backend.onrender.com", status: apiHealth }, { label: "WeWire round-trip", detail: "Configured money movement rail", status: railHealth }, { label: "Policy engine", detail: "Local-first authorization", status: apiHealth }].map((item) => <div key={item.label} className="flex items-start gap-3 rounded-md bg-inset p-3 surface-ring"><span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm", item.status === "offline" ? "bg-destructive/10 text-destructive" : item.status === "healthy" ? "bg-primary/25 text-primary-ink" : "bg-secondary text-muted-foreground")}>{item.status === "offline" ? <Unplug className="size-3.5" aria-hidden="true" /> : item.status === "healthy" ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <Radio className="size-3.5" aria-hidden="true" />}</span><div><p className="text-sm font-medium">{item.label}</p><p className="mt-1 break-all text-xs leading-5 text-muted-foreground">{item.detail}</p></div></div>)}</div></section><section className="rounded-lg bg-inset p-5 surface-ring"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary-ink" aria-hidden="true" /><h2 className="font-medium">Demo sequence</h2></div><ol className="mt-4 space-y-3 text-sm text-muted-foreground"><li className="flex gap-3"><span className="font-mono text-primary-ink">01</span>Create and fund two agents</li><li className="flex gap-3"><span className="font-mono text-primary-ink">02</span>Execute one autonomous payment</li><li className="flex gap-3"><span className="font-mono text-primary-ink">03</span>Trigger a pre-rail policy block</li><li className="flex gap-3"><span className="font-mono text-primary-ink">04</span>Freeze the offending agent</li></ol><Button className="mt-5 w-full" variant="outline" asChild><Link href="/agents">Open agent registry<ExternalLink aria-hidden="true" /></Link></Button></section></aside>
      </div>
      <PageFooter />
    </>
  );
}
