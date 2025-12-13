import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import { XP_REWARDS, calculateLevelFromXP, getLevelInfo } from "./useSalespersonXP";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  salesperson_id: string;
  achievement_type: string;
  achievement_date: string;
  details: Json;
  created_at: string;
  salesperson?: {
    name: string;
    avatar_url: string | null;
    role: string;
  };
}

// Streak milestones that trigger special badges
const STREAK_MILESTONES = [3, 5, 7, 10, 15, 20, 30, 50, 100];

export function useAchievements(limit = 50) {
  return useQuery({
    queryKey: ["achievements", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select(`
          *,
          salesperson:salespeople(name, avatar_url, role)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Achievement[];
    },
  });
}

// Calculate current streak for a salesperson
async function calculateStreak(salespersonId: string): Promise<number> {
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("achievement_date")
    .eq("salesperson_id", salespersonId)
    .eq("achievement_type", "daily_goal")
    .order("achievement_date", { ascending: false })
    .limit(100);

  if (error || !achievements || achievements.length === 0) return 0;

  // Get unique dates and sort descending
  const uniqueDates = [...new Set(achievements.map(a => a.achievement_date))].sort().reverse();
  
  if (uniqueDates.length === 0) return 0;

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  
  // Streak must include today or yesterday to be active
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = parseISO(uniqueDates[i - 1]);
    const prevDate = parseISO(uniqueDates[i]);
    const diff = differenceInDays(currentDate, prevDate);
    
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Calculate best streak ever for a salesperson
async function calculateBestStreak(salespersonId: string): Promise<number> {
  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("achievement_date")
    .eq("salesperson_id", salespersonId)
    .eq("achievement_type", "daily_goal")
    .order("achievement_date", { ascending: false });

  if (error || !achievements || achievements.length === 0) return 0;

  const uniqueDates = [...new Set(achievements.map(a => a.achievement_date))].sort().reverse();
  
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
  bestStreak = Math.max(bestStreak, tempStreak);
  
  return bestStreak;
}

export function useRecordAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      salespersonId,
      achievementType = "daily_goal",
      details = {},
    }: {
      salespersonId: string;
      achievementType?: string;
      details?: Json;
    }) => {
      const today = format(new Date(), "yyyy-MM-dd");
      const detailsObj = details as Record<string, unknown> | null;
      const salespersonName = detailsObj?.name as string | undefined;
      
      // Check if achievement already recorded today
      const { data: existing } = await supabase
        .from("achievements")
        .select("id")
        .eq("salesperson_id", salespersonId)
        .eq("achievement_type", achievementType)
        .eq("achievement_date", today)
        .maybeSingle();

      if (existing) {
        return { achievement: existing, streakMilestone: null, nearRecord: null, newRecord: null, xpGained: 0, levelUpInfo: null };
      }

      // Get best streak BEFORE recording new achievement
      const previousBestStreak = await calculateBestStreak(salespersonId);

      // Record the daily goal achievement
      const { data, error } = await supabase
        .from("achievements")
        .insert([{
          salesperson_id: salespersonId,
          achievement_type: achievementType,
          achievement_date: today,
          details,
        }])
        .select()
        .single();

      if (error) throw error;

      // Calculate streak after recording
      const currentStreak = await calculateStreak(salespersonId);
      let streakMilestone: number | null = null;
      let nearRecord: { current: number; best: number } | null = null;
      let newRecord: number | null = null;
      let totalXPGained = 0;
      let levelUpInfo: { leveledUp: boolean; newLevel: number; previousLevel: number } | null = null;

      // Award XP for daily goal
      totalXPGained += XP_REWARDS.DAILY_GOAL;
      const xpResult = await addXPToSalesperson(
        salespersonId, 
        XP_REWARDS.DAILY_GOAL, 
        "achievement", 
        data.id, 
        "Meta diária batida",
        salespersonName
      );
      
      if (xpResult.leveledUp) {
        levelUpInfo = xpResult;
      }

      // Check if new personal record (current streak > previous best)
      if (currentStreak > 1 && currentStreak > previousBestStreak) {
        newRecord = currentStreak;
        // Award XP for new record
        totalXPGained += XP_REWARDS.NEW_RECORD;
        const recordXpResult = await addXPToSalesperson(
          salespersonId, 
          XP_REWARDS.NEW_RECORD, 
          "bonus", 
          null, 
          `Novo recorde pessoal: ${currentStreak} dias`,
          salespersonName
        );
        if (recordXpResult.leveledUp) {
          levelUpInfo = recordXpResult;
        }
      }
      // Check if near personal record (current streak = previous best - 1)
      else if (currentStreak > 1 && currentStreak === previousBestStreak - 1) {
        nearRecord = { current: currentStreak, best: previousBestStreak };
      }

      // Check if we hit a streak milestone
      if (STREAK_MILESTONES.includes(currentStreak)) {
        // Check if this streak milestone was already recorded
        const streakType = `streak_${currentStreak}`;
        const { data: existingStreak } = await supabase
          .from("achievements")
          .select("id")
          .eq("salesperson_id", salespersonId)
          .eq("achievement_type", streakType)
          .eq("achievement_date", today)
          .maybeSingle();

        if (!existingStreak) {
          // Record streak achievement
          await supabase
            .from("achievements")
            .insert([{
              salesperson_id: salespersonId,
              achievement_type: streakType,
              achievement_date: today,
              details: { streak: currentStreak, name: salespersonName || null } as Json,
            }]);
          
          streakMilestone = currentStreak;

          // Award XP for streak milestone
          const streakXP = getStreakXP(currentStreak);
          if (streakXP > 0) {
            totalXPGained += streakXP;
            const streakXpResult = await addXPToSalesperson(
              salespersonId, 
              streakXP, 
              "streak", 
              null, 
              `Sequência de ${currentStreak} dias`,
              salespersonName
            );
            if (streakXpResult.leveledUp) {
              levelUpInfo = streakXpResult;
            }
          }
        }
      }

      return { achievement: data, streakMilestone, nearRecord, newRecord, xpGained: totalXPGained, levelUpInfo };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["salesperson-xp"] });
      queryClient.invalidateQueries({ queryKey: ["all-salespeople-xp"] });
      queryClient.invalidateQueries({ queryKey: ["xp-history"] });
    },
  });
}

// Helper function to get streak XP reward
function getStreakXP(streak: number): number {
  if (streak >= 15) return XP_REWARDS.STREAK_15_DAYS;
  if (streak >= 10) return XP_REWARDS.STREAK_10_DAYS;
  if (streak >= 7) return XP_REWARDS.STREAK_7_DAYS;
  if (streak >= 5) return XP_REWARDS.STREAK_5_DAYS;
  if (streak >= 3) return XP_REWARDS.STREAK_3_DAYS;
  return 0;
}

// Helper function to add XP to salesperson
async function addXPToSalesperson(
  salespersonId: string,
  xpAmount: number,
  sourceType: string,
  sourceId: string | null,
  description: string,
  salespersonName?: string
): Promise<{ leveledUp: boolean; newLevel: number; previousLevel: number }> {
  // Get or create XP record
  let { data: xpRecord } = await supabase
    .from("salesperson_xp")
    .select("*")
    .eq("salesperson_id", salespersonId)
    .maybeSingle();

  const previousLevel = xpRecord?.current_level || 1;
  const newTotalXP = (xpRecord?.total_xp || 0) + xpAmount;
  const levelInfo = calculateLevelFromXP(newTotalXP);

  if (!xpRecord) {
    await supabase
      .from("salesperson_xp")
      .insert({
        salesperson_id: salespersonId,
        total_xp: newTotalXP,
        current_level: levelInfo.level,
        xp_to_next_level: levelInfo.xpToNext - levelInfo.xpInLevel,
      });
  } else {
    await supabase
      .from("salesperson_xp")
      .update({
        total_xp: newTotalXP,
        current_level: levelInfo.level,
        xp_to_next_level: levelInfo.xpToNext - levelInfo.xpInLevel,
      })
      .eq("id", xpRecord.id);
  }

  // Log XP history
  await supabase
    .from("xp_history")
    .insert({
      salesperson_id: salespersonId,
      xp_amount: xpAmount,
      source_type: sourceType,
      source_id: sourceId,
      description: description,
    });

  // Check if leveled up
  const leveledUp = levelInfo.level > previousLevel;
  if (leveledUp && salespersonName) {
    const newLevelInfo = getLevelInfo(levelInfo.level);
    toast.success(
      `${newLevelInfo.emoji} ${salespersonName} subiu para o nível ${levelInfo.level}!`,
      {
        description: `Novo título: ${newLevelInfo.title}`,
        duration: 5000,
      }
    );
  }

  return {
    leveledUp,
    newLevel: levelInfo.level,
    previousLevel,
  };
}

// Hook to get current and best streak for a salesperson
export function useSalespersonStreak(salespersonId: string | null) {
  return useQuery({
    queryKey: ["streak", salespersonId],
    queryFn: async () => {
      if (!salespersonId) return { current: 0, best: 0 };
      const current = await calculateStreak(salespersonId);
      const best = await calculateBestStreak(salespersonId);
      return { current, best };
    },
    enabled: !!salespersonId,
  });
}

// Hook to get streak ranking for all salespeople
export function useStreakRanking() {
  return useQuery({
    queryKey: ["streak-ranking"],
    queryFn: async () => {
      // Fetch all active salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true);

      if (spError) throw spError;
      if (!salespeople) return [];

      // Fetch all daily_goal achievements
      const { data: achievements, error: achError } = await supabase
        .from("achievements")
        .select("salesperson_id, achievement_date")
        .eq("achievement_type", "daily_goal")
        .order("achievement_date", { ascending: false });

      if (achError) throw achError;

      // Calculate streaks for each salesperson
      const streakData = salespeople.map(sp => {
        const spAchievements = (achievements || [])
          .filter(a => a.salesperson_id === sp.id)
          .map(a => a.achievement_date);

        const uniqueDates = [...new Set(spAchievements)].sort().reverse();
        
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

        // Calculate best streak ever
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
          currentStreak,
          bestStreak,
          totalGoalsAchieved: uniqueDates.length,
        };
      });

      // Sort by best streak, then current streak
      return streakData.sort((a, b) => {
        if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
        return b.currentStreak - a.currentStreak;
      });
    },
    refetchInterval: 60000,
  });
}
