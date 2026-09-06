"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { OwnerApiProvider } from "@/lib/api/provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <OwnerApiProvider>
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
    </OwnerApiProvider>
  );
}
