"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Check,
  Copy,
  Gauge,
  KeyRound,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { AuthControls } from "@/components/auth-controls";
import { KeruxMark } from "@/components/kerux-mark";
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
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { agentNames, demoAgents, demoPayments } from "@/lib/demo-data";
import type { Agent, Currency } from "@/lib/api/types";
import { currencies } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: Gauge, href: "/", active: true },
  { label: "Agents", icon: Bot, href: "/agents" },
  { label: "Activity", icon: Activity, href: "/activity" },
  { label: "Guardrails", icon: ShieldCheck, href: "/guardrails" },
];

const money = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavContent({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", mobile ? "px-1" : "px-5")}>
        <KeruxMark />
        <Badge variant="outline" className="ml-auto border-primary/35 bg-primary/15 text-primary-ink">
          beta
        </Badge>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5" aria-label="Primary navigation">
        <p className="mb-2 px-2 font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Control room
        </p>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-[background-color,color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              item.active ? "bg-sidebar-accent text-sidebar-foreground surface-ring" : "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="size-4" strokeWidth={item.active ? 2 : 1.5} aria-hidden="true" />
            {item.label}
            {item.label === "Activity" && (
              <span className="ml-auto font-mono text-[10px] text-primary-ink tabular-nums">04</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="m-3 rounded-lg bg-card p-3 surface-ring">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs font-medium">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            WeWire sandbox
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">42ms</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Rails healthy. All policy checks are local-first.</p>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <Link href="/settings" className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <Settings className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Settings
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active" || status === "executed") {
    return (
      <Badge variant="outline" className="border-primary/35 bg-primary/15 text-primary-ink">
        <Check aria-hidden="true" /> {status}
      </Badge>
    );
  }
  if (status === "frozen" || status === "blocked") {
    return (
      <Badge variant="outline" className="border-destructive/25 bg-destructive/8 text-destructive">
        <X aria-hidden="true" /> {status}
      </Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}

function CreateAgentDialog({ onCreate }: { onCreate: (agent: Agent) => void }) {
  const [open, setOpen] = React.useState(false);
  const [currency, setCurrency] = React.useState<Currency>("USD");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "New agent");
    const funding = String(form.get("funding") || "0");
    const daily = String(form.get("daily") || "1000");
    const perTransaction = String(form.get("transaction") || "250");
    const id = `agt_${crypto.randomUUID().slice(0, 8)}`;

    onCreate({
      id,
      name,
      status: "active",
      base_currency: currency,
      balance: funding,
      spent_today: "0.00",
      remaining_today: daily,
      rules: {
        max_per_transaction: perTransaction,
        max_per_day: daily,
        allowed_counterparty_ids: null,
      },
      wewire_sub_customer_id: `pending_${id}`,
      key_prefix: "krx_demo_new",
      created_at: new Date().toISOString(),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create agent
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg border-border bg-popover sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Provision an agent account</DialogTitle>
            <DialogDescription className="text-pretty">
              Creates a distinct WeWire sub-customer, wallet, spending policy, and one-time API key.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="grid gap-2">
              <Label htmlFor="agent-name">Agent name</Label>
              <Input id="agent-name" name="name" className="h-10 rounded-md bg-input" placeholder="e.g. Invoice reconciler" required maxLength={120} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="currency">Base currency</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                  <SelectTrigger id="currency" className="h-10 w-full rounded-md bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="funding">Initial funding</Label>
                <Input id="funding" name="funding" type="number" min="0" step="0.01" className="h-10 rounded-md bg-input tabular-nums" placeholder="5,000.00" />
              </div>
            </div>
            <div className="rounded-md bg-inset p-4 surface-ring">
              <div className="mb-3 flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary-ink" strokeWidth={2} aria-hidden="true" />
                <p className="text-sm font-medium">Hard spending limits</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="transaction">Per transaction</Label>
                  <Input id="transaction" name="transaction" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-background tabular-nums" defaultValue="250" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="daily">Per UTC day</Label>
                  <Input id="daily" name="daily" type="number" min="0.01" step="0.01" className="h-10 rounded-md bg-background tabular-nums" defaultValue="1000" required />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create & issue key</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AuthorizationTrace() {
  const steps = [
    { label: "Request received", detail: "Procurement Scout", icon: Radio },
    { label: "Policy evaluated", detail: "$89 < $750 cap", icon: ShieldCheck },
    { label: "Rail executed", detail: "ww_tx_88ac1e", icon: Zap },
  ];

  return (
    <div className="h-full bg-inset p-5 lg:p-6" id="guardrails">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Authorization trace</p>
          <p className="mt-2 text-sm font-medium">Latest autonomous payment</p>
        </div>
        <Badge variant="outline" className="border-primary/35 bg-primary/15 text-primary-ink">
          <span className="size-1.5 rounded-full bg-primary" /> live
        </Badge>
      </div>

      <div className="mt-6">
        {steps.map((step, index) => (
          <div key={step.label} className="relative flex min-h-16 gap-3">
            {index < steps.length - 1 && <span className="absolute top-7 bottom-0 left-[13px] w-px bg-primary/25" aria-hidden="true" />}
            <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-sm border border-primary/35 bg-accent text-primary-ink">
              <step.icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-medium text-foreground">{step.label}</p>
              <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{step.detail}</p>
            </div>
            <span className="ml-auto pt-1 font-mono text-[10px] text-primary-ink tabular-nums">{index === 0 ? "0ms" : index === 1 ? "4ms" : "418ms"}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">Settled via WeWire</span>
        <span className="font-heading text-sm font-semibold tabular-nums">$89.00</span>
      </div>
    </div>
  );
}

function AgentActions({ agent, onToggle }: { agent: Agent; onToggle: (id: string) => void }) {
  const frozen = agent.status === "frozen";
  return (
    <div className="flex justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={frozen ? "outline" : "destructive"}
            size="icon"
            aria-label={frozen ? `Reactivate ${agent.name}` : `Freeze ${agent.name}`}
            onClick={() => onToggle(agent.id)}
          >
            {frozen ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{frozen ? "Reactivate and rotate key" : "Freeze immediately"}</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`More actions for ${agent.name}`}>
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-md">
          <DropdownMenuLabel>{agent.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><WalletCards aria-hidden="true" /> Fund wallet</DropdownMenuItem>
          <DropdownMenuItem><SlidersHorizontal aria-hidden="true" /> Edit limits</DropdownMenuItem>
          <DropdownMenuItem><KeyRound aria-hidden="true" /> Rotate API key</DropdownMenuItem>
          <DropdownMenuItem><Copy aria-hidden="true" /> Copy agent ID</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AgentsTable({ agents, onToggle }: { agents: Agent[]; onToggle: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg bg-card surface-ring">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-11 pl-4 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Agent account</TableHead>
              <TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Available</TableHead>
              <TableHead className="w-[230px] font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Daily policy</TableHead>
              <TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">State</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => {
              const dailyMax = Number(agent.rules?.max_per_day ?? 0);
              const usage = dailyMax ? Math.min(100, (Number(agent.spent_today) / dailyMax) * 100) : 0;
              return (
                <TableRow key={agent.id} className="border-border hover:bg-surface-hover/70">
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-md">
                        <AvatarFallback className="rounded-md bg-secondary font-heading text-xs text-secondary-foreground">{initials(agent.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{agent.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{agent.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-heading text-sm font-semibold tabular-nums">{formatMoney(agent.balance, agent.base_currency)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{agent.base_currency} wallet</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{formatMoney(agent.spent_today, agent.base_currency)} spent</span>
                      <span className="font-mono text-[10px] text-foreground tabular-nums">{Math.round(usage)}%</span>
                    </div>
                    <Progress value={usage} className="mt-2 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" />
                  </TableCell>
                  <TableCell><StatusBadge status={agent.status} /></TableCell>
                  <TableCell><AgentActions agent={agent} onToggle={onToggle} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {agents.map((agent) => {
          const dailyMax = Number(agent.rules?.max_per_day ?? 0);
          const usage = dailyMax ? Math.min(100, (Number(agent.spent_today) / dailyMax) * 100) : 0;
          return (
            <article key={agent.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-9 rounded-md">
                  <AvatarFallback className="rounded-md bg-secondary font-heading text-xs">{initials(agent.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{agent.id}</p>
                    </div>
                    <StatusBadge status={agent.status} />
                  </div>
                  <p className="mt-4 font-heading text-lg font-semibold tabular-nums">{formatMoney(agent.balance, agent.base_currency)}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatMoney(agent.spent_today, agent.base_currency)} spent today</span>
                    <span className="font-mono tabular-nums">{Math.round(usage)}%</span>
                  </div>
                  <Progress value={usage} className="mt-2 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" />
                  <div className="mt-3 flex justify-end"><AgentActions agent={agent} onToggle={onToggle} /></div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ActivityTable({ filter }: { filter: "all" | "executed" | "blocked" }) {
  const rows = filter === "all" ? demoPayments : demoPayments.filter((payment) => payment.status === filter);

  return (
    <div className="overflow-hidden rounded-lg bg-card surface-ring">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-11 pl-4 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Time / agent</TableHead>
            <TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Purpose</TableHead>
            <TableHead className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Outcome</TableHead>
            <TableHead className="pr-4 text-right font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((payment) => (
            <TableRow key={payment.id} className="border-border hover:bg-surface-hover/70">
              <TableCell className="py-3 pl-4">
                <p className="font-mono text-[11px] font-medium tabular-nums">
                  {new Date(payment.created_at ?? "").toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="mt-1 max-w-36 truncate text-xs text-muted-foreground">{agentNames[payment.agent_id]}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-sm", payment.status === "blocked" ? "bg-destructive/10 text-destructive" : "bg-accent text-primary-ink")}>
                    {payment.status === "blocked" ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : <ArrowUpRight className="size-3.5" aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="max-w-60 truncate text-sm">{payment.memo}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{payment.kind.replaceAll("_", " ")}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={payment.status} />
                {payment.rule_violated && <p className="mt-1.5 font-mono text-[10px] text-destructive">{payment.rule_violated}</p>}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <p className="font-heading text-sm font-semibold tabular-nums">{formatMoney(payment.amount, payment.currency)}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{payment.wewire_transaction_id ?? "stopped pre-rail"}</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 && (
        <div className="grid min-h-40 place-items-center px-4 text-center">
          <div>
            <ShieldCheck className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium">No activity in this state</p>
            <p className="mt-1 text-xs text-muted-foreground">New payment attempts will appear here live.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardShell() {
  const [agents, setAgents] = React.useState(demoAgents);
  const [filter, setFilter] = React.useState<"all" | "executed" | "blocked">("all");
  const [notice, setNotice] = React.useState<string | null>(null);

  const totalBalance = agents.reduce((sum, agent) => sum + Number(agent.balance), 0);
  const activeCount = agents.filter((agent) => agent.status === "active").length;

  function handleToggle(id: string) {
    setAgents((current) => current.map((agent) => agent.id === id ? { ...agent, status: agent.status === "frozen" ? "active" : "frozen" } : agent));
    const agent = agents.find((item) => item.id === id);
    setNotice(`${agent?.name ?? "Agent"} ${agent?.status === "frozen" ? "reactivated with a fresh key" : "frozen immediately"}.`);
  }

  function handleCreate(agent: Agent) {
    setAgents((current) => [agent, ...current]);
    setNotice(`${agent.name} was provisioned in demo mode. Connect the API to issue its real one-time key.`);
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border bg-sidebar lg:block">
        <NavContent />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] rounded-none border-sidebar-border bg-sidebar p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Move around the Kerux control room.</SheetDescription>
              </SheetHeader>
              <NavContent mobile />
            </SheetContent>
          </Sheet>

          <div className="lg:hidden"><KeruxMark /></div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-medium">Acme agent network</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">owner workspace · sandbox</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Refresh rail status">
              <RefreshCw aria-hidden="true" />
            </Button>
            <AuthControls />
          </div>
        </header>

        <main id="overview" className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {notice && (
            <div role="status" className="mb-5 flex items-start gap-3 rounded-md border border-primary/35 bg-primary/15 px-4 py-3 text-sm text-success-foreground">
              <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <p className="flex-1 text-pretty">{notice}</p>
              <button onClick={() => setNotice(null)} className="-m-2 grid size-9 place-items-center rounded-md text-success-foreground/70 hover:bg-primary/10 hover:text-success-foreground" aria-label="Dismiss notice">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/35 bg-primary/15 text-primary-ink">
                  <Sparkles aria-hidden="true" /> autonomous treasury
                </Badge>
              </div>
              <h1 className="mt-4 text-balance text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Money that knows its boundaries.</h1>
              <p className="mt-2 max-w-xl text-pretty text-sm leading-6 text-muted-foreground">Fund agents once, enforce hard limits on every attempt, and stop any account before a bad call reaches the rail.</p>
            </div>
            <CreateAgentDialog onCreate={handleCreate} />
          </div>

          <section className="mt-7 overflow-hidden rounded-lg bg-card surface-ring xl:grid xl:grid-cols-[1.45fr_.8fr]" aria-labelledby="capital-heading">
            <div className="p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p id="capital-heading" className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Capital under policy</p>
                  <p className="mt-3 font-heading text-3xl font-semibold tracking-[-0.05em] tabular-nums sm:text-4xl">${money.format(totalBalance)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Across {agents.length} isolated wallets · {activeCount} authorized</p>
                </div>
                <div className="rounded-md bg-inset px-3 py-2 surface-ring">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary-ink">
                    <ArrowDownRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    12.4% below policy ceiling
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-3">
                  {agents.slice(0, 3).map((agent) => {
                    const share = totalBalance ? (Number(agent.balance) / totalBalance) * 100 : 0;
                    return (
                      <div key={agent.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2">
                        <div className="flex min-w-0 items-center gap-2 text-xs">
                          <span className={cn("size-1.5 shrink-0 rounded-full", agent.status === "active" ? "bg-primary" : "bg-destructive")} />
                          <span className="truncate text-muted-foreground">{agent.name}</span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums">{Math.round(share)}%</span>
                        <div className="col-span-2 h-1 overflow-hidden rounded-sm bg-secondary">
                          <div className={cn("h-full rounded-sm", agent.status === "active" ? "bg-primary/70" : "bg-destructive/70")} style={{ width: `${share}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border surface-ring sm:w-[260px]">
                  <div className="bg-inset p-4">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Spent today</p>
                    <p className="mt-2 font-heading text-lg font-semibold tabular-nums">$2,417.30</p>
                  </div>
                  <div className="bg-inset p-4">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Pre-rail blocks</p>
                    <p className="mt-2 font-heading text-lg font-semibold text-destructive tabular-nums">03</p>
                  </div>
                </div>
              </div>
            </div>
            <AuthorizationTrace />
          </section>

          <section id="agents" className="mt-9 scroll-mt-24" aria-labelledby="agents-heading">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 id="agents-heading" className="text-lg font-semibold tracking-[-0.02em]">Agent accounts</h2>
                <p className="mt-1 text-sm text-muted-foreground">Separate wallets, credentials, and policy envelopes.</p>
              </div>
              <Badge variant="secondary">{agents.length} total</Badge>
            </div>
            <AgentsTable agents={agents} onToggle={handleToggle} />
          </section>

          <section id="activity" className="mt-9 scroll-mt-24" aria-labelledby="activity-heading">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="activity-heading" className="text-lg font-semibold tracking-[-0.02em]">Audit stream</h2>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-primary-ink">
                    <span className="size-1.5 rounded-full bg-primary" /> LIVE
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Every approved, executed, blocked, and failed attempt.</p>
              </div>
              <div className="flex gap-1 rounded-md bg-card p-1 surface-ring" aria-label="Filter activity">
                {(["all", "executed", "blocked"] as const).map((item) => (
                  <button
                    key={item}
                    aria-pressed={filter === item}
                    onClick={() => setFilter(item)}
                    className={cn(
                      "min-h-9 rounded-sm px-3 text-xs font-medium capitalize transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      filter === item ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <ActivityTable filter={filter} />
          </section>

          <footer className="mt-10 flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Kērux control room · WeWire sandbox</p>
            <p className="font-mono">API contract v0.1.0</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
