"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthControls() {
  if (!clerkConfigured) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-xs text-muted-foreground" title="Add Clerk keys to enable authentication">
        <span className="grid size-6 place-items-center rounded-sm bg-accent text-accent-foreground">
          <ShieldCheck className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Demo workspace</span>
      </div>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <SignInButton mode="modal"><Button variant="outline">Sign in</Button></SignInButton>
          <SignUpButton mode="modal"><Button>Sign up</Button></SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
