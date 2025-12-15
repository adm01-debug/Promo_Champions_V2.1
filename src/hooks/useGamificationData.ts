import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import { calculateLevelFromXP, getLevelInfo } from "./useSalespersonXP";

export interface SalespersonGamificationData {
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  // XP data
  totalXP: number;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  levelTitle: string;
  levelEmoji: string;
  levelColor: string;
  // Streak data
  currentStreak: number;
  bestStreak: number;
  // Achievement data
  totalAchievements: number;
  dailyGoalsAchieved: number;
  streakMilestonesAchieved: number;
}

export function useGamificationData() {
  return useQuery({
    queryKey: ["gamification-data"],
    queryFn: async (): Promise<SalespersonGamificationData[]> => {
      // Fetch all active salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true);

      if (spError) throw spError;
      if (!salespeople) return [];

      // Fetch all XP data
      const { data: xpData, error: xpError } = await supabase
        .from("salesperson_xp")
        .select("salesperson_id, total_xp, current_level");

      if (xpError) throw xpError;

      // Fetch all achievements
      const { data: achievements, error: achError } = await supabase
        .from("achievements")
        .select("salesperson_id, achievement_type, achievement_date")
        .order("achievement_date", { ascending: false });

      if (achError) throw achError;

      // Create a map of XP data by salesperson
      const xpMap = (xpData || []).reduce((acc, xp) => {
        acc[xp.salesperson_id] = xp;
        return acc;
      }, {} as Record<string, { total_xp: number; current_level: number }>);

      // Group achievements by salesperson
      const achievementsByPerson = (achievements || []).reduce((acc, a) => {
        if (!acc[a.salesperson_id]) {
          acc[a.salesperson_id] = {
            dailyGoals: [],
            streakMilestones: 0,
          };
        }
        if (a.achievement_type === "daily_goal") {
          acc[a.salesperson_id].dailyGoals.push(a.achievement_date);
        } else if (a.achievement_type.startsWith("streak_")) {
          acc[a.salesperson_id].streakMilestones++;
        }
        return acc;
      }, {} as Record<string, { dailyGoals: string[]; streakMilestones: number }>);

      // Calculate gamification data for each salesperson
      const result: SalespersonGamificationData[] = salespeople.map(sp => {
        // XP data
        const xp = xpMap[sp.id];
        const totalXP = xp?.total_xp || 0;
        const { level, xpInLevel, xpToNext } = calculateLevelFromXP(totalXP);
        const levelInfo = getLevelInfo(level);

        // Achievement data
        const personAchievements = achievementsByPerson[sp.id] || { dailyGoals: [], streakMilestones: 0 };
        const uniqueDailyGoalDates = [...new Set(personAchievements.dailyGoals)].sort().reverse();

        // Calculate current streak
        let currentStreak = 0;
        if (uniqueDailyGoalDates.length > 0) {
          const today = format(new Date(), "yyyy-MM-dd");
          const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
          
          if (uniqueDailyGoalDates[0] === today || uniqueDailyGoalDates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 1; i < uniqueDailyGoalDates.length; i++) {
              const currentDate = parseISO(uniqueDailyGoalDates[i - 1]);
              const prevDate = parseISO(uniqueDailyGoalDates[i]);
              const diff = differenceInDays(currentDate, prevDate);
              if (diff === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
        }

        // Calculate best streak ever
        let bestStreak = 0;
        let tempStreak = 1;
        for (let i = 1; i < uniqueDailyGoalDates.length; i++) {
          const currentDate = parseISO(uniqueDailyGoalDates[i - 1]);
          const prevDate = parseISO(uniqueDailyGoalDates[i]);
          const diff = differenceInDays(currentDate, prevDate);
          if (diff === 1) {
            tempStreak++;
          } else {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

        return {
          salesperson_id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          role: sp.role,
          totalXP,
          level,
          xpInLevel,
          xpToNext,
          levelTitle: levelInfo.title,
          levelEmoji: levelInfo.emoji,
          levelColor: levelInfo.color,
          currentStreak,
          bestStreak,
          totalAchievements: uniqueDailyGoalDates.length + personAchievements.streakMilestones,
          dailyGoalsAchieved: uniqueDailyGoalDates.length,
          streakMilestonesAchieved: personAchievements.streakMilestones,
        };
      });

      // Sort by total XP descending
      return result.sort((a, b) => b.totalXP - a.totalXP);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// Hook to get gamification data for a single salesperson
export function useSalespersonGamification(salespersonId: string | null) {
  return useQuery({
    queryKey: ["gamification-single", salespersonId],
    queryFn: async (): Promise<SalespersonGamificationData | null> => {
      if (!salespersonId) return null;

      // Fetch salesperson
      const { data: sp, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("id", salespersonId)
        .maybeSingle();

      if (spError) throw spError;
      if (!sp) return null;

      // Fetch XP data
      const { data: xp } = await supabase
        .from("salesperson_xp")
        .select("total_xp, current_level")
        .eq("salesperson_id", salespersonId)
        .maybeSingle();

      // Fetch achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("achievement_type, achievement_date")
        .eq("salesperson_id", salespersonId)
        .order("achievement_date", { ascending: false });

      // XP calculations
      const totalXP = xp?.total_xp || 0;
      const { level, xpInLevel, xpToNext } = calculateLevelFromXP(totalXP);
      const levelInfo = getLevelInfo(level);

      // Achievement calculations
      const dailyGoalDates = (achievements || [])
        .filter(a => a.achievement_type === "daily_goal")
        .map(a => a.achievement_date);
      const uniqueDates = [...new Set(dailyGoalDates)].sort().reverse();
      const streakMilestones = (achievements || [])
        .filter(a => a.achievement_type.startsWith("streak_")).length;

      // Calculate current streak
      let currentStreak = 0;
      if (uniqueDates.length > 0) {
        const today = format(new Date(), "yyyy-MM-dd");
        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
        
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = parseISO(uniqueDates[i - 1]);
            const prevDate = parseISO(uniqueDates[i]);
            const diff = differenceInDays(currentDate, prevDate);
            if (diff === 1) {
              currentStreak++;
            } else {
              break;
            }
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
        if (diff === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

      return {
        salesperson_id: sp.id,
        name: sp.name,
        avatar_url: sp.avatar_url,
        role: sp.role,
        totalXP,
        level,
        xpInLevel,
        xpToNext,
        levelTitle: levelInfo.title,
        levelEmoji: levelInfo.emoji,
        levelColor: levelInfo.color,
        currentStreak,
        bestStreak,
        totalAchievements: uniqueDates.length + streakMilestones,
        dailyGoalsAchieved: uniqueDates.length,
        streakMilestonesAchieved: streakMilestones,
      };
    },
    enabled: !!salespersonId,
  });
}
