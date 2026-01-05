import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClosingTime = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['closingtime'],
    queryFn: async () => {
      const { data } = await supabase.from('closingtime').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
