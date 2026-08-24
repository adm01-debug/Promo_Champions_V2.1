import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useExplainBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (saleIds: string[]) => {
      if (saleIds.length === 0) return { results: [] };
      const chunks: string[][] = [];
      for (let i = 0; i < saleIds.length; i += 50) chunks.push(saleIds.slice(i, i + 50));
      const all: Record<string, unknown>[] = [];
      for (const chunk of chunks) {
        const { data, error } = await supabase.functions.invoke(
          "predictive-scoring-explain",
          { body: { sale_ids: chunk } },
        );
        if (error) throw error;
        all.push(...(data?.results ?? []));
      }
      return { results: all };
    },
    onSuccess: (res) => {
      toast.success(`Score IA atualizado em ${res.results.length} deals`);
      qc.invalidateQueries({ queryKey: ["lead-score-explanation"] });
    },
    onError: (e: Error) => toast.error(`Falha ao reexplicar: ${e.message}`),
  });
}
