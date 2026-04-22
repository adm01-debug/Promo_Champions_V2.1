/**
 * Diagnostic helper for `validateReplayIds` failures.
 *
 * Builds a structured payload (reason, counts, truncated samples) and emits
 * it via `console.warn` ONLY in dev builds to comply with the project's
 * production no-console rule. In production it's a no-op aside from
 * returning the structured object — useful for future remote-logging hookups.
 */

import { MAX_REPLAY_IDS } from "./validateReplayIds";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReplayValidationReason = "empty" | "over_limit" | "invalid_uuid" | "unknown";

export interface ReplayValidationDiagnostic {
  reason: ReplayValidationReason;
  message: string;
  totalRequested: number;
  uniqueCount: number;
  duplicatesRemoved: number;
  invalidCount: number;
  invalidSamples: string[];
  limit: number;
  context?: Record<string, unknown>;
}

const truncate = (id: unknown): string => {
  if (typeof id !== "string") return `<${typeof id}>`;
  if (id.length === 0) return "<empty>";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
};

export function buildReplayValidationDiagnostic(
  ids: readonly unknown[],
  message: string,
  context?: Record<string, unknown>,
): ReplayValidationDiagnostic {
  const arr = Array.isArray(ids) ? ids : [];
  const unique = Array.from(new Set(arr));
  const invalid = unique.filter((id) => typeof id !== "string" || !UUID_RE.test(id));

  let reason: ReplayValidationReason;
  if (unique.length === 0) reason = "empty";
  else if (unique.length > MAX_REPLAY_IDS) reason = "over_limit";
  else if (invalid.length > 0) reason = "invalid_uuid";
  else reason = "unknown";

  return {
    reason,
    message,
    totalRequested: arr.length,
    uniqueCount: unique.length,
    duplicatesRemoved: arr.length - unique.length,
    invalidCount: invalid.length,
    invalidSamples: invalid.slice(0, 5).map(truncate),
    limit: MAX_REPLAY_IDS,
    context,
  };
}

export function logReplayValidationFailure(
  ids: readonly unknown[],
  message: string,
  context?: Record<string, unknown>,
): ReplayValidationDiagnostic {
  const diag = buildReplayValidationDiagnostic(ids, message, context);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn("[winloss.replay] validation failed", diag);
  }
  return diag;
}
