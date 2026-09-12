// Only GHST. WeWire will not provision a fiat wallet for a sub-customer until
// KYC is approved, so an agent created as USD, GHS, EUR -- anything but a
// stablecoin -- fails at the rail with CURRENCY_NOT_SUPPORTED. Offering those
// options means the failure is a dropdown away rather than impossible.
// Restore the rest once KYC is approved; nothing else has to change.
export const currencies = ["GHST"] as const;

export type Currency = (typeof currencies)[number];
export type AgentStatus = "active" | "frozen" | string;
export type PaymentStatus = "APPROVED" | "SUBMITTED" | "EXECUTED" | "BLOCKED" | "FAILED" | string;

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
  initial_funding?: string | null;
  max_per_transaction?: string | null;
  max_per_day?: string | null;
}

export interface AgentCreated {
  agent: Agent;
  api_key: string;
  /** Set when the agent was created but its opening balance did not arrive.
   *  The agent exists on the rail and the key is real, so this is a warning to
   *  show alongside the key, never a reason to discard it. */
  funding_error?: string | null;
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
  amount: string;
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
  max_per_transaction: string;
  max_per_day: string;
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
  agents: number;
  frozen: number;
  blocked_today: number;
  executed_today: number;
}

export interface HealthStatus {
  status?: string;
  wewire_mode?: string;
  wewire_env?: string;
  database_configured?: boolean;
  clerk_configured?: boolean;
  dev_auth?: boolean;
  [key: string]: unknown;
}

export type OwnerEventType =
  | "payment"
  | "agent.created"
  | "agent.funded"
  | "agent.frozen"
  | "agent.unfrozen"
  | "agent.rules_updated";

/** A one-time link a customer taps to bind one agent to one Telegram chat.
 *  Single-use and short-lived, so mint on demand rather than caching one. */
export type LinkToken = {
  agent_id: string;
  agent_name: string;
  token: string;
  /** Null when the API has no TELEGRAM_BOT_USERNAME configured. */
  deep_link: string | null;
  expires_at: string;
};
