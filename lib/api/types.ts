export const currencies = ["USD", "GHS", "EUR", "GBP", "NGN", "KES", "USDT", "USDC"] as const;

export type Currency = (typeof currencies)[number];
export type AgentStatus = "active" | "frozen" | string;
export type PaymentStatus = "approved" | "executed" | "blocked" | "failed" | string;

export interface Rules {
  max_per_transaction: string;
  max_per_day: string;
  allowed_counterparty_ids: string[] | null;
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  base_currency: Currency | string;
  balance: string;
  spent_today: string;
  remaining_today: string;
  rules: Rules | null;
  wewire_sub_customer_id: string;
  key_prefix: string | null;
  created_at: string | null;
}

export interface AgentCreate {
  name: string;
  base_currency?: Currency;
  initial_funding?: number | string | null;
  max_per_transaction?: number | string | null;
  max_per_day?: number | string | null;
}

export interface AgentCreated {
  agent: Agent;
  api_key: string;
}

export interface Payment {
  id: string;
  agent_id: string;
  kind: string;
  status: PaymentStatus;
  amount: string;
  currency: Currency | string;
  counterparty_agent_id: string | null;
  counterparty_detail: Record<string, unknown> | null;
  rule_violated: string | null;
  failure_reason: string | null;
  wewire_transaction_id: string | null;
  memo: string | null;
  created_at: string | null;
}

export interface ActivityPage {
  items: Payment[];
  next_cursor: string | null;
}

export interface FundInput {
  amount: number | string;
  currency?: Currency | null;
}

export interface FundResult {
  agent_id: string;
  amount: string;
  currency: string;
  balance: string;
  wewire_transaction_id: string | null;
}

export interface RulesInput {
  max_per_transaction: number | string;
  max_per_day: number | string;
  allowed_counterparty_ids?: string[] | null;
}

export interface KillSwitchResult {
  agent_id: string;
  status: string;
  keys_revoked: number | null;
  wewire_mirrored: boolean;
  api_key: string | null;
}

export interface KeyRotated {
  api_key: string;
}

export interface OwnerStats {
  total_balance?: string;
  active_agents?: number;
  spent_today?: string;
  blocked_today?: number;
  [key: string]: unknown;
}
