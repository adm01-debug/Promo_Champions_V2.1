import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SemanticEntityType } from "@/components/semantic/semanticSearchHelpers";

interface ReindexInput {
  entity_types?: SemanticEntityType[];
  only_missing?: boolean;
  batch_size?: number;
}

interface ReindexResponse {
  ok: boolean;
  summary: Record<string, { queued: number; skipped: number; failed: number; total_candidates: number }>;
  error?: string;
}

export function useReindexBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReindexInput) => {
      const { data, error } = await supabase.functions.invoke<ReindexResponse>("semantic-reindex-batch", {
        body: { only_missing: true, batch_size: 100, ...input },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Falha na reindexação");
      return data.summary;
    },
    onSuccess: (summary) => {
      const totalQueued = Object.values(summary).reduce((s, x) => s + x.queued, 0);
      toast.success(`Reindexação iniciada`, {
        description: `${totalQueued} registros enviados para indexação. Atualize em alguns segundos.`,
      });
      setTimeout(() => qc.invalidateQueries({ queryKey: ["semantic-coverage"] }), 2500);
    },
    onError: (e) => {
      toast.error("Falha na reindexação", {
        description: e instanceof Error ? e.message : "Tente novamente.",
      });
    },
  });
}
