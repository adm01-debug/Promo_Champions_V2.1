// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientPortfolio = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['clientportfolio'],
    queryFn: async () => {
      const { data } = await supabase.from('clientportfolio').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
