import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SemanticCoverageRow {
  entity_type: string;
  total_rows: number;
  indexed_rows: number;
  coverage_pct: number;
  last_indexed: string | null;
}

export function useSemanticCoverage() {
  return useQuery<SemanticCoverageRow[]>({
    queryKey: ["semantic-coverage"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ ok: boolean; coverage: SemanticCoverageRow[]; error?: string }>(
        "semantic-coverage",
        { body: {} },
      );
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Falha ao carregar cobertura");
      return data.coverage;
    },
    staleTime: 30_000,
  });
}
