import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

// Weighted scoring: activity type × outcome
const QUALITY_WEIGHTS: Record<string, Record<string, number>> = {
  call: { positive: 10, neutral: 3, negative: 1 },
  email: { positive: 8, neutral: 2, negative: 1 },
  meeting: { positive: 15, neutral: 5, negative: 2 },
  whatsapp: { positive: 7, neutral: 2, negative: 1 },
  linkedin: { positive: 6, neutral: 2, negative: 1 },
  visit: { positive: 12, neutral: 4, negative: 1 },
  task: { positive: 5, neutral: 2, negative: 1 },
};

export interface ActivityQualityData {
  salespersonId: string;
  salespersonName: string;
  avatarUrl: string | null;
  totalActivities: number;
  qualityScore: number; // 0-100 normalized
  rawScore: number;
  maxPossibleScore: number;
  breakdown: { type: string; count: number; score: number; avgQuality: number }[];
  rank: number;
  trend: "up" | "down" | "stable";
}

export function useActivityQualityScore() {
  return useQuery({
    queryKey: ["activity-quality-score"],
    queryFn: async (): Promise<ActivityQualityData[]> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [spResult, activitiesResult] = await Promise.all([
        supabase.from("salespeople").select("id, name, avatar_url").eq("is_active", true),
        supabase
          .from("activities")
          .select("salesperson_id, activity_type, outcome")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
      ]);

      if (spResult.error) throw spResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      const salespeople = spResult.data || [];
      const activities = activitiesResult.data || [];

      const results: ActivityQualityData[] = salespeople.map((sp) => {
        const spActivities = activities.filter((a) => a.salesperson_id === sp.id);
        let rawScore = 0;
        let maxPossibleScore = 0;

        const typeMap = new Map<string, { count: number; score: number; total: number }>();

        spActivities.forEach((act) => {
          const typeWeights = QUALITY_WEIGHTS[act.activity_type] || QUALITY_WEIGHTS.task;
          const weight = typeWeights[act.outcome] || typeWeights.neutral;
          const maxWeight = typeWeights.positive;

          rawScore += weight;
          maxPossibleScore += maxWeight;

          const existing = typeMap.get(act.activity_type) || { count: 0, score: 0, total: 0 };
          existing.count++;
          existing.score += weight;
          existing.total += maxWeight;
          typeMap.set(act.activity_type, existing);
        });

        const qualityScore = maxPossibleScore > 0 ? Math.round((rawScore / maxPossibleScore) * 100) : 0;

        const breakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
          type,
          count: data.count,
          score: data.score,
          avgQuality: data.total > 0 ? Math.round((data.score / data.total) * 100) : 0,
        }));

        breakdown.sort((a, b) => b.score - a.score);

        return {
          salespersonId: sp.id,
          salespersonName: sp.name,
          avatarUrl: sp.avatar_url,
          totalActivities: spActivities.length,
          qualityScore,
          rawScore,
          maxPossibleScore,
          breakdown,
          rank: 0,
          trend: "stable" as const,
        };
      });

      results.sort((a, b) => b.qualityScore - a.qualityScore);
      results.forEach((r, i) => (r.rank = i + 1));

      return results;
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });
}
