import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SemanticEntityType } from '@/components/semantic/semanticSearchHelpers';

interface ReindexInput {
  entity_types?: SemanticEntityType[];
  only_missing?: boolean;
  batch_size?: number;
}

interface ReindexResponse {
  ok: boolean;
  summary: Record<
    string,
    { indexed: number; skipped: number; failed: number; total_candidates: number }
  >;
  error?: string;
}

export function useReindexBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReindexInput) => {
      const { data, error } = await supabase.functions.invoke<ReindexResponse>(
        'semantic-reindex-batch',
        {
          body: { only_missing: true, batch_size: 100, ...input },
        }
      );
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? 'Falha na reindexação');
      return data.summary;
    },
    onSuccess: summary => {
      const entries = Object.values(summary);
      const totalIndexed = entries.reduce((s, x) => s + x.indexed, 0);
      const totalSkipped = entries.reduce((s, x) => s + x.skipped, 0);
      const totalFailed = entries.reduce((s, x) => s + x.failed, 0);

      if (totalFailed > 0) {
        toast.warning(`Reindexação parcial`, {
          description: `${totalIndexed} indexados, ${totalSkipped} já estavam atualizados, ${totalFailed} falharam.`,
        });
      } else {
        toast.success(`Reindexação concluída`, {
          description:
            totalIndexed > 0
              ? `${totalIndexed} indexados, ${totalSkipped} já estavam atualizados.`
              : `Nada a fazer — ${totalSkipped} registros já estavam atualizados.`,
        });
      }
      qc.invalidateQueries({ queryKey: ['semantic-coverage'] });
    },
    onError: e => {
      toast.error('Falha na reindexação', {
        description: e instanceof Error ? e.message : 'Tente novamente.',
      });
    },
  });
}
