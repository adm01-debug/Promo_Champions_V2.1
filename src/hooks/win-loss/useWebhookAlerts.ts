import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WebhookAlertKind =
  | "consecutive_failures"
  | "high_retry_rate"
  | "attempts_exhausted";

export interface WebhookAlert {
  id: string;
  subscription_id: string;
  kind: WebhookAlertKind;
  details: Record<string, unknown>;
  fired_at: string;
}

const RECENT_HOURS = 24;
const ACTIVE_MINUTES = 60;

export function useWebhookAlerts(subscriptionId?: string | null) {
  return useQuery({
    queryKey: ["winloss-webhook-alerts", subscriptionId ?? "all"],
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async (): Promise<WebhookAlert[]> => {
      const since = new Date(Date.now() - RECENT_HOURS * 60 * 60 * 1000).toISOString();
      let query = (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            gte: (c: string, v: string) => {
              order: (c: string, o: { ascending: boolean }) => {
                limit: (n: number) => Promise<{ data: WebhookAlert[] | null; error: Error | null }>;
              };
            } & {
              eq: (c: string, v: string) => {
                order: (c: string, o: { ascending: boolean }) => {
                  limit: (n: number) => Promise<{ data: WebhookAlert[] | null; error: Error | null }>;
                };
              };
            };
          };
        };
      })
        .from("winloss_webhook_alerts")
        .select("id, subscription_id, kind, details, fired_at")
        .gte("fired_at", since);

      const final = subscriptionId
        ? query.eq("subscription_id", subscriptionId).order("fired_at", { ascending: false }).limit(50)
        : query.order("fired_at", { ascending: false }).limit(200);

      const { data, error } = await final;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function isAlertActive(alert: WebhookAlert): boolean {
  return Date.now() - new Date(alert.fired_at).getTime() < ACTIVE_MINUTES * 60 * 1000;
}

export function activeAlertsBySubscription(alerts: WebhookAlert[]): Map<string, WebhookAlert[]> {
  const map = new Map<string, WebhookAlert[]>();
  for (const a of alerts) {
    if (!isAlertActive(a)) continue;
    const arr = map.get(a.subscription_id) ?? [];
    arr.push(a);
    map.set(a.subscription_id, arr);
  }
  return map;
}
