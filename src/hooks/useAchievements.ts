import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const useAchievements = () => {
  return useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async (): Promise<Achievement[]> => {
      const query = supabase.from('achievements').select('*');
      return fetchWithErrorHandling(query);
    }
  ,
    staleTime: 5 * 60 * 1000
  });
};
