// Melhoria 2.6 - useDashboardKPIs.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardKPI {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

export const useDashboardKPIs = (userId?: string) => {
  return useQuery({
    queryKey: ['dashboard-kpis', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mv_dashboard_kpis')
        .select('*')
        .eq('user_id', userId || '')
        .single();
      
      if (error) throw error;
      
      const kpis: DashboardKPI[] = [
        {
          id: 'revenue',
          label: 'Revenue',
          value: data.revenue || 0,
          change: data.revenue_change || 0,
          trend: data.revenue_change > 0 ? 'up' : 'down',
          icon: 'dollar-sign',
        },
        // ... more KPIs
      ];
      
      return kpis;
    },
  });
};
