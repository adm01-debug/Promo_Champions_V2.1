import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateReplayIds } from "./validateReplayIds";

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
  const qc = useQueryClient();

  const query = useQuery({
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

  const replay = useMutation({
    mutationFn: async (deliveryIds: string[]) => {
      const validation = validateReplayIds(deliveryIds);
      if (!validation.ok) throw new Error(validation.message);
      const { data, error } = await supabase.functions.invoke("winloss-webhook-replay", {
        body: { delivery_ids: validation.ids },
      });
      if (error) throw error;
      return data as {
        requestId: string;
        source: "delivery";
        results: Array<{ id: string; succeeded: boolean; status: number; error: string | null; skipped?: boolean }>;
      };
    },
    onSuccess: (data) => {
      const ok = data.results.filter((r) => r.succeeded).length;
      const skipped = data.results.filter((r) => r.skipped).length;
      const fail = data.results.length - ok - skipped;
      const parts = [`${ok} sucesso`, `${fail} falha${fail === 1 ? "" : "s"}`];
      if (skipped) parts.push(`${skipped} já entregue${skipped === 1 ? "" : "s"}`);
      const reqId = data.requestId;
      const summary = `Reenvio: ${parts.join(" · ")}`;
      const opts = reqId
        ? {
            description: `requestId: ${reqId}`,
            action: {
              label: "Copiar requestId",
              onClick: () => {
                void navigator.clipboard?.writeText(reqId).then(
                  () => toast.success("requestId copiado"),
                  () => toast.error("Falha ao copiar"),
                );
              },
            },
          }
        : undefined;
      if (ok > 0) toast.success(summary, opts);
      else toast.error(summary, opts);
      qc.invalidateQueries({ queryKey: ["winloss-webhook-deliveries"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao reenviar"),
  });

  return Object.assign(query, {
    replay: replay.mutate,
    isReplaying: replay.isPending,
  });
}
