"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bot, Gauge, Menu, RefreshCw, Settings, ShieldCheck } from "lucide-react";
import { AuthControls } from "@/components/auth-controls";
import { KeruxMark } from "@/components/kerux-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useOwnerApi } from "@/lib/api/provider";
import type { HealthStatus, OwnerStats } from "@/lib/api/types";

const navItems = [
  { label: "Overview", icon: Gauge, href: "/" },
  { label: "Agents", icon: Bot, href: "/agents" },
  { label: "Activity", icon: Activity, href: "/activity" },
  { label: "Guardrails", icon: ShieldCheck, href: "/guardrails" },
] as const;

function Navigation({ pathname, health, stats, latency, onNavigate, mobile = false }: { pathname: string; health: HealthStatus | null; stats: OwnerStats | null; latency: number | null; onNavigate?: () => void; mobile?: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", mobile ? "px-4" : "px-5")}>
        <KeruxMark />
        <Badge variant="outline" className="ml-auto border-primary/45 bg-primary/20 text-primary-ink">beta</Badge>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5" aria-label="Primary navigation">
        <p className="mb-2 px-2 font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Control room</p>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-[background-color,color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active ? "bg-sidebar-accent text-sidebar-foreground surface-ring" : "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-4" strokeWidth={active ? 2 : 1.5} aria-hidden="true" />
              {item.label}
              {item.label === "Activity" && <span className="ml-auto font-mono text-[10px] text-primary-ink tabular-nums">{String((stats?.blocked_today ?? 0) + (stats?.executed_today ?? 0)).padStart(2, "0")}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-lg bg-card p-3 surface-ring">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs font-medium">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            WeWire {health?.wewire_mode ?? "checking"}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{latency === null ? "—" : `${latency}ms`}</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{health?.wewire_mode === "mock" ? "Mock mode: no real rail calls." : health ? "Rail configured. Policy checks remain local-first." : "Checking the backend and rail mode."}</p>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-[background-color,color] duration-150 hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            pathname === "/settings" && "bg-sidebar-accent text-sidebar-foreground surface-ring",
          )}
        >
          <Settings className="size-4" strokeWidth={pathname === "/settings" ? 2 : 1.5} aria-hidden="true" />
          Settings
        </Link>
      </div>
    </div>
  );
}

export function ControlRoomShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [health, setHealth] = React.useState<HealthStatus | null>(null);
  const [stats, setStats] = React.useState<OwnerStats | null>(null);
  const [latency, setLatency] = React.useState<number | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const { client, authReady } = useOwnerApi();

  const refreshStatus = React.useCallback(async () => {
    if (!authReady) return;
    setRefreshing(true);
    const started = performance.now();
    const [healthResult, statsResult] = await Promise.allSettled([client.health(), client.stats()]);
    setLatency(Math.round(performance.now() - started));
    if (healthResult.status === "fulfilled") setHealth(healthResult.value);
    if (statsResult.status === "fulfilled") setStats(statsResult.value);
    setRefreshing(false);
  }, [authReady, client]);

  React.useEffect(() => {
    const timer = setTimeout(() => void refreshStatus(), 0);
    return () => clearTimeout(timer);
  }, [refreshStatus]);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border bg-sidebar lg:block">
        <Navigation pathname={pathname} health={health} stats={stats} latency={latency} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
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
              <Navigation pathname={pathname} health={health} stats={stats} latency={latency} mobile onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="lg:hidden"><KeruxMark /></div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-medium">Owner workspace</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{health?.dev_auth ? "development auth" : "Clerk protected"} · {health?.wewire_env ?? "environment pending"}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Refresh rail status" onClick={refreshStatus} disabled={refreshing}>
              <RefreshCw className={cn(refreshing && "animate-spin motion-reduce:animate-none")} aria-hidden="true" />
            </Button>
            <AuthControls />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
