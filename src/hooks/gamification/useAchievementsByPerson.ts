import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalespersonAchievements {
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  dailyGoals: number;
  streakMilestones: number;
  total: number;
}

export function useAchievementsByPerson() {
  return useQuery({
    queryKey: ["achievements-by-person"],
    queryFn: async (): Promise<SalespersonAchievements[]> => {
      // Fetch all achievements
      const { data: achievements, error: achError } = await supabase
        .from("achievements")
        .select("salesperson_id, achievement_type");

      if (achError) throw achError;

      // Fetch all active salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url")
        .eq("is_active", true);

      if (spError) throw spError;

      // Group achievements by salesperson
      const achievementCounts = (achievements || []).reduce((acc, a) => {
        if (!acc[a.salesperson_id]) {
          acc[a.salesperson_id] = { dailyGoals: 0, streakMilestones: 0 };
        }
        if (a.achievement_type === "daily_goal") {
          acc[a.salesperson_id].dailyGoals++;
        } else if (a.achievement_type.startsWith("streak_")) {
          acc[a.salesperson_id].streakMilestones++;
        }
        return acc;
      }, {} as Record<string, { dailyGoals: number; streakMilestones: number }>);

      // Build result with salesperson info
      const result: SalespersonAchievements[] = (salespeople || [])
        .map((sp) => {
          const counts = achievementCounts[sp.id] || { dailyGoals: 0, streakMilestones: 0 };
          return {
            salesperson_id: sp.id,
            name: sp.name,
            avatar_url: sp.avatar_url,
            dailyGoals: counts.dailyGoals,
            streakMilestones: counts.streakMilestones,
            total: counts.dailyGoals + counts.streakMilestones,
          };
        })
        .filter((sp) => sp.total > 0)
        .sort((a, b) => b.total - a.total);

      return result;
    },
    refetchInterval: 60000,
  });
}
