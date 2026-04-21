import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AttemptBucket {
  attempt: number;
  failures: number;
  total: number;
}

export interface WebhookDeliveryStats {
  total: number;
  succeeded: number;
  failed: number;
  successRate: number;
  failuresByAttempt: AttemptBucket[];
}

const WINDOW_DAYS = 7;

export function useWebhookDeliveryStats(subscriptionId?: string | null) {
  return useQuery({
    queryKey: ["winloss-webhook-delivery-stats", subscriptionId ?? "all"],
    staleTime: 30_000,
    queryFn: async (): Promise<WebhookDeliveryStats> => {
      const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from("winloss_webhook_deliveries")
        .select("attempt, succeeded")
        .gte("created_at", since)
        .limit(2000);

      if (subscriptionId) query = query.eq("subscription_id", subscriptionId);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as Array<{ attempt: number; succeeded: boolean }>;
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

      return { total, succeeded, failed, successRate, failuresByAttempt: buckets };
    },
  });
}
