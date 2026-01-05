import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWinLossAnalysis = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['winlossanalysis'],
    queryFn: async () => {
      const { data } = await supabase.from('winlossanalysis').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
