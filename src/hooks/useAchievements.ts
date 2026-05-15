import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { Json } from '@/integrations/supabase/types';

// Extended achievement type matching database schema
export interface AchievementRecord {
  id: string;
  salesperson_id: string;
  achievement_type: string;
  achievement_date: string;
  details: Json | null;
  created_at: string;
  salesperson?: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string;
  };
}

export interface StreakRanking {
  salesperson_id: string;
  salesperson_name: string;
  avatar_url: string | null;
  current_streak: number;
  best_streak: number;
  rank: number;
  // Aliases for component compatibility
  name?: string;
  role?: string;
  currentStreak?: number;
  bestStreak?: number;
  totalGoalsAchieved?: number;
}

export interface SalespersonStreak {
  current: number;
  best: number;
  lastAchievementDate: string | null;
}

export interface RecordAchievementResult {
  success: boolean;
  levelUpInfo?: {
    leveledUp: boolean;
    newLevel: number;
    levelTitle?: string;
    levelEmoji?: string;
  };
  newRecord?: number;
  nearRecord?: { current: number; best: number };
  streakMilestone?: number;
}

export const useAchievements = (limit?: number) => {
  return useQuery<AchievementRecord[]>({
    queryKey: ['achievements', limit],
    queryFn: async (): Promise<AchievementRecord[]> => {
      let query = supabase
        .from('achievements')
        .select(`
          *,
          salesperson:salespeople(id, name, avatar_url, role)
        `)
        .order('achievement_date', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AchievementRecord[];
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useStreakRanking = () => {
  return useQuery<StreakRanking[]>({
    queryKey: ['streak-ranking'],
    queryFn: async (): Promise<StreakRanking[]> => {
      // Get all salespeople with their achievements
      const { data: salespeople, error: spError } = await supabase
        .from('salespeople')
        .select('id, name, avatar_url, role')
        .eq('is_active', true);
      
      if (spError) throw spError;
      
      const rankings: StreakRanking[] = [];
      
      for (const sp of salespeople || []) {
        const { data: achievements } = await supabase
          .from('achievements')
          .select('achievement_date, achievement_type')
          .eq('salesperson_id', sp.id)
          .eq('achievement_type', 'daily_goal')
          .order('achievement_date', { ascending: false });
        
        // Calculate current and best streak
        let currentStreak = 0;
        let bestStreak = 0;
        
        if (achievements && achievements.length > 0) {
          currentStreak = achievements.length > 0 ? 1 : 0;
          bestStreak = achievements.length;
        }
        
        rankings.push({
          salesperson_id: sp.id,
          salesperson_name: sp.name,
          avatar_url: sp.avatar_url,
          current_streak: currentStreak,
          best_streak: bestStreak,
          rank: 0,
          // Add aliases for component compatibility
          name: sp.name,
          role: sp.role,
          currentStreak: currentStreak,
          bestStreak: bestStreak,
          totalGoalsAchieved: achievements?.length || 0,
        });
      }
      
      // Sort by current streak and assign ranks
      rankings.sort((a, b) => b.current_streak - a.current_streak);
      rankings.forEach((r, i) => { r.rank = i + 1; });
      
      return rankings;
    },
    staleTime: 5 * 60 * 1000, // Optimize: Ranking doesn't need to be hyper-reactive
    gcTime: 15 * 60 * 1000,
  });
};

export const useSalespersonStreak = (salespersonId?: string) => {
  return useQuery<SalespersonStreak>({
    queryKey: ['salesperson-streak', salespersonId],
    enabled: !!salespersonId,
    queryFn: async (): Promise<SalespersonStreak> => {
      if (!salespersonId) {
        return { current: 0, best: 0, lastAchievementDate: null };
      }
      
      const { data: achievements } = await supabase
        .from('achievements')
        .select('achievement_date')
        .eq('salesperson_id', salespersonId)
        .eq('achievement_type', 'daily_goal')
        .order('achievement_date', { ascending: false });
      
      const current = achievements?.length || 0;
      const best = achievements?.length || 0;
      const lastAchievementDate = achievements?.[0]?.achievement_date || null;
      
      return { current, best, lastAchievementDate };
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRecordAchievement = () => {
  const queryClient = useQueryClient();
  
  return useMutation<RecordAchievementResult, Error, {
    salespersonId: string;
    achievementType: string;
    details?: Record<string, unknown>;
  }>({
    mutationFn: async ({ salespersonId, achievementType, details }) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already recorded today
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('salesperson_id', salespersonId)
        .eq('achievement_type', achievementType)
        .eq('achievement_date', today)
        .single();
      
      if (existing) {
        return { success: true };
      }
      
      // Record the achievement
      const { error } = await supabase
        .from('achievements')
        .insert({
          salesperson_id: salespersonId,
          achievement_type: achievementType,
          achievement_date: today,
          details: (details || null) as Json,
        });
      
      if (error) throw error;
      
      // Check for streak milestones
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('achievement_date')
        .eq('salesperson_id', salespersonId)
        .eq('achievement_type', 'daily_goal')
        .order('achievement_date', { ascending: false });
      
      const streakCount = allAchievements?.length || 1;
      const streakMilestones = [3, 5, 7, 10, 15, 20, 30, 50, 100];
      const streakMilestone = streakMilestones.includes(streakCount) ? streakCount : undefined;
      
      // Record streak achievement if milestone
      if (streakMilestone) {
        await supabase
          .from('achievements')
          .insert({
            salesperson_id: salespersonId,
            achievement_type: `streak_${streakMilestone}`,
            achievement_date: today,
            details: { streak_count: streakMilestone } as Json,
          });
      }
      
      return {
        success: true,
        streakMilestone,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['streak-ranking'] });
      queryClient.invalidateQueries({ queryKey: ['salesperson-streak'] });
    },
  });
};
