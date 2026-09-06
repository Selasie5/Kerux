import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { KeruxMark } from "@/components/kerux-mark";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <div className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md rounded-lg bg-card p-6 text-center surface-ring"><div className="flex justify-center"><KeruxMark /></div><h1 className="mt-6 text-xl font-semibold">Clerk is not configured locally</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Add the Clerk publishable and secret keys to use sign-in. The dashboard can still talk to a backend running with DEV_OWNER_ID.</p><Button className="mt-5" asChild><Link href="/">Open local control room</Link></Button></div></div>;
  }
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,.8fr)_minmax(520px,1.2fr)]"><section className="hidden border-r border-border bg-inset p-10 lg:flex lg:flex-col"><KeruxMark /><div className="mt-auto max-w-md"><p className="font-mono text-[10px] tracking-[0.14em] text-primary-ink uppercase">Owner access</p><h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Policy control before money moves.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in to review every agent wallet, audit blocked attempts, and engage the kill switch.</p></div></section><section className="flex items-center justify-center p-6"><SignIn /></section></main>
  );
}
