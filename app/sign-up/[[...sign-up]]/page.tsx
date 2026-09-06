import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { KeruxMark } from "@/components/kerux-mark";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <div className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md rounded-lg bg-card p-6 text-center surface-ring"><div className="flex justify-center"><KeruxMark /></div><h1 className="mt-6 text-xl font-semibold">Sign-in is unavailable</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Please contact your administrator to enable account creation.</p><Button className="mt-5" asChild><Link href="/">Back to home</Link></Button></div></div>;
  }
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,.8fr)_minmax(520px,1.2fr)]"><section className="hidden border-r border-border bg-inset p-10 lg:flex lg:flex-col"><KeruxMark /><div className="mt-auto max-w-md"><p className="font-mono text-[10px] tracking-[0.14em] text-primary-ink uppercase">Create owner workspace</p><h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Give every autonomous agent a hard boundary.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Manage your agents, payments, and spending limits in one workspace.</p></div></section><section className="flex items-center justify-center p-6"><SignUp fallbackRedirectUrl="/dashboard" /></section></main>
  );
}
