import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DailyGoal {
  target: number;
  current: number;
  percentage: number;
  remaining: number;
}

export const useDailyCallGoals = () => {
  return useQuery<DailyGoal>({
    queryKey: ['daily-call-goals'],
    queryFn: async (): Promise<DailyGoal> => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('activities')
        .select('id')
        .eq('type', 'call')
        .gte('created_at', today);
      
      if (error) throw error;
      
      const current = data?.length || 0;
      const target = 20; // Default
      
      return {
        target,
        current,
        percentage: (current / target) * 100,
        remaining: Math.max(0, target - current)
      };
    }
  });
};
