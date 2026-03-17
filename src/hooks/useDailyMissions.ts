import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyMission {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  currentValue: number;
  completed: boolean;
  xp_claimed: boolean;
}

export function useDailyMissions(salespersonId?: string) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: missions, isLoading } = useQuery({
    queryKey: ['daily-missions', today, salespersonId],
    queryFn: async (): Promise<DailyMission[]> => {
      const { data: challenges, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .eq('is_active', true);

      if (error) throw error;
      if (!challenges?.length) return [];

      if (!salespersonId) {
        return challenges.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          challenge_type: c.challenge_type,
          target_value: c.target_value,
          xp_reward: c.xp_reward,
          currentValue: 0,
          completed: false,
          xp_claimed: false,
        }));
      }

      const { data: progress } = await supabase
        .from('daily_challenge_progress')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .in('challenge_id', challenges.map(c => c.id));

      return challenges.map(c => {
        const p = progress?.find(pr => pr.challenge_id === c.id);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          challenge_type: c.challenge_type,
          target_value: c.target_value,
          xp_reward: c.xp_reward,
          currentValue: p?.current_value || 0,
          completed: !!p?.completed_at,
          xp_claimed: p?.xp_claimed || false,
        };
      });
    },
    enabled: true,
  });

  const claimXP = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!salespersonId) throw new Error('No salesperson');
      const { error } = await supabase
        .from('daily_challenge_progress')
        .update({ xp_claimed: true })
        .eq('challenge_id', challengeId)
        .eq('salesperson_id', salespersonId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-missions'] }),
  });

  const completedCount = missions?.filter(m => m.completed).length || 0;
  const totalCount = missions?.length || 0;

  return { missions, isLoading, claimXP, completedCount, totalCount };
}
