import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SkillKey, SkillLevel, SkillTrend } from "@/components/coaching/skills/skillGapHelpers";

export interface SkillAssessment {
  id: string;
  salesperson_id: string;
  salesperson_name?: string;
  skill: SkillKey;
  current_level: SkillLevel;
  score: number;
  trend: SkillTrend;
  gap_count_30d: number;
  gap_count_90d: number;
  last_assessed_at: string;
  factors: Record<string, number>;
}

export interface SkillTrack {
  id: string;
  salesperson_id: string;
  salesperson_name?: string;
  skill: SkillKey;
  priority: number;
  current_level: SkillLevel;
  target_level: SkillLevel;
  milestones: { week: number; title: string }[];
  estimated_weeks: number;
  ai_plan: string | null;
  created_at: string;
}

export const useSkillAssessments = (salespersonId?: string) =>
  useQuery({
    queryKey: ["skill-assessments", salespersonId],
    queryFn: async (): Promise<SkillAssessment[]> => {
      let q = supabase.from("skill_assessments").select("*, salespeople(name)").order("score", { ascending: true }).limit(1000);
      if (salespersonId) q = q.eq("salesperson_id", salespersonId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r: { salespeople?: { name?: string } | null } & Record<string, unknown>) => ({
        ...(r as unknown as SkillAssessment),
        salesperson_name: r.salespeople?.name,
      }));
    },
    staleTime: 60_000,
  });

export const useSkillTracks = (salespersonId?: string) =>
  useQuery({
    queryKey: ["skill-tracks", salespersonId],
    queryFn: async (): Promise<SkillTrack[]> => {
      let q = supabase.from("skill_development_tracks").select("*, salespeople(name)").order("priority", { ascending: true }).limit(500);
      if (salespersonId) q = q.eq("salesperson_id", salespersonId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r: { salespeople?: { name?: string } | null } & Record<string, unknown>) => ({
        ...(r as unknown as SkillTrack),
        salesperson_name: r.salespeople?.name,
      }));
    },
    staleTime: 60_000,
  });

export const useSkillSummary = () =>
  useQuery({
    queryKey: ["skill-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skill_assessments").select("salesperson_id, skill, score, current_level, trend");
      if (error) throw error;
      const list = data ?? [];
      const total = list.length;
      const beginnerCount = list.filter((r) => r.current_level === "beginner").length;
      const expertCount = list.filter((r) => r.current_level === "expert").length;
      const improving = list.filter((r) => r.trend === "improving").length;
      const skillAvg: Record<string, { sum: number; n: number }> = {};
      list.forEach((r) => {
        const k = r.skill as string;
        if (!skillAvg[k]) skillAvg[k] = { sum: 0, n: 0 };
        skillAvg[k].sum += Number(r.score ?? 0);
        skillAvg[k].n += 1;
      });
      const skillAvgArr = Object.entries(skillAvg).map(([k, v]) => ({ skill: k, avg: v.n ? v.sum / v.n : 0 }));
      const weakest = [...skillAvgArr].sort((a, b) => a.avg - b.avg)[0] ?? null;
      const strongest = [...skillAvgArr].sort((a, b) => b.avg - a.avg)[0] ?? null;
      const repsAtBeginner = new Set(list.filter((r) => r.current_level === "beginner").map((r) => r.salesperson_id)).size;
      return {
        total,
        beginner_assessments: beginnerCount,
        expert_assessments: expertCount,
        improving_count: improving,
        reps_at_beginner: repsAtBeginner,
        weakest_skill: weakest,
        strongest_skill: strongest,
        skill_avgs: skillAvgArr,
      };
    },
    staleTime: 60_000,
  });

export const useAnalyzeSkillGaps = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("analyze-skill-gaps", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Análise concluída: ${data?.assessments ?? 0} avaliações, ${data?.tracks ?? 0} trilhas`);
      qc.invalidateQueries({ queryKey: ["skill-assessments"] });
      qc.invalidateQueries({ queryKey: ["skill-tracks"] });
      qc.invalidateQueries({ queryKey: ["skill-summary"] });
    },
    onError: (e: Error) => toast.error(`Falha na análise: ${e.message}`),
  });
};
