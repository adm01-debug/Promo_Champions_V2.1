import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Roda analyze-win-loss + mine-win-loss-patterns em paralelo,
 * mostra toast com progresso e invalida queries do módulo.
 */
export const useRunWinLossAnalysis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const tId = toast.loading("Analisando deals e minerando padrões…");
      try {
        const [a, m] = await Promise.all([
          supabase.functions.invoke("analyze-win-loss", { body: {} }),
          supabase.functions.invoke("mine-win-loss-patterns", { body: {} }),
        ]);
        if (a.error) throw a.error;
        if (m.error) throw m.error;
        toast.success(
          `${a.data?.processed ?? 0} deals · ${m.data?.patterns ?? 0} padrões · ${m.data?.insights ?? 0} insights`,
          { id: tId },
        );
        return { analyze: a.data, mine: m.data };
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro na análise", { id: tId });
        throw e;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wl-analyses-filtered"] });
      qc.invalidateQueries({ queryKey: ["win-loss-analyses"] });
      qc.invalidateQueries({ queryKey: ["win-loss-patterns"] });
      qc.invalidateQueries({ queryKey: ["win-loss-insights"] });
      qc.invalidateQueries({ queryKey: ["win-loss-summary"] });
    },
  });
};
