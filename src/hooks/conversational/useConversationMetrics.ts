import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ConversationMetrics } from "@/components/conversational/metrics/metricsHelpers";

export function useConversationMetrics(recordingId: string | null | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["conversation-metrics", recordingId],
    enabled: !!recordingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_conversation_metrics")
        .select("*")
        .eq("recording_id", recordingId!)
        .maybeSingle();
      if (error) throw error;
      return data as ConversationMetrics | null;
    },
  });

  useEffect(() => {
    if (!recordingId) return;
    const ch = supabase
      .channel(`ccm-${recordingId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "call_conversation_metrics",
        filter: `recording_id=eq.${recordingId}`,
      }, () => qc.invalidateQueries({ queryKey: ["conversation-metrics", recordingId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [recordingId, qc]);

  return query;
}

export function useConversationMetricsFeed(healthFilter?: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["conversation-metrics-feed", healthFilter ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("call_conversation_metrics")
        .select("*, call_recordings(id, title, recorded_at, salesperson_id)")
        .order("calculated_at", { ascending: false })
        .limit(50);
      if (healthFilter && healthFilter !== "all") q = q.eq("health", healthFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("ccm-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "call_conversation_metrics" },
        () => qc.invalidateQueries({ queryKey: ["conversation-metrics-feed"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return query;
}

export function useAnalyzeConversationMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-conversation-metrics", {
        body: { recording_id },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: (_d, recording_id) => {
      qc.invalidateQueries({ queryKey: ["conversation-metrics", recording_id] });
      qc.invalidateQueries({ queryKey: ["conversation-metrics-feed"] });
      toast.success("Métricas conversacionais atualizadas! 📊");
    },
    onError: (e) => toast.error(`Falha ao analisar métricas: ${e instanceof Error ? e.message : "erro"}`),
  });
}
