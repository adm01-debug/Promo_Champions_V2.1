import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data ?? [];
    }
  });
}
