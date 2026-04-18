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

export interface CoverageHistoryPoint {
  snapshot_at: string;
  coverage_score: number;
  tier: CoverageTier;
  stakeholder_count: number;
}

export const useCommitteeCoverageHistory = (saleId: string | null | undefined) => {
  return useQuery({
    queryKey: ["committee-coverage-history", saleId],
    queryFn: async (): Promise<CoverageHistoryPoint[]> => {
      if (!saleId) return [];
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("committee_coverage_history")
        .select("snapshot_at, coverage_score, tier, stakeholder_count")
        .eq("sale_id", saleId)
        .gte("snapshot_at", since)
        .order("snapshot_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CoverageHistoryPoint[];
    },
    enabled: !!saleId,
  });
};

export interface CommitteeInsights {
  total: number;
  withChampionPct: number;
  withEconomicBuyerPct: number;
  singleThreadedCount: number;
  avgCoverage: number;
  topGap: string | null;
}

export const useCommitteeInsights = () => {
  return useQuery({
    queryKey: ["committee-insights"],
    queryFn: async (): Promise<CommitteeInsights> => {
      const { data, error } = await supabase
        .from("deal_committee_coverage")
        .select("coverage_score, gaps, stakeholder_count, sale_id");
      if (error) throw error;
      const rows = data ?? [];
      const total = rows.length;
      if (!total) return { total: 0, withChampionPct: 0, withEconomicBuyerPct: 0, singleThreadedCount: 0, avgCoverage: 0, topGap: null };

      const gapCounts: Record<string, number> = {};
      let withChampion = 0, withEB = 0, singleThreaded = 0, sumCov = 0;
      for (const r of rows) {
        const gaps = (r.gaps as string[] | null) ?? [];
        for (const g of gaps) gapCounts[g] = (gapCounts[g] ?? 0) + 1;
        if (!gaps.includes("champion")) withChampion++;
        if (!gaps.includes("economic_buyer")) withEB++;
        if ((r.stakeholder_count ?? 0) <= 1) singleThreaded++;
        sumCov += Number(r.coverage_score) || 0;
      }
      const topGap = Object.entries(gapCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return {
        total,
        withChampionPct: Math.round((withChampion / total) * 100),
        withEconomicBuyerPct: Math.round((withEB / total) * 100),
        singleThreadedCount: singleThreaded,
        avgCoverage: Math.round(sumCov / total),
        topGap,
      };
    },
  });
};

export const useExtractCommitteeFromCall = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recording_id: string) => {
      const { data, error } = await supabase.functions.invoke("extract-committee-from-call", { body: { recording_id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { extracted: number; created: number; updated: number; confidence: number };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["committee-coverage"] });
      qc.invalidateQueries({ queryKey: ["committee-coverage-history"] });
      qc.invalidateQueries({ queryKey: ["committee-insights"] });
      qc.invalidateQueries({ queryKey: ["weak-coverage-deals"] });
      qc.invalidateQueries({ queryKey: ["deal-stakeholders"] });
      toast.success(`Comitê extraído: ${d.extracted} stakeholders (${d.created} novos, ${d.updated} atualizados)`);
    },
    onError: (e: Error) => toast.error(`Erro ao extrair comitê: ${e.message}`),
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
