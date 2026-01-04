import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target_value: number;
  current_progress: number;
  reward_xp: number;
  reward_coins?: number;
  completed: boolean;
  expires_at: string;
}

interface DailyChallengesData {
  challenges: Challenge[];
  completedToday: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
}

export const useDailyChallenges = () => {
  return useQuery<DailyChallengesData>({
    queryKey: ['daily-challenges'],
    queryFn: async (): Promise<DailyChallengesData> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const challenges = (data || []) as Challenge[];
      const completedToday = challenges.filter(c => c.completed).length;
      const totalXpEarned = challenges
        .filter(c => c.completed)
        .reduce((sum, c) => sum + c.reward_xp, 0);
      const totalCoinsEarned = challenges
        .filter(c => c.completed)
        .reduce((sum, c) => sum + (c.reward_coins || 0), 0);
      
      return {
        challenges,
        completedToday,
        totalXpEarned,
        totalCoinsEarned
      };
    },
    refetchInterval: 60000 // Refetch a cada minuto
  });
};
