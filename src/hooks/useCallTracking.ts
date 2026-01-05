import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCallTracking = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['calltracking'],
    queryFn: async () => {
      const { data } = await supabase.from('calltracking').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
