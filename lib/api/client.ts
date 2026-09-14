import type {
  ActivityPage,
  Agent,
  AgentCreate,
  AgentCreated,
  ConnectedChat,
  FundInput,
  FundResult,
  HealthStatus,
  KeyRotated,
  KillSwitchResult,
  LinkToken,
  OwnerStats,
  Rules,
  RulesInput,
} from "@/lib/api/types";

export type TokenProvider = () => Promise<string | null>;

type ErrorEnvelope = {
  error?: { code?: string; message?: string };
  detail?: string | Array<{ msg?: string }>;
};

export class KeruxApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "KeruxApiError";
  }
}

export class KeruxClient {
  constructor(
    private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://kerux-backend.onrender.com",
    private readonly getToken?: TokenProvider,
  ) {}

  token() {
    return this.getToken?.() ?? Promise.resolve(null);
  }

  eventsUrl(token?: string | null) {
    const url = new URL("/v1/owner/events", this.baseUrl);
    if (token) url.searchParams.set("token", token);
    return url.toString();
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await this.getToken?.();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const details = await response.json().catch(() => null) as ErrorEnvelope | null;
      const apiError = details?.error;
      const validationMessage = Array.isArray(details?.detail)
        ? details.detail.map((item) => item.msg).filter(Boolean).join(" ")
        : details?.detail;
      throw new KeruxApiError(
        apiError?.message ?? validationMessage ?? `Kerux API request failed with ${response.status}`,
        response.status,
        apiError?.code,
        details,
      );
    }

    // A 204 has no body to parse; `json()` on it throws.
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  listAgents() {
    return this.request<Agent[]>("/v1/owner/agents");
  }

  health() {
    return this.request<HealthStatus>("/health");
  }

  healthWeWire() {
    return this.request<Record<string, unknown>>("/health/wewire");
  }

  getAgent(agentId: string) {
    return this.request<Agent>(`/v1/owner/agents/${agentId}`);
  }

  createAgent(input: AgentCreate) {
    return this.request<AgentCreated>("/v1/owner/agents", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  fundAgent(agentId: string, input: FundInput) {
    return this.request<FundResult>(`/v1/owner/agents/${agentId}/fund`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  setRules(agentId: string, input: RulesInput) {
    return this.request<Rules>(`/v1/owner/agents/${agentId}/rules`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  freezeAgent(agentId: string) {
    return this.request<KillSwitchResult>(`/v1/owner/agents/${agentId}/freeze`, { method: "POST" });
  }

  unfreezeAgent(agentId: string) {
    return this.request<KillSwitchResult>(`/v1/owner/agents/${agentId}/unfreeze`, { method: "POST" });
  }

  /** Mint a Connect-to-Telegram link. Single-use, expires in minutes. */
  createLinkToken(agentId: string) {
    return this.request<LinkToken>(`/v1/owner/agents/${agentId}/link-tokens`, {
      method: "POST",
    });
  }

  /** The Telegram chats spending as this agent, most recently connected first. */
  listChats(agentId: string) {
    return this.request<ConnectedChat[]>(`/v1/owner/agents/${agentId}/chats`);
  }

  /** Stop one chat spending as this agent. The agent and its other chats carry on. */
  disconnectChat(agentId: string, chatId: string) {
    return this.request<void>(`/v1/owner/agents/${agentId}/chats/${encodeURIComponent(chatId)}`, {
      method: "DELETE",
    });
  }

  rotateKey(agentId: string) {
    return this.request<KeyRotated>(`/v1/owner/agents/${agentId}/keys/rotate`, { method: "POST" });
  }

  agentTransactions(agentId: string, params?: { status?: string; limit?: number; before?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.before) query.set("before", params.before);
    const suffix = query.size ? `?${query}` : "";
    return this.request<ActivityPage>(`/v1/owner/agents/${agentId}/transactions${suffix}`);
  }

  activity(params?: { status?: string; limit?: number; before?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.before) query.set("before", params.before);
    const suffix = query.size ? `?${query}` : "";
    return this.request<ActivityPage>(`/v1/owner/activity${suffix}`);
  }

  stats() {
    return this.request<OwnerStats>("/v1/owner/stats");
  }
}

export function createBrowserOwnerClient(getToken?: TokenProvider) {
  return new KeruxClient(undefined, getToken);
}
