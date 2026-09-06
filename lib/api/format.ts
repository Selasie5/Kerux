import Decimal from "decimal.js";

const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function normalizeStatus(status: string | null | undefined) {
  return status?.toLowerCase() ?? "unknown";
}

export function isStatus(status: string | null | undefined, expected: string) {
  return normalizeStatus(status) === expected.toLowerCase();
}

export function formatMoney(amount: string, currency: string) {
  let formatted = amount;
  try {
    formatted = decimalFormatter.format(new Decimal(amount).toNumber());
  } catch {
    // Preserve the API value if it cannot be parsed; money is never mutated here.
  }
  return `${formatted} ${currency}`;
}

export function sumMoney(amounts: string[]) {
  return amounts.reduce((total, amount) => total.plus(amount), new Decimal(0)).toFixed(2);
}

export function ratioPercent(numerator: string, denominator: string) {
  try {
    const max = new Decimal(denominator);
    if (max.isZero()) return 0;
    return Decimal.min(100, new Decimal(numerator).div(max).mul(100)).toNumber();
  } catch {
    return 0;
  }
}

export function parseUtcTimestamp(value: string | null) {
  if (!value) return null;
  const hasZone = /(?:Z|[+-]\d\d:\d\d)$/i.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTimestamp(value: string | null, options?: Intl.DateTimeFormatOptions) {
  const date = parseUtcTimestamp(value);
  if (!date) return "Unknown time";
  return new Intl.DateTimeFormat("en-US", options ?? {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function apiKeyPrefix(apiKey: string) {
  return apiKey.slice(0, 15);
}
