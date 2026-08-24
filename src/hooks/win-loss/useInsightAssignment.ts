import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updatePayload } from "@/lib/supabase/typed-payloads";

export function useInsightAssignment() {
  const qc = useQueryClient();

  const assign = useMutation({
    mutationFn: async ({ insightId, salespersonId }: { insightId: string; salespersonId: string | null }) => {
      const patch = updatePayload("win_loss_insights", {
        assigned_to: salespersonId,
        assigned_at: salespersonId ? new Date().toISOString() : null,
      });
      const { error } = await supabase
        .from("win_loss_insights")
        .update(patch)
        .eq("id", insightId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["win-loss-insights"] });
      toast.success(vars.salespersonId ? "Insight atribuído" : "Atribuição removida");
    },
    onError: () => toast.error("Não foi possível atribuir"),
  });

  return assign;
}
