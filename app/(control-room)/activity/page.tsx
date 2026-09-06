import { ActivityPage } from "@/app/_components/control-room-pages";

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; agent?: string }> }) {
  const { status, agent } = await searchParams;
  return <ActivityPage initialStatus={status ?? "all"} initialAgentId={agent ?? "all"} />;
}
