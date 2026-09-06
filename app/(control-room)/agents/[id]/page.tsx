import { AgentDetailPage } from "@/app/_components/agent-detail-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentDetailPage agentId={id} />;
}
