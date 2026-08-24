import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AttemptBucket {
  attempt: number;
  failures: number;
  total: number;
}

export interface FailureReasonBucket {
  /** Stable key used for chart dataKey + react keys. Format: `status:<code>` or `network`. */
  key: string;
  /** Human-friendly label, e.g. "HTTP 500", "Timeout/Rede". */
  label: string;
  /** HTTP status code when known; null for network/timeout/unknown failures. */
  status: number | null;
  /** Number of failed attempts grouped under this reason. */
  count: number;
  /** Most recent error_message snippet seen for this bucket (truncated to 140 chars). */
  sampleMessage: string | null;
}

export interface WebhookDeliveryStats {
  total: number;
  succeeded: number;
  failed: number;
  successRate: number;
  failuresByAttempt: AttemptBucket[];
  /** Top failure reasons sorted desc by count. Capped to 6 buckets, rest folded into "Outros". */
  failureReasons: FailureReasonBucket[];
}

export type WebhookStatsWindow = "24h" | "7d" | "30d";

const WINDOW_HOURS: Record<WebhookStatsWindow, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

const MAX_REASON_BUCKETS = 6;

interface FailureRow {
  attempt: number;
  succeeded: boolean;
  status: number | null;
  error_message: string | null;
}

/** Map a delivery row to a stable reason key + display label. */
function classifyFailure(row: FailureRow): { key: string; label: string; status: number | null } {
  const code = row.status ?? 0;
  // status === 0 is the dispatcher's sentinel for "request never produced an HTTP response"
  // (network failure, DNS error, timeout, abort). Treat anything outside 100..599 the same way.
  if (code < 100 || code > 599) {
    return { key: "network", label: "Timeout/Rede", status: null };
  }
  return { key: `status:${code}`, label: `HTTP ${code}`, status: code };
}

function truncate(s: string | null, max = 140): string | null {
  if (!s) return null;
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function useWebhookDeliveryStats(
  subscriptionId?: string | null,
  windowKey: WebhookStatsWindow = "7d",
) {
  return useQuery({
    queryKey: ["winloss-webhook-delivery-stats", subscriptionId ?? "all", windowKey],
    staleTime: 30_000,
    queryFn: async (): Promise<WebhookDeliveryStats> => {
      const hours = WINDOW_HOURS[windowKey];
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from("winloss_webhook_deliveries")
        .select("attempt, succeeded, status, error_message, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(2000);

      if (subscriptionId) query = query.eq("subscription_id", subscriptionId);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as FailureRow[];
      const total = rows.length;
      const succeeded = rows.filter((r) => r.succeeded).length;
      const failed = total - succeeded;
      const successRate = total === 0 ? 0 : (succeeded / total) * 100;

      const buckets: AttemptBucket[] = [1, 2, 3].map((attempt) => {
        const inAttempt = rows.filter((r) => r.attempt === attempt);
        return {
          attempt,
          failures: inAttempt.filter((r) => !r.succeeded).length,
          total: inAttempt.length,
        };
      });

      // ── Failure reason breakdown ──────────────────────────────────────────
      // Rows are already ordered by created_at DESC, so the first error_message
      // we see per bucket is the most recent sample.
      const reasonMap = new Map<string, FailureReasonBucket>();
      for (const row of rows) {
        if (row.succeeded) continue;
        const { key, label, status } = classifyFailure(row);
        const existing = reasonMap.get(key);
        if (existing) {
          existing.count += 1;
          if (!existing.sampleMessage) existing.sampleMessage = truncate(row.error_message);
        } else {
          reasonMap.set(key, {
            key,
            label,
            status,
            count: 1,
            sampleMessage: truncate(row.error_message),
          });
        }
      }

      const sorted = Array.from(reasonMap.values()).sort((a, b) => b.count - a.count);
      let failureReasons: FailureReasonBucket[];
      if (sorted.length <= MAX_REASON_BUCKETS) {
        failureReasons = sorted;
      } else {
        const top = sorted.slice(0, MAX_REASON_BUCKETS - 1);
        const restCount = sorted
          .slice(MAX_REASON_BUCKETS - 1)
          .reduce((acc, b) => acc + b.count, 0);
        failureReasons = [
          ...top,
          { key: "other", label: "Outros", status: null, count: restCount, sampleMessage: null },
        ];
      }

      return {
        total,
        succeeded,
        failed,
        successRate,
        failuresByAttempt: buckets,
        failureReasons,
      };
    },
  });
}
