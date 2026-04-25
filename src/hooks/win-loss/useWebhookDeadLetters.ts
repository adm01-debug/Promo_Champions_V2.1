import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updatePayload } from "@/lib/supabase/typed-payloads";

export type DeadLetterStatus = "pending" | "replaying" | "replayed" | "archived";

export interface DeadLetter {
  id: string;
  subscription_id: string;
  event: string;
  payload: Record<string, unknown>;
  last_status: number;
  last_error: string | null;
  attempts: number;
  total_latency_ms: number;
  request_id: string | null;
  status: DeadLetterStatus;
  replay_count: number;
  last_replay_at: string | null;
  last_replay_status: number | null;
  last_replay_error: string | null;
  created_at: string;
  updated_at: string;
  subscription_url?: string | null;
}

export function useWebhookDeadLetters(status: DeadLetterStatus = "pending") {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["winloss-dead-letters", status],
    staleTime: 15_000,
    queryFn: async (): Promise<DeadLetter[]> => {
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, v: string) => {
              order: (c: string, o: { ascending: boolean }) => {
                limit: (n: number) => Promise<{ data: (DeadLetter & { winloss_webhook_subscriptions?: { url: string } | null })[] | null; error: Error | null }>;
              };
            };
          };
        };
      })
        .from("winloss_webhook_dead_letters")
        .select("*, winloss_webhook_subscriptions(url)")
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map((r) => ({ ...r, subscription_url: r.winloss_webhook_subscriptions?.url ?? null }));
    },
  });

  const replay = useMutation({
    mutationFn: async (ids: string[]) => {
      const CHUNK = 50;
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += CHUNK) chunks.push(ids.slice(i, i + CHUNK));

      const aggregated = {
        requestId: "" as string,
        results: [] as Array<{ id: string; succeeded: boolean; status: number; error: string | null }>,
      };
      for (const chunk of chunks) {
        const { data, error } = await supabase.functions.invoke("winloss-webhook-replay", {
          body: { dead_letter_ids: chunk },
        });
        if (error) throw error;
        const d = data as { requestId: string; results: typeof aggregated.results };
        if (!aggregated.requestId) aggregated.requestId = d.requestId;
        aggregated.results.push(...d.results);
      }
      return aggregated;
    },
    onSuccess: (data) => {
      const ok = data.results.filter((r) => r.succeeded).length;
      const fail = data.results.length - ok;
      const reqId = data.requestId;
      const summary = `Reprocessamento concluído: ${ok} sucesso · ${fail} falha${fail === 1 ? "" : "s"}`;
      toast.success(summary, {
        description: reqId ? `requestId: ${reqId}` : undefined,
        action: reqId
          ? {
              label: "Copiar requestId",
              onClick: () => {
                void navigator.clipboard?.writeText(reqId).then(
                  () => toast.success("requestId copiado"),
                  () => toast.error("Falha ao copiar"),
                );
              },
            }
          : undefined,
      });
      qc.invalidateQueries({ queryKey: ["winloss-dead-letters"] });
      qc.invalidateQueries({ queryKey: ["winloss-replay-audit"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao reprocessar"),
  });

  const archive = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("winloss_webhook_dead_letters")
        .update(updatePayload("winloss_webhook_dead_letters", { status: "archived" }))
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Arquivado");
      qc.invalidateQueries({ queryKey: ["winloss-dead-letters"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao arquivar"),
  });

  return { list, replay: replay.mutate, archive: archive.mutate, isReplaying: replay.isPending, isArchiving: archive.isPending };
}
