import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval } from "date-fns";

export interface AchievementTrendData {
  date: string;
  dailyGoals: number;
  streakMilestones: number;
  total: number;
}

export function useAchievementTrends(days: number = 30) {
  return useQuery({
    queryKey: ["achievement-trends", days],
    queryFn: async (): Promise<AchievementTrendData[]> => {
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);
      const startDateStr = format(startDate, "yyyy-MM-dd");

      const { data: achievements, error } = await supabase
        .from("achievements")
        .select("achievement_type, achievement_date")
        .gte("achievement_date", startDateStr)
        .order("achievement_date", { ascending: true });

      if (error) throw error;

      // Generate all days in range
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });

      // Group achievements by date
      const achievementsByDate = (achievements || []).reduce((acc, a) => {
        const date = a.achievement_date;
        if (!acc[date]) {
          acc[date] = { dailyGoals: 0, streakMilestones: 0 };
        }
        if (a.achievement_type === "daily_goal") {
          acc[date].dailyGoals++;
        } else if (a.achievement_type.startsWith("streak_")) {
          acc[date].streakMilestones++;
        }
        return acc;
      }, {} as Record<string, { dailyGoals: number; streakMilestones: number }>);

      // Build trend data for each day
      return allDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const data = achievementsByDate[dateStr] || { dailyGoals: 0, streakMilestones: 0 };
        return {
          date: dateStr,
          dailyGoals: data.dailyGoals,
          streakMilestones: data.streakMilestones,
          total: data.dailyGoals + data.streakMilestones,
        };
      });
    },
    refetchInterval: 60000,
  });
}
