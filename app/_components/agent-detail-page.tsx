"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, KeyRound, Pause, Play, RefreshCw, Send, ShieldAlert, SlidersHorizontal, WalletCards, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useOwnerApi } from "@/lib/api/provider";
import { useOwnerEvents } from "@/lib/api/use-owner-events";
import { apiKeyPrefix, formatMoney, formatTimestamp, isStatus, normalizeStatus, ratioPercent } from "@/lib/api/format";
import type { Agent, ConnectedChat, LinkToken, Payment, RulesInput } from "@/lib/api/types";

function StateBadge({ status }: { status: string }) {
  const value = normalizeStatus(status);
  return <Badge variant="outline" className={value === "active" || value === "executed" ? "border-primary/45 bg-primary/15 text-primary-ink" : "border-destructive/25 bg-destructive/8 text-destructive"}>{value === "active" || value === "executed" ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}{value}</Badge>;
}

function OneTimeKey({ value, onClose }: { value: string | null; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  return <Dialog open={Boolean(value)} onOpenChange={(open) => !open && onClose()}><DialogContent className="rounded-lg sm:max-w-[560px]"><DialogHeader><DialogTitle className="font-heading text-lg">Copy the fresh agent key now</DialogTitle><DialogDescription>The old keys remain revoked. This replacement is returned once and cannot be retrieved later.</DialogDescription></DialogHeader><div className="my-5 rounded-md bg-inset p-4 surface-ring"><code className="break-all font-mono text-xs leading-6">{value}</code></div><DialogFooter><Button variant="outline" onClick={onClose}>I stored it</Button><Button onClick={async () => { if (!value) return; await navigator.clipboard.writeText(value); setCopied(true); }}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy key"}</Button></DialogFooter></DialogContent></Dialog>;
}

/** Connect to Telegram.
 *
 *  The link is minted when the dialog opens, never earlier: it is single-use
 *  and expires in minutes, so one cached on page load is usually dead by the
 *  time anyone taps it.
 *
 *  The chat holds no key. Kerux remembers which agent it belongs to, so it can
 *  spend inside the agent's limits and cannot raise them, unfreeze the agent,
 *  or move money anywhere else — which is the thing worth saying out loud in
 *  the dialog. `onClosed` lets the page re-read its chats even without the
 *  live feed. */
function ConnectTelegram({ agent, disabled, onClosed }: { agent: Agent; disabled?: boolean; onClosed?: () => void }) {
  const { client } = useOwnerApi();
  const [open, setOpen] = React.useState(false);
  const [link, setLink] = React.useState<LinkToken | null>(null);
  const [qr, setQr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());

  const mint = React.useCallback(async () => {
    setBusy(true); setFailed(null); setLink(null); setQr(null); setCopied(false);
    try {
      const minted = await client.createLinkToken(agent.id);
      setNow(Date.now());
      setLink(minted);
      if (minted.deep_link) {
        const QRCode = (await import("qrcode")).default;
        setQr(await QRCode.toDataURL(minted.deep_link, { margin: 1, width: 320 }));
      }
    } catch (err) {
      setFailed(err instanceof Error ? err.message : "Could not create a link.");
    } finally { setBusy(false); }
  }, [agent.id, client]);

  // Show the expiry ticking down rather than a timestamp — the whole point is
  // that this link is about to stop working. The clock is derived from `now`
  // rather than held in its own state, so the effect only advances a tick.
  React.useEffect(() => {
    if (!link) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [link]);

  const secondsLeft = link
    ? Math.max(0, Math.round((new Date(link.expires_at).getTime() - now) / 1000))
    : null;
  const expired = secondsLeft !== null && secondsLeft <= 0;
  const clock = secondsLeft === null ? "" : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) void mint(); else onClosed?.(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}><Send aria-hidden="true" />Connect to Telegram</Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Connect {agent.name} to a chat</DialogTitle>
          <DialogDescription>Scan or tap to bind this agent to one Telegram chat. Single use, and it expires in minutes.</DialogDescription>
        </DialogHeader>

        {busy && <p className="py-10 text-center text-sm text-muted-foreground">Minting a link…</p>}
        {failed && <div className="my-4 rounded-md border border-destructive/20 bg-destructive/8 p-4 text-sm text-destructive">{failed}</div>}

        {link && !busy && (
          <div className="my-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, nothing for next/image to optimise */}
            {qr && <img src={qr} alt={`QR code linking ${agent.name} to Telegram`} className={cn("mx-auto rounded-md bg-white p-2", expired && "opacity-30")} width={240} height={240} />}
            {!link.deep_link && <p className="text-sm text-muted-foreground">The API has no bot username configured, so there is no deep link — pass this token to the bot yourself.</p>}
            <div className="mt-4 rounded-md bg-inset p-3 surface-ring"><code className="break-all font-mono text-xs leading-5">{link.deep_link ?? link.token}</code></div>
            <p className={cn("mt-3 text-center text-xs", expired ? "font-medium text-destructive" : "text-muted-foreground")}>
              {expired ? "This link has expired — mint another." : `Expires in ${clock}`}
            </p>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              The chat can spend inside this agent&apos;s limits. It can&apos;t raise them, unfreeze the agent, or move money anywhere else. You can disconnect it here at any time.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => void mint()} disabled={busy}><RefreshCw aria-hidden="true" />New link</Button>
          <Button
            disabled={!link?.deep_link || expired}
            onClick={async () => { if (!link?.deep_link) return; await navigator.clipboard.writeText(link.deep_link); setCopied(true); }}
          >{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy link"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The Telegram chats spending as this agent.
 *
 *  Disconnecting is its own action: a chat holds no key, so rotating the
 *  agent's key no longer cuts a chat off. Freezing still stops every chat. */
function ConnectedChats({ agent, chats, onDisconnected }: { agent: Agent; chats: ConnectedChat[]; onDisconnected: (chat: ConnectedChat) => void }) {
  const { client } = useOwnerApi();
  const [target, setTarget] = React.useState<ConnectedChat | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState<string | null>(null);
  const chatName = (chat: ConnectedChat) => chat.label ?? `Chat …${chat.telegram_chat_id.slice(-4)}`;

  async function disconnect() {
    if (!target) return;
    setBusy(true); setFailed(null);
    try {
      await client.disconnectChat(agent.id, target.telegram_chat_id);
      onDisconnected(target);
      setTarget(null);
    } catch (err) {
      setFailed(err instanceof Error ? err.message : "The chat could not be disconnected.");
    } finally { setBusy(false); }
  }

  return (
    <section className="mt-5 rounded-lg bg-card p-5 surface-ring" aria-labelledby="chats-heading">
      <div className="flex items-center gap-2"><Send className="size-4 text-primary-ink" aria-hidden="true" /><h2 id="chats-heading" className="font-semibold">Connected chats</h2></div>
      <p className="mt-2 text-sm text-muted-foreground">Telegram chats that can spend as {agent.name}. Freezing the agent stops all of them.</p>
      {chats.length ? (
        <ul className="mt-4 divide-y divide-border rounded-md bg-inset surface-ring">
          {chats.map((chat) => (
            <li key={chat.telegram_chat_id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{chatName(chat)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{chat.linked_at ? `Connected ${formatTimestamp(chat.linked_at)}` : "Connected"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setFailed(null); setTarget(chat); }}><X aria-hidden="true" />Disconnect</Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-md bg-inset px-4 py-3 text-sm text-muted-foreground surface-ring">No chats connected yet. Use Connect to Telegram to add one.</p>
      )}
      <Dialog open={Boolean(target)} onOpenChange={(open) => { if (!open) setTarget(null); }}>
        <DialogContent className="rounded-lg sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Disconnect {target ? chatName(target) : "this chat"}?</DialogTitle>
            <DialogDescription>That chat stops spending from {agent.name} straight away. The agent and its other chats carry on.</DialogDescription>
          </DialogHeader>
          {failed && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">{failed}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void disconnect()} disabled={busy}>{busy ? "Disconnecting" : "Disconnect chat"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function AgentDetailPage({ agentId }: { agentId: string }) {
  const { client, authReady } = useOwnerApi();
  const [agent, setAgent] = React.useState<Agent | null>(null);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [chats, setChats] = React.useState<ConnectedChat[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [issuedKey, setIssuedKey] = React.useState<string | null>(null);
  const [freezeOpen, setFreezeOpen] = React.useState(false);
  const [counterpartyMode, setCounterpartyMode] = React.useState<"any" | "restricted" | "none">("any");

  const refresh = React.useCallback(async () => {
    if (!authReady) return;
    try {
      const [agentData, agentList, activity, chatList] = await Promise.all([
        client.getAgent(agentId),
        client.listAgents(),
        client.agentTransactions(agentId, { limit: 50 }),
        // An API that predates connected chats answers 404; show none rather
        // than failing the whole page.
        client.listChats(agentId).catch(() => [] as ConnectedChat[]),
      ]);
      setAgent(agentData);
      setAgents(agentList);
      setPayments(activity.items);
      setChats(chatList);
      setNextCursor(activity.next_cursor);
      const allowed = agentData.rules?.allowed_counterparty_ids;
      setCounterpartyMode(allowed === null || allowed === undefined ? "any" : allowed.length ? "restricted" : "none");
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This agent could not be loaded.");
    }
  }, [agentId, authReady, client]);

  React.useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  useOwnerEvents(() => void refresh(), () => void refresh());

  async function toggleAgent() {
    if (!agent) return;
    setBusy(true);
    try {
      if (isStatus(agent.status, "frozen")) {
        const result = await client.unfreezeAgent(agent.id);
        setAgent({ ...agent, status: result.status, key_prefix: result.api_key ? apiKeyPrefix(result.api_key) : agent.key_prefix });
        if (result.api_key) setIssuedKey(result.api_key);
        setNotice("Agent reactivated. Connected chats work again, and every revoked key stays revoked.");
      } else {
        const result = await client.freezeAgent(agent.id);
        setAgent({ ...agent, status: result.status, key_prefix: null });
        setFreezeOpen(false);
        setNotice("Kill switch engaged. The agent is frozen and its keys are revoked.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The agent state could not be changed.");
    } finally { setBusy(false); }
  }

  async function saveRules(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agent) return;
    const form = new FormData(event.currentTarget);
    const selected = form.getAll("counterparties").map(String);
    if (counterpartyMode === "restricted" && !selected.length) { setError("Choose at least one approved agent for restricted access."); return; }
    if (counterpartyMode === "none" && !window.confirm(`${agent.name} will be unable to pay any counterparty. Save this policy?`)) return;
    const rules: RulesInput = {
      max_per_transaction: String(form.get("transaction")),
      max_per_day: String(form.get("daily")),
      allowed_counterparty_ids: counterpartyMode === "any" ? null : counterpartyMode === "none" ? [] : selected,
    };
    setBusy(true);
    try {
      const saved = await client.setRules(agent.id, rules);
      setAgent({ ...agent, rules: saved });
      setNotice("Spending limits updated.");
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The guardrails could not be saved.");
    } finally { setBusy(false); }
  }

  async function rotateKey() {
    if (!agent) return;
    setBusy(true);
    try { const key = (await client.rotateKey(agent.id)).api_key; setIssuedKey(key); setAgent({ ...agent, key_prefix: apiKeyPrefix(key) }); setNotice("A fresh scoped key was issued and the previous key was revoked."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The key could not be rotated."); }
    finally { setBusy(false); }
  }

  async function loadEarlier() {
    if (!nextCursor) return;
    const page = await client.agentTransactions(agentId, { limit: 50, before: nextCursor });
    setPayments((items) => [...items, ...page.items]);
    setNextCursor(page.next_cursor);
  }

  if (!agent && !error) return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" /><p className="mt-3 text-sm text-muted-foreground">Loading the agent control surface</p></div></div>;
  if (!agent) return <div role="alert" className="mx-auto mt-16 max-w-lg rounded-lg bg-card p-6 text-center surface-ring"><ShieldAlert className="mx-auto size-6 text-destructive" aria-hidden="true" /><h1 className="mt-4 text-lg font-semibold">Agent unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p><Button className="mt-5" variant="outline" asChild><Link href="/agents"><ArrowLeft aria-hidden="true" />Back to agents</Link></Button></div>;

  const frozen = isStatus(agent.status, "frozen");
  const usage = ratioPercent(agent.spent_today, agent.rules?.max_per_day ?? "0");
  const allowed = agent.rules?.allowed_counterparty_ids;

  return (
    <>
      <Button variant="ghost" size="sm" asChild><Link href="/agents"><ArrowLeft aria-hidden="true" />Agent registry</Link></Button>
      {notice && <div role="status" className="mt-5 flex items-start gap-3 rounded-md border border-primary/45 bg-primary/15 px-4 py-3 text-sm text-primary-ink"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p className="flex-1">{notice}</p><button className="-m-2 grid size-9 cursor-pointer place-items-center rounded-md hover:bg-primary/15" onClick={() => setNotice(null)} aria-label="Dismiss notice"><X className="size-4" /></button></div>}
      {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive"><ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p className="flex-1">{error}</p><button className="-m-2 grid size-9 cursor-pointer place-items-center rounded-md hover:bg-destructive/10" onClick={() => setError(null)} aria-label="Dismiss error"><X className="size-4" /></button></div>}

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2"><p className="font-mono text-[10px] font-medium tracking-[0.14em] text-primary-ink uppercase">Agent account</p><StateBadge status={agent.status} /></div><h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{agent.name}</h1><p className="mt-2 font-mono text-[11px] text-muted-foreground">{agent.id}</p></div><div className="flex flex-wrap gap-2"><ConnectTelegram agent={agent} disabled={busy || frozen} onClosed={() => void refresh()} /><Button variant="outline" onClick={rotateKey} disabled={busy || frozen}><KeyRound aria-hidden="true" />Rotate key</Button>{frozen ? <Button size="lg" onClick={toggleAgent} disabled={busy}><Play aria-hidden="true" />Reactivate & issue key</Button> : <Dialog open={freezeOpen} onOpenChange={setFreezeOpen}><DialogTrigger asChild><Button variant="destructive" size="lg"><Pause aria-hidden="true" />Freeze agent now</Button></DialogTrigger><DialogContent className="rounded-lg sm:max-w-[480px]"><DialogHeader><DialogTitle className="font-heading text-lg">Freeze this agent?</DialogTitle><DialogDescription>{agent.name} will stop accepting payments and all existing keys will be revoked.</DialogDescription></DialogHeader><div className="my-4 rounded-md border border-destructive/20 bg-destructive/8 p-4 text-sm text-destructive"><p className="font-medium">This takes effect before the next payment.</p><p className="mt-1 text-xs leading-5">Unfreezing issues a new copy-once key. Old keys never become valid again.</p></div><DialogFooter><Button variant="outline" onClick={() => setFreezeOpen(false)}>Cancel</Button><Button variant="destructive" onClick={toggleAgent} disabled={busy}>{busy ? "Freezing" : "Freeze and revoke keys"}</Button></DialogFooter></DialogContent></Dialog>}</div></header>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-lg bg-card p-5 surface-ring"><WalletCards className="size-4 text-muted-foreground" aria-hidden="true" /><p className="mt-4 font-heading text-2xl font-semibold tabular-nums">{formatMoney(agent.balance, agent.base_currency)}</p><p className="mt-1 text-xs text-muted-foreground">Available balance</p></div><div className="rounded-lg bg-card p-5 surface-ring"><p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Spent today</p><p className="mt-4 font-heading text-2xl font-semibold tabular-nums">{formatMoney(agent.spent_today, agent.base_currency)}</p><Progress value={usage} className="mt-3 h-1.5 rounded-sm bg-secondary [&>div]:rounded-sm" /></div><div className="rounded-lg bg-card p-5 surface-ring"><p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Remaining today</p><p className="mt-4 font-heading text-2xl font-semibold tabular-nums">{formatMoney(agent.remaining_today, agent.base_currency)}</p><p className="mt-1 text-xs text-muted-foreground">UTC-day allowance</p></div><div className="rounded-lg bg-card p-5 surface-ring"><KeyRound className="size-4 text-muted-foreground" aria-hidden="true" /><p className="mt-4 truncate font-mono text-sm font-semibold">{agent.key_prefix ?? "revoked"}</p><p className="mt-2 text-xs text-muted-foreground">Key preview · full key shown only once</p></div></div>

      <ConnectedChats
        agent={agent}
        chats={chats}
        onDisconnected={(chat) => {
          setChats((items) => items.filter((item) => item.telegram_chat_id !== chat.telegram_chat_id));
          setNotice(`Chat disconnected. It can no longer spend from ${agent.name}.`);
        }}
      />

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-lg bg-card p-5 surface-ring" aria-labelledby="rules-heading"><div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-primary-ink" aria-hidden="true" /><h2 id="rules-heading" className="font-semibold">Spending limits</h2></div><p className="mt-2 text-sm text-muted-foreground">Changes apply to the very next payment attempt.</p><form className="mt-5 space-y-4" onSubmit={saveRules}><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="detail-transaction">Per transaction</Label><Input id="detail-transaction" name="transaction" type="number" min="0.01" step="0.01" defaultValue={agent.rules?.max_per_transaction} required /></div><div className="grid gap-2"><Label htmlFor="detail-daily">Per UTC day</Label><Input id="detail-daily" name="daily" type="number" min="0.01" step="0.01" defaultValue={agent.rules?.max_per_day} required /></div></div><div className="grid gap-2"><Label>Counterparty access</Label><Select value={counterpartyMode} onValueChange={(value) => setCounterpartyMode(value as typeof counterpartyMode)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="any">Any counterparty</SelectItem><SelectItem value="restricted">Approved agents only</SelectItem><SelectItem value="none">No counterparties</SelectItem></SelectContent></Select></div>{counterpartyMode === "restricted" && <div className="grid gap-2 sm:grid-cols-2">{agents.filter((item) => item.id !== agent.id).map((item) => <label key={item.id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md bg-inset px-3 text-sm surface-ring"><input type="checkbox" name="counterparties" value={item.id} defaultChecked={allowed?.includes(item.id)} className="size-4 accent-primary-ink" />{item.name}</label>)}</div>}{counterpartyMode === "none" && <p className="rounded-md border border-destructive/20 bg-destructive/8 p-3 text-xs leading-5 text-destructive">This agent will not be able to send payments.</p>}<Button className="w-full" type="submit" disabled={busy}>Save guardrails</Button></form></section>

        <section aria-labelledby="agent-ledger-heading"><div className="mb-4 flex items-end justify-between"><div><h2 id="agent-ledger-heading" className="font-semibold">Agent ledger</h2><p className="mt-1 text-sm text-muted-foreground">Executed and blocked attempts share one audit trail.</p></div><Button variant="ghost" size="sm" asChild><Link href={`/activity?agent=${agent.id}`}>Full ledger</Link></Button></div><div className="overflow-hidden rounded-lg bg-card surface-ring">{payments.slice(0, 8).map((payment) => { const blocked = isStatus(payment.status, "blocked"); return <article key={payment.id} className={cn("grid gap-3 border-b border-border p-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center", blocked && "bg-destructive/5")}><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{payment.memo ?? payment.kind.replaceAll("_", " ").toLowerCase()}</p><StateBadge status={payment.status} /></div><p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(payment.created_at)}</p>{blocked && <p className="mt-2 text-xs font-medium text-destructive">{payment.failure_reason ?? payment.rule_violated}</p>}</div><p className={cn("font-heading text-sm font-semibold tabular-nums", blocked && "text-destructive")}>{formatMoney(payment.amount, payment.currency)}</p></article>; })}{!payments.length && <div className="grid min-h-48 place-items-center p-6 text-center"><div><p className="text-sm font-medium">No payment attempts yet</p><p className="mt-1 text-xs text-muted-foreground">This agent’s audit trail will appear here.</p></div></div>}</div><Button className="mt-4 w-full" variant="outline" onClick={loadEarlier} disabled={!nextCursor}>Load earlier activity</Button></section>
      </div>
      <OneTimeKey key={issuedKey ?? "closed"} value={issuedKey} onClose={() => setIssuedKey(null)} />
    </>
  );
}
