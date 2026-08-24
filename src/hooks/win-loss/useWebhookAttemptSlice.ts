import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WebhookStatsWindow } from "@/hooks/win-loss/useWebhookDeliveryStats";

const WINDOW_HOURS: Record<WebhookStatsWindow, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

export interface AttemptDeliveryRow {
  id: string;
  subscription_id: string;
  subscription_url: string | null;
  event: string;
  attempt: number;
  status: number;
  succeeded: boolean;
  error_message: string | null;
  duration_ms: number;
  created_at: string;
}

export interface AttemptSliceData {
  rows: AttemptDeliveryRow[];
  /** Aggregated by subscription, sorted desc by failure count. */
  subscriptions: Array<{
    subscription_id: string;
    subscription_url: string | null;
    failures: number;
    total: number;
  }>;
  truncated: boolean;
}

const HARD_LIMIT = 500;

/**
 * Loads the failed deliveries for a specific attempt within the chosen time window,
 * joined with their subscription URL for display in the drawer.
 *
 * Disabled until `attempt` is non-null so opening/closing the drawer toggles the query.
 */
export function useWebhookAttemptSlice(
  attempt: number | null,
  windowKey: WebhookStatsWindow,
) {
  return useQuery({
    queryKey: ["winloss-webhook-attempt-slice", attempt, windowKey],
    enabled: attempt !== null,
    staleTime: 15_000,
    queryFn: async (): Promise<AttemptSliceData> => {
      if (attempt === null) return { rows: [], subscriptions: [], truncated: false };

      const since = new Date(
        Date.now() - WINDOW_HOURS[windowKey] * 60 * 60 * 1000,
      ).toISOString();

      const { data, error } = await supabase
        .from("winloss_webhook_deliveries")
        .select(
          "id, subscription_id, event, attempt, status, succeeded, error_message, duration_ms, created_at, winloss_webhook_subscriptions(url)",
        )
        .eq("attempt", attempt)
        .eq("succeeded", false)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(HARD_LIMIT + 1);

      if (error) throw error;

      const raw = (data ?? []) as Array<{
        id: string;
        subscription_id: string;
        event: string;
        attempt: number;
        status: number;
        succeeded: boolean;
        error_message: string | null;
        duration_ms: number;
        created_at: string;
        winloss_webhook_subscriptions: { url: string | null } | null;
      }>;

      const truncated = raw.length > HARD_LIMIT;
      const trimmed = truncated ? raw.slice(0, HARD_LIMIT) : raw;

      const rows: AttemptDeliveryRow[] = trimmed.map((r) => ({
        id: r.id,
        subscription_id: r.subscription_id,
        subscription_url: r.winloss_webhook_subscriptions?.url ?? null,
        event: r.event,
        attempt: r.attempt,
        status: r.status,
        succeeded: r.succeeded,
        error_message: r.error_message,
        duration_ms: r.duration_ms,
        created_at: r.created_at,
      }));

      const subMap = new Map<string, { url: string | null; failures: number }>();
      for (const row of rows) {
        const existing = subMap.get(row.subscription_id);
        if (existing) existing.failures += 1;
        else subMap.set(row.subscription_id, { url: row.subscription_url, failures: 1 });
      }

      const subscriptions = Array.from(subMap.entries())
        .map(([id, v]) => ({
          subscription_id: id,
          subscription_url: v.url,
          failures: v.failures,
          total: v.failures, // only failures are loaded in this slice
        }))
        .sort((a, b) => b.failures - a.failures);

      return { rows, subscriptions, truncated };
    },
  });
}
