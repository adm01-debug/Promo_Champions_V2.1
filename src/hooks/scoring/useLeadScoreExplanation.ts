import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ScoreExplanation } from "@/components/lead-scoring/predictiveScoringHelpers";

const STALE_MS = 1000 * 60 * 60 * 6; // 6h

export function useLeadScoreExplanation(saleId: string | null | undefined) {
  return useQuery({
    queryKey: ["lead-score-explanation", saleId],
    enabled: !!saleId,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<ScoreExplanation | null> => {
      if (!saleId) return null;

      const { data, error } = await supabase
        .from("lead_score_explanations")
        .select("*")
        .eq("sale_id", saleId)
        .maybeSingle();

      if (error) throw error;

      const stale =
        !data ||
        Date.now() - new Date(data.calculated_at).getTime() > STALE_MS;

      if (stale) {
        try {
          await supabase.functions.invoke("predictive-scoring-explain", {
            body: { sale_id: saleId },
          });
          const { data: fresh } = await supabase
            .from("lead_score_explanations")
            .select("*")
            .eq("sale_id", saleId)
            .maybeSingle();
          return (fresh as unknown as ScoreExplanation) ?? null;
        } catch (e) {
          console.warn("explain invocation failed", e);
        }
      }

      return (data as unknown as ScoreExplanation) ?? null;
    },
  });
}
