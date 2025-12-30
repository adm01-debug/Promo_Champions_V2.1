// Melhoria 2.7 - useGamificationData.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GamificationData {
  level: number;
  xp: number;
  xp_to_next_level: number;
  achievements: Achievement[];
  rank: number;
  streak: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export const useGamificationData = (userId: string) => {
  return useQuery({
    queryKey: ['gamification', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*, achievements(*)')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data as GamificationData;
    },
  });
};
