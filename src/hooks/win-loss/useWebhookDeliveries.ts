import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WebhookDelivery {
  id: string;
  subscription_id: string;
  event: string;
  attempt: number;
  status: number;
  error_message: string | null;
  duration_ms: number;
  succeeded: boolean;
  created_at: string;
  payload: Record<string, unknown>;
}

export function useWebhookDeliveries(subscriptionId: string | null, limit = 20) {
  return useQuery({
    queryKey: ["winloss-webhook-deliveries", subscriptionId, limit],
    enabled: !!subscriptionId,
    staleTime: 15_000,
    queryFn: async (): Promise<WebhookDelivery[]> => {
      if (!subscriptionId) return [];
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, v: string) => {
              order: (c: string, o: { ascending: boolean }) => {
                limit: (n: number) => Promise<{ data: WebhookDelivery[] | null; error: Error | null }>;
              };
            };
          };
        };
      })
        .from("winloss_webhook_deliveries")
        .select("id, subscription_id, event, attempt, status, error_message, duration_ms, succeeded, created_at, payload")
        .eq("subscription_id", subscriptionId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}
