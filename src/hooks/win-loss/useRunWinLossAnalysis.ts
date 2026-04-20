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
        // Discrete celebration confetti — dynamic import keeps initial bundle lean.
        try {
          const reduce = typeof window !== "undefined"
            && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
          if (!reduce) {
            const { default: confetti } = await import("canvas-confetti");
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.3 },
              colors: ["hsl(160 70% 45%)", "hsl(220 70% 50%)", "hsl(280 65% 55%)"],
              scalar: 0.8,
              ticks: 80,
            });
          }
        } catch { /* ignore */ }
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
