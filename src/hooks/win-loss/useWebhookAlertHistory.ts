import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WebhookAlertKind } from "./useWebhookAlerts";

export interface WebhookAlertHistoryRow {
  id: string;
  subscription_id: string;
  subscription_url: string | null;
  kind: WebhookAlertKind;
  request_id: string | null;
  fired_at: string;
  suppressed: boolean;
  suppress_reason: string | null;
  details: Record<string, unknown>;
}

export interface AlertHistoryFilters {
  subscriptionId?: string | null;
  kind?: WebhookAlertKind | null;
  /** "all" | "fired" | "suppressed" */
  status?: "all" | "fired" | "suppressed";
  /** ISO timestamp lower bound. Defaults to now-7d. */
  since?: string | null;
  limit?: number;
}

interface RawRow {
  id: string;
  subscription_id: string;
  kind: WebhookAlertKind;
  request_id: string | null;
  fired_at: string;
  suppressed: boolean | null;
  suppress_reason: string | null;
  details: Record<string, unknown> | null;
  winloss_webhook_subscriptions: { url: string | null } | null;
}

/**
 * Loads the audit trail of webhook alerts (both fired and suppressed),
 * joined with the subscription URL. Filterable by subscription, alert kind,
 * fired/suppressed status and time window.
 */
export function useWebhookAlertHistory(filters: AlertHistoryFilters) {
  const limit = filters.limit ?? 200;
  const since = filters.since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const status = filters.status ?? "all";

  return useQuery<WebhookAlertHistoryRow[]>({
    queryKey: [
      "winloss-webhook-alert-history",
      filters.subscriptionId ?? null,
      filters.kind ?? null,
      status,
      since,
      limit,
    ],
    staleTime: 30_000,
    queryFn: async () => {
      // The generated types for `winloss_webhook_alerts` don't yet include
      // the new `suppressed` / `suppress_reason` columns we just added, so
      // we cast the builder to keep the file type-safe without touching the
      // auto-generated types module.
      let q = (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            gte: (c: string, v: string) => {
              order: (c: string, o: { ascending: boolean }) => {
                limit: (n: number) => Promise<{ data: RawRow[] | null; error: Error | null }>;
              } & {
                eq: (c: string, v: string | boolean) => {
                  order: (c: string, o: { ascending: boolean }) => {
                    limit: (n: number) => Promise<{ data: RawRow[] | null; error: Error | null }>;
                  } & {
                    eq: (c: string, v: string | boolean) => {
                      order: (c: string, o: { ascending: boolean }) => {
                        limit: (n: number) => Promise<{ data: RawRow[] | null; error: Error | null }>;
                      } & {
                        eq: (c: string, v: string | boolean) => {
                          order: (c: string, o: { ascending: boolean }) => {
                            limit: (n: number) => Promise<{ data: RawRow[] | null; error: Error | null }>;
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      })
        .from("winloss_webhook_alerts")
        .select(
          "id, subscription_id, kind, request_id, fired_at, suppressed, suppress_reason, details, winloss_webhook_subscriptions(url)",
        )
        .gte("fired_at", since);

      // chained eq filters — apply only those provided
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let chain: any = q;
      if (filters.subscriptionId) chain = chain.eq("subscription_id", filters.subscriptionId);
      if (filters.kind) chain = chain.eq("kind", filters.kind);
      if (status === "fired") chain = chain.eq("suppressed", false);
      else if (status === "suppressed") chain = chain.eq("suppressed", true);

      const { data, error } = await chain
        .order("fired_at", { ascending: false })
        .limit(limit);
      if (error) throw error;

      return (data ?? []).map((r: RawRow): WebhookAlertHistoryRow => ({
        id: r.id,
        subscription_id: r.subscription_id,
        subscription_url: r.winloss_webhook_subscriptions?.url ?? null,
        kind: r.kind,
        request_id: r.request_id,
        fired_at: r.fired_at,
        suppressed: r.suppressed === true,
        suppress_reason: r.suppress_reason,
        details: r.details ?? {},
      }));
    },
  });
}
