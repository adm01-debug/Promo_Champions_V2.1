import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReportData() {
  return useQuery({
    queryKey: ['report-data'],
    queryFn: async (): Promise<any> => {
      const { data, error } = await supabase.from('deals').select('*');
      if (error) throw error;
      return data ?? [];
    }
  });
}
