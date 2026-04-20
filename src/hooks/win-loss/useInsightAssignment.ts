import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useInsightAssignment() {
  const qc = useQueryClient();

  const assign = useMutation({
    mutationFn: async ({ insightId, salespersonId }: { insightId: string; salespersonId: string | null }) => {
      const patch: Record<string, unknown> = {
        assigned_to: salespersonId,
        assigned_at: salespersonId ? new Date().toISOString() : null,
      };
      const { error } = await (supabase as unknown as {
        from: (t: string) => {
          update: (p: Record<string, unknown>) => {
            eq: (col: string, v: string) => Promise<{ error: Error | null }>;
          };
        };
      })
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
