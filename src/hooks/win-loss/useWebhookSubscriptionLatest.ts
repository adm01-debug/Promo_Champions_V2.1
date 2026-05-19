import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WebhookStatsWindow } from "@/hooks/win-loss/useWebhookDeliveryStats";

const WINDOW_HOURS: Record<WebhookStatsWindow, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

export interface SubscriptionLatestRow {
  subscription_id: string;
  subscription_url: string | null;
  last_event: string | null;
  last_attempt: number | null;
  last_status: number | null;
  last_succeeded: boolean | null;
  last_duration_ms: number | null;
  last_error_message: string | null;
  last_request_id: string | null;
  last_at: string;
  total: number;
  failures: number;
}

interface RawRow {
  subscription_id: string;
  event: string;
  attempt: number;
  status: number;
  succeeded: boolean;
  duration_ms: number;
  error_message: string | null;
  request_id: string | null;
  created_at: string;
  winloss_webhook_subscriptions: { url: string | null } | null;
}

/**
 * Aggregates the most recent delivery per subscription within the window,
 * plus total/failure counts to surface bottlenecks at a glance.
 */
export function useWebhookSubscriptionLatest(windowKey: WebhookStatsWindow = "7d") {
  return useQuery({
    queryKey: ["winloss-webhook-subscription-latest", windowKey],
    staleTime: 30_000,
    queryFn: async (): Promise<SubscriptionLatestRow[]> => {
      const since = new Date(
        Date.now() - WINDOW_HOURS[windowKey] * 60 * 60 * 1000,
      ).toISOString();

      const { data, error } = await supabase
        .from("winloss_webhook_deliveries")
        .select(
          "subscription_id, event, attempt, status, succeeded, duration_ms, error_message, request_id, created_at, winloss_webhook_subscriptions(url)",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(2000);

      if (error) throw error;
      const rows = (data ?? []) as unknown as RawRow[];

      const map = new Map<string, SubscriptionLatestRow>();
      for (const r of rows) {
        const existing = map.get(r.subscription_id);
        if (!existing) {
          map.set(r.subscription_id, {
            subscription_id: r.subscription_id,
            subscription_url: r.winloss_webhook_subscriptions?.url ?? null,
            last_event: r.event,
            last_attempt: r.attempt,
            last_status: r.status,
            last_succeeded: r.succeeded,
            last_duration_ms: r.duration_ms,
            last_error_message: r.error_message,
            last_request_id: r.request_id,
            last_at: r.created_at,
            total: 1,
            failures: r.succeeded ? 0 : 1,
          });
        } else {
          existing.total += 1;
          if (!r.succeeded) existing.failures += 1;
        }
      }

      // Sort: failures first (desc), then most recent activity.
      return Array.from(map.values()).sort((a, b) => {
        if (b.failures !== a.failures) return b.failures - a.failures;
        return new Date(b.last_at).getTime() - new Date(a.last_at).getTime();
      });
    },
  });
}
