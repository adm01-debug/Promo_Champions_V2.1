import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRegionalSales = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['regionalsales'],
    queryFn: async () => {
      const { data } = await supabase.from('regionalsales').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
