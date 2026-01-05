import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductRecommendations = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['productrecommendations'],
    queryFn: async () => {
      const { data } = await supabase.from('productrecommendations').select('*');
      return data || [];
    },
  });

  return { data, isLoading };
};
