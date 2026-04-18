import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CoverageTier } from "@/components/deal-intelligence/committeeHelpers";

export interface CommitteeCoverage {
  id: string;
  sale_id: string;
  owner_id: string;
  coverage_score: number;
  tier: CoverageTier;
  gaps: string[];
  risks: string[];
  stakeholder_count: number;
  calculated_at: string;
}

export const useCommitteeCoverage = (saleId: string | null | undefined) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!saleId) return;
    const ch = supabase
      .channel(`coverage-${saleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "deal_committee_coverage", filter: `sale_id=eq.${saleId}` },
        () => qc.invalidateQueries({ queryKey: ["committee-coverage", saleId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [saleId, qc]);

  return useQuery({
    queryKey: ["committee-coverage", saleId],
    queryFn: async (): Promise<CommitteeCoverage | null> => {
      if (!saleId) return null;
      const { data, error } = await supabase
        .from("deal_committee_coverage")
        .select("*")
        .eq("sale_id", saleId)
        .maybeSingle();
      if (error) throw error;
      return data as CommitteeCoverage | null;
    },
    enabled: !!saleId,
  });
};

export const useWeakCoverageDeals = () => {
  return useQuery({
    queryKey: ["weak-coverage-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_committee_coverage")
        .select("*, sales(id, client_name, stage, final_value)")
        .in("tier", ["weak", "partial"])
        .order("coverage_score", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
};

export const useRecalculateCoverage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sale_id: string) => {
      const { data, error } = await supabase.functions.invoke("calculate-committee-coverage", { body: { sale_id } });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, sale_id) => {
      qc.invalidateQueries({ queryKey: ["committee-coverage", sale_id] });
      qc.invalidateQueries({ queryKey: ["weak-coverage-deals"] });
      toast.success("Cobertura recalculada");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};
