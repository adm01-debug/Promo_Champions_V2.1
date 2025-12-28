import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HookData {
  id: string;
  value: number;
  created_at: string;
}

export const useHookRefactored = () => {
  return useQuery<HookData[]>({
    queryKey: ['hook-data'],
    queryFn: async (): Promise<HookData[]> => {
      const { data, error } = await supabase
        .from('table_name')
        .select('*');
      
      if (error) throw error;
      return (data || []) as HookData[];
    }
  });
};
