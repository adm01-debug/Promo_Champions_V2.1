import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
type CoverageHealth = "critical" | "weak" | "healthy" | "strong";

export interface CoverageSnapshot {
  id: string;
  period_start: string;
  period_end: string;
  owner_id: string | null;
  segment: string | null;
  stage: string | null;
  quota_amount: number;
  pipeline_amount: number;
  weighted_pipeline: number;
  coverage_ratio: number;
  target_ratio: number;
  health: CoverageHealth;
  gap_to_target: number;
  deals_count: number;
  calculated_at: string;
}

export interface CoverageRecommendation {
  id: string;
  snapshot_id: string;
  priority: "high" | "medium" | "low";
  title: string;
  action: string;
  expected_impact_amount: number;
  ai_generated: boolean;
  acted_on: boolean;
  acted_on_at: string | null;
  created_at: string;
}

export interface CoverageFilters {
  ownerId?: string | null;
  segment?: string | null;
}

export function usePipelineCoverageAnalyzer(filters: CoverageFilters = {}) {
  const qc = useQueryClient();
  const key = ["pipeline-coverage-analyzer", filters];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      // Latest calculated_at
      const { data: latest } = await supabase
        .from("pipeline_coverage_snapshots")
        .select("calculated_at")
        .order("calculated_at", { ascending: false })
        .limit(1);
      const latestAt = latest?.[0]?.calculated_at;
      if (!latestAt) {
        return { snapshots: [] as CoverageSnapshot[], recommendations: [] as CoverageRecommendation[] };
      }

      let snapQ = supabase
        .from("pipeline_coverage_snapshots")
        .select("*")
        .eq("calculated_at", latestAt);
      if (filters.ownerId) snapQ = snapQ.eq("owner_id", filters.ownerId);
      if (filters.segment) snapQ = snapQ.eq("segment", filters.segment);

      const { data: snaps, error: sErr } = await snapQ;
      if (sErr) throw sErr;

      const ids = (snaps ?? []).map((s) => s.id);
      let recs: CoverageRecommendation[] = [];
      if (ids.length > 0) {
        const { data: r } = await supabase
          .from("pipeline_coverage_recommendations")
          .select("*")
          .in("snapshot_id", ids)
          .order("priority", { ascending: true });
        recs = (r as CoverageRecommendation[]) ?? [];
      }
      return { snapshots: (snaps as CoverageSnapshot[]) ?? [], recommendations: recs };
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("coverage-analyzer-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_coverage_snapshots" }, () => {
        qc.invalidateQueries({ queryKey: ["pipeline-coverage-analyzer"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_coverage_recommendations" }, () => {
        qc.invalidateQueries({ queryKey: ["pipeline-coverage-analyzer"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return query;
}

export function useRunCoverageAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { period_days?: number; owner_id?: string | null } = {}) => {
      const { data, error } = await supabase.functions.invoke("analyze-pipeline-coverage", { body: input });
      if (error) throw error;
      return data as { snapshots_inserted: number; recommendations_inserted: number };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["pipeline-coverage-analyzer"] });
      toast.success(`${d.snapshots_inserted} snapshots • ${d.recommendations_inserted} recomendações IA`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkRecommendationActed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pipeline_coverage_recommendations")
        .update({ acted_on: true, acted_on_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline-coverage-analyzer"] });
      toast.success("Recomendação marcada como atuada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
