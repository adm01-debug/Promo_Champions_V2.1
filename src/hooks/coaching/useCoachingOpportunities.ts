import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CoachingSeverity = "low" | "medium" | "high" | "critical";
export type CoachingSkillFocus = "discovery" | "qualification" | "objection_handling" | "closing" | "prospecting" | "negotiation";

export interface CoachingOpportunity {
  id: string;
  salesperson_id: string;
  salesperson_name?: string;
  metric_key: string;
  metric_label: string;
  current_value: number;
  team_benchmark: number;
  gap_pct: number;
  severity: CoachingSeverity;
  skill_focus: CoachingSkillFocus;
  recommended_action: string | null;
  priority: number;
  detected_at: string;
}

export interface CoachingBenchmark {
  id: string;
  metric_key: string;
  team_avg: number;
  top_quartile: number;
  sample_size: number;
  computed_at: string;
}

export const useCoachingOpportunities = (filters?: { severity?: CoachingSeverity; skillFocus?: CoachingSkillFocus }) =>
  useQuery({
    queryKey: ["coaching-opportunities", filters],
    queryFn: async (): Promise<CoachingOpportunity[]> => {
      let q = supabase
        .from("coaching_opportunities")
        .select("*, salespeople(name)")
        .order("severity", { ascending: false })
        .order("priority", { ascending: true })
        .limit(500);
      if (filters?.severity) q = q.eq("severity", filters.severity);
      if (filters?.skillFocus) q = q.eq("skill_focus", filters.skillFocus);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r: { salespeople?: { name?: string } | null } & Record<string, unknown>) => ({
        ...(r as unknown as CoachingOpportunity),
        salesperson_name: r.salespeople?.name,
      }));
    },
    staleTime: 60_000,
  });

export const useCoachingBenchmarks = () =>
  useQuery({
    queryKey: ["coaching-benchmarks"],
    queryFn: async (): Promise<CoachingBenchmark[]> => {
      const { data, error } = await supabase.from("coaching_skill_benchmarks").select("*").order("metric_key");
      if (error) throw error;
      return (data ?? []) as CoachingBenchmark[];
    },
    staleTime: 60_000,
  });

export const useCoachingSummary = () =>
  useQuery({
    queryKey: ["coaching-opportunities-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_opportunities")
        .select("severity, skill_focus, gap_pct, salesperson_id");
      if (error) throw error;
      const list = data ?? [];
      const critical = list.filter((r) => r.severity === "critical").length;
      const repsAffected = new Set(list.map((r) => r.salesperson_id)).size;
      const skillCounts: Record<string, number> = {};
      list.forEach((r) => {
        skillCounts[r.skill_focus] = (skillCounts[r.skill_focus] ?? 0) + 1;
      });
      const topSkill = Object.entries(skillCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const avgGap = list.length > 0 ? list.reduce((s, r) => s + Number(r.gap_pct ?? 0), 0) / list.length : 0;
      return {
        critical_count: critical,
        reps_affected: repsAffected,
        top_skill: topSkill,
        avg_gap_pct: avgGap,
        total: list.length,
      };
    },
    staleTime: 60_000,
  });

export const useDetectCoachingOpportunities = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-coaching-opportunities", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Análise concluída: ${data?.opportunities_detected ?? 0} oportunidades`);
      qc.invalidateQueries({ queryKey: ["coaching-opportunities"] });
      qc.invalidateQueries({ queryKey: ["coaching-opportunities-summary"] });
      qc.invalidateQueries({ queryKey: ["coaching-benchmarks"] });
    },
    onError: (e: Error) => toast.error(`Falha na análise: ${e.message}`),
  });
};
