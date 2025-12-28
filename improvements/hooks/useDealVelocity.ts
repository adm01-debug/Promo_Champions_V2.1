import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DealVelocityMetrics {
  avgDaysToClose: number;
  avgDealValue: number;
  dealVelocity: number; // valor por dia
  periodStart: Date;
  periodEnd: Date;
  dealsAnalyzed: number;
  trend: 'improving' | 'stable' | 'declining';
}

export const useDealVelocity = (days: number = 30) => {
  return useQuery<DealVelocityMetrics>({
    queryKey: ['deal-velocity', days],
    queryFn: async (): Promise<DealVelocityMetrics> => {
      const periodEnd = new Date();
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - days);
      
      const { data, error } = await supabase
        .from('deals')
        .select('id, value, created_at, closed_at, status')
        .eq('status', 'won')
        .gte('closed_at', periodStart.toISOString())
        .lte('closed_at', periodEnd.toISOString());
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          avgDaysToClose: 0,
          avgDealValue: 0,
          dealVelocity: 0,
          periodStart,
          periodEnd,
          dealsAnalyzed: 0,
          trend: 'stable'
        };
      }
      
      const dealsWithDuration = data.map(deal => {
        const created = new Date(deal.created_at);
        const closed = new Date(deal.closed_at);
        const daysToClose = (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return { ...deal, daysToClose };
      });
      
      const totalDays = dealsWithDuration.reduce((sum, d) => sum + d.daysToClose, 0);
      const totalValue = dealsWithDuration.reduce((sum, d) => sum + d.value, 0);
      
      const avgDaysToClose = totalDays / data.length;
      const avgDealValue = totalValue / data.length;
      const dealVelocity = avgDealValue / avgDaysToClose;
      
      // Calcular trend comparando com período anterior
      const prevPeriodStart = new Date(periodStart);
      prevPeriodStart.setDate(prevPeriodStart.getDate() - days);
      
      const { data: prevData } = await supabase
        .from('deals')
        .select('value, created_at, closed_at')
        .eq('status', 'won')
        .gte('closed_at', prevPeriodStart.toISOString())
        .lt('closed_at', periodStart.toISOString());
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      
      if (prevData && prevData.length > 0) {
        const prevDeals = prevData.map(d => {
          const created = new Date(d.created_at);
          const closed = new Date(d.closed_at);
          return {
            value: d.value,
            daysToClose: (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          };
        });
        
        const prevAvgDays = prevDeals.reduce((sum, d) => sum + d.daysToClose, 0) / prevDeals.length;
        const prevAvgValue = prevDeals.reduce((sum, d) => sum + d.value, 0) / prevDeals.length;
        const prevVelocity = prevAvgValue / prevAvgDays;
        
        const velocityChange = ((dealVelocity - prevVelocity) / prevVelocity) * 100;
        
        if (velocityChange > 10) trend = 'improving';
        else if (velocityChange < -10) trend = 'declining';
      }
      
      return {
        avgDaysToClose: Math.round(avgDaysToClose * 10) / 10,
        avgDealValue: Math.round(avgDealValue * 100) / 100,
        dealVelocity: Math.round(dealVelocity * 100) / 100,
        periodStart,
        periodEnd,
        dealsAnalyzed: data.length,
        trend
      };
    },
    staleTime: 10 * 60 * 1000
  });
};
