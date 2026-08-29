import { auth } from "@clerk/nextjs/server";
import { KeruxClient } from "@/lib/api/client";

export async function createOwnerClient() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );

  if (!clerkConfigured) return new KeruxClient(baseUrl);

  const session = await auth();
  return new KeruxClient(baseUrl, () => session.getToken());
}
