import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyChallenge {
  id: string;
  user_id: string;
  challenge_type: 'calls' | 'meetings' | 'demos' | 'proposals';
  target: number;
  progress: number;
  date: string;
  completed: boolean;
}

export const useDailyChallenges = (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['dailyChallenges', userId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      if (error) throw error;
      return data as DailyChallenge[];
    },
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const { data, error } = await supabase
        .from('daily_challenges')
        .update({ progress, completed: progress >= 100 })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyChallenges'] });
    },
  });
};
