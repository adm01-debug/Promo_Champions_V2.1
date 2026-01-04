import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GamificationData {
  points: number;
  level: number;
  achievements: string[];
}

export function useGamificationData() {
  return useQuery<GamificationData>({
    queryKey: ['gamification'],
    queryFn: async (): Promise<GamificationData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      return {
        points: 0,
        level: 1,
        achievements: []
      };
    }
  });
}
