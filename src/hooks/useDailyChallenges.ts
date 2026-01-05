import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDailyChallenges = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dailychallenges'],
    queryFn: async () => {
      const { data } = await supabase.from('dailychallenges').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
