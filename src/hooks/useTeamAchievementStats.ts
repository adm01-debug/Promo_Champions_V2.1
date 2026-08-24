import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, parseISO, differenceInDays, startOfMonth, startOfWeek } from "date-fns";

export interface TeamAchievementStats {
  totalGoalsAchieved: number;
  totalStreakMilestones: number;
  goalsThisMonth: number;
  goalsThisWeek: number;
  teamBestStreak: number;
  teamBestStreakHolder: {
    name: string;
    avatar_url: string | null;
  } | null;
  currentActiveStreaks: number;
  avgGoalsPerSalesperson: number;
  uniqueSalespeopleWithGoals: number;
}

export function useTeamAchievementStats() {
  return useQuery({
    queryKey: ["team-achievement-stats"],
    queryFn: async (): Promise<TeamAchievementStats> => {
      const today = format(new Date(), "yyyy-MM-dd");
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

      // Fetch all achievements
      const { data: achievements, error: achError } = await supabase
        .from("achievements")
        .select("id, salesperson_id, achievement_type, achievement_date");

      if (achError) throw achError;

      // Fetch all active salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url")
        .eq("is_active", true);

      if (spError) throw spError;

      const allAchievements = achievements || [];
      const allSalespeople = salespeople || [];

      // Calculate basic counts
      const dailyGoals = allAchievements.filter(a => a.achievement_type === "daily_goal");
      const streakMilestones = allAchievements.filter(a => a.achievement_type.startsWith("streak_"));
      
      const goalsThisMonth = dailyGoals.filter(a => a.achievement_date >= monthStart).length;
      const goalsThisWeek = dailyGoals.filter(a => a.achievement_date >= weekStart).length;

      // Calculate best streak per salesperson
      const salespersonStreaks: { id: string; name: string; avatar_url: string | null; bestStreak: number; currentStreak: number }[] = [];

      for (const sp of allSalespeople) {
        const spGoals = dailyGoals
          .filter(a => a.salesperson_id === sp.id)
          .map(a => a.achievement_date);
        
        const uniqueDates = [...new Set(spGoals)].sort().reverse();

        // Calculate current streak
        let currentStreak = 0;
        if (uniqueDates.length > 0) {
          const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
          if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 1; i < uniqueDates.length; i++) {
              const currentDate = parseISO(uniqueDates[i - 1]);
              const prevDate = parseISO(uniqueDates[i]);
              const diff = differenceInDays(currentDate, prevDate);
              if (diff === 1) currentStreak++;
              else break;
            }
          }
        }

        // Calculate best streak
        let bestStreak = 0;
        let tempStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = parseISO(uniqueDates[i - 1]);
          const prevDate = parseISO(uniqueDates[i]);
          const diff = differenceInDays(currentDate, prevDate);
          if (diff === 1) tempStreak++;
          else {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

        salespersonStreaks.push({
          id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          bestStreak,
          currentStreak,
        });
      }

      // Find team best streak holder
      const sortedByBest = [...salespersonStreaks].sort((a, b) => b.bestStreak - a.bestStreak);
      const teamBestStreakHolder = sortedByBest.length > 0 && sortedByBest[0].bestStreak > 0
        ? { name: sortedByBest[0].name, avatar_url: sortedByBest[0].avatar_url }
        : null;

      // Count active streaks (current streak >= 1)
      const currentActiveStreaks = salespersonStreaks.filter(s => s.currentStreak >= 1).length;

      // Unique salespeople with at least one goal
      const uniqueSalespeopleWithGoals = new Set(dailyGoals.map(a => a.salesperson_id)).size;

      // Average goals per salesperson (who has at least one)
      const avgGoalsPerSalesperson = uniqueSalespeopleWithGoals > 0
        ? Math.round(dailyGoals.length / uniqueSalespeopleWithGoals * 10) / 10
        : 0;

      return {
        totalGoalsAchieved: dailyGoals.length,
        totalStreakMilestones: streakMilestones.length,
        goalsThisMonth,
        goalsThisWeek,
        teamBestStreak: sortedByBest.length > 0 ? sortedByBest[0].bestStreak : 0,
        teamBestStreakHolder,
        currentActiveStreaks,
        avgGoalsPerSalesperson,
        uniqueSalespeopleWithGoals,
      };
    },
    refetchInterval: 60000,
  });
}
