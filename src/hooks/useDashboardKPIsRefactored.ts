import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KPIs {
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
}

export function useDashboardKPIs() {
  return useQuery<KPIs>({
    queryKey: ['dashboard-kpis'],
    queryFn: async (): Promise<KPIs> => {
      const { data, error } = await supabase.from('deals').select('*');
      if (error) throw error;
      
      return {
        totalDeals: data?.length ?? 0,
        totalRevenue: data?.reduce((sum, d) => sum + (d.value ?? 0), 0) ?? 0,
        conversionRate: 0
      };
    }
  });
}
