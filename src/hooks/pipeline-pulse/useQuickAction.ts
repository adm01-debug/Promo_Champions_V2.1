import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type QuickActionId = "recompute-health" | "route-pending-leads" | "refresh-forecast" | "analyze-recent-calls";

const ACTION_META: Record<QuickActionId, { fn: string; body?: Record<string, unknown>; label: string }> = {
  "recompute-health": { fn: "deal-health-scorer", body: { batch: true }, label: "Health Scores recomputados" },
  "route-pending-leads": { fn: "smart-lead-router", body: { batch: true }, label: "Leads pendentes roteados" },
  "refresh-forecast": { fn: "revenue-forecast-ai", body: { horizon_days: 30, include_ai: true }, label: "Forecast atualizado" },
  "analyze-recent-calls": { fn: "analyze-conversation", body: { batch_recent: true }, label: "Calls recentes analisadas" },
};

export function useQuickAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: QuickActionId) => {
      const meta = ACTION_META[id];
      const { data, error } = await supabase.functions.invoke(meta.fn, { body: meta.body });
      if (error) throw error;
      return { id, data, label: meta.label };
    },
    onSuccess: (res) => {
      toast.success(res.label);
      qc.invalidateQueries({ queryKey: ["pipeline-pulse"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
