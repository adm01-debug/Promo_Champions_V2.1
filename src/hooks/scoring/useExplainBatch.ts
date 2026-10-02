import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useExplainBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (saleIds: string[]) => {
      if (saleIds.length === 0) return { results: [] };
      const chunks: string[][] = [];
      for (let i = 0; i < saleIds.length; i += 50) chunks.push(saleIds.slice(i, i + 50));
      // Chunks independentes — dispara em paralelo (evita roundtrips
      // sequenciais); a ordem dos resultados é preservada pelo Promise.all.
      const responses = await Promise.all(
        chunks.map(chunk =>
          supabase.functions.invoke('predictive-scoring-explain', {
            body: { sale_ids: chunk },
          })
        )
      );
      const all: Record<string, unknown>[] = [];
      for (const { data, error } of responses) {
        if (error) throw error;
        all.push(...(data?.results ?? []));
      }
      return { results: all };
    },
    onSuccess: res => {
      toast.success(`Score IA atualizado em ${res.results.length} deals`);
      qc.invalidateQueries({ queryKey: ['lead-score-explanation'] });
    },
    onError: (e: Error) => toast.error(`Falha ao reexplicar: ${e.message}`),
  });
}
