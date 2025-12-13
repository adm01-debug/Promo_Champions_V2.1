import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

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
      
      // Check if achievement already recorded today
      const { data: existing } = await supabase
        .from("achievements")
        .select("id")
        .eq("salesperson_id", salespersonId)
        .eq("achievement_type", achievementType)
        .eq("achievement_date", today)
        .maybeSingle();

      if (existing) {
        return { achievement: existing, streakMilestone: null };
      }

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
          const detailsObj = details as Record<string, unknown> | null;
          // Record streak achievement
          await supabase
            .from("achievements")
            .insert([{
              salesperson_id: salespersonId,
              achievement_type: streakType,
              achievement_date: today,
              details: { streak: currentStreak, name: detailsObj?.name || null } as Json,
            }]);
          
          streakMilestone = currentStreak;
        }
      }

      return { achievement: data, streakMilestone };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}

// Hook to get current streak for a salesperson
export function useSalespersonStreak(salespersonId: string | null) {
  return useQuery({
    queryKey: ["streak", salespersonId],
    queryFn: async () => {
      if (!salespersonId) return 0;
      return calculateStreak(salespersonId);
    },
    enabled: !!salespersonId,
  });
}
