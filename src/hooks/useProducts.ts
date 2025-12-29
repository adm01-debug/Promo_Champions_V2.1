import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { fetchWithErrorHandling } from '@/utils/supabase-helpers';

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const query = supabase.from('products').select('*').eq('active', true);
      return fetchWithErrorHandling(query);
    }
  ,
    staleTime: 5 * 60 * 1000
  });
};
