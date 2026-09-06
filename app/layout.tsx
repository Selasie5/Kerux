import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import "@fontsource/fira-sans/400.css";
import "@fontsource/fira-sans/500.css";
import "@fontsource/fira-sans/600.css";
import "@fontsource-variable/fira-code";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "Kerux — Accounts for AI agents",
  description: "Programmable money accounts and guardrails for autonomous agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const content = <AppProviders>{children}</AppProviders>;

  return (
    <html lang="en" className="font-sans">
      <body>
        {clerkPublishableKey
          ? <ClerkProvider publishableKey={clerkPublishableKey} appearance={{ theme: shadcn }}>{content}</ClerkProvider>
          : content}
      </body>
    </html>
  );
}
