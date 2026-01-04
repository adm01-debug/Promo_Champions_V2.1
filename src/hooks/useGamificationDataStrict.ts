import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserLevel {
  level: number;
  xp: number;
  xpToNextLevel: number;
  percentToNext: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  total_xp: number;
  level: number;
  rank: number;
}

export const useUserLevel = (userId: string) => {
  return useQuery<UserLevel, Error>({
    queryKey: ['userLevel', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('xp')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      const xp = data?.xp || 0;
      const level = Math.floor(xp / 1000) + 1;
      const xpInLevel = xp % 1000;
      const xpToNextLevel = 1000;
      
      return {
        level,
        xp,
        xpToNextLevel,
        percentToNext: (xpInLevel / xpToNextLevel) * 100,
      };
    },
  });
};

export const useAchievements = (userId: string) => {
  return useQuery<Achievement[], Error>({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          user_achievements!left(unlocked_at)
        `)
        .order('xp_reward');
      
      if (error) throw error;
      
      return data?.map(a => ({
        ...a,
        unlocked: !!a.user_achievements?.[0]?.unlocked_at,
        unlocked_at: a.user_achievements?.[0]?.unlocked_at,
      })) as Achievement[];
    },
  });
};

export const useLeaderboard = (limit: number = 10) => {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          total_xp,
          users(email, avatar_url)
        `)
        .order('total_xp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data?.map((entry, index) => ({
        user_id: entry.user_id,
        user_name: entry.users?.email || 'Unknown',
        user_avatar: entry.users?.avatar_url,
        total_xp: entry.total_xp,
        level: Math.floor(entry.total_xp / 1000) + 1,
        rank: index + 1,
      })) as LeaderboardEntry[];
    },
  });
};

export const useAwardXP = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { userId: string; xp: number; reason: string }>({
    mutationFn: async ({ userId, xp, reason }) => {
      const { error } = await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_xp_amount: xp,
        p_reason: reason,
      });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userLevel', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};
