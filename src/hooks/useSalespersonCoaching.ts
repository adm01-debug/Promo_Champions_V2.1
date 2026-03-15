import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CoachingInsight {
  area: string;
  score: number;
  benchmark: number;
  recommendation: string;
}

export interface CoachingData {
  insights: CoachingInsight[];
  salespersonName: string;
}

export const useSalespersonCoaching = (salespersonId: string | null) => {
  return useQuery<CoachingData | null>({
    queryKey: ['salesperson-coaching', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return null;

      // Get salesperson info
      const { data: sp } = await supabase
        .from('salespeople')
        .select('name')
        .eq('id', salespersonId)
        .single();

      // Get their sales
      const { data: sales } = await supabase
        .from('sales')
        .select('id, amount, status, created_at')
        .eq('salesperson_id', salespersonId);

      // Get their deal outcomes
      const { data: outcomes } = await supabase
        .from('deal_outcomes')
        .select('outcome, reason')
        .eq('salesperson_id', salespersonId);

      // Get their activities
      const { data: activities } = await supabase
        .from('activities')
        .select('id, activity_type, outcome')
        .eq('salesperson_id', salespersonId);

      const allSales = sales || [];
      const allOutcomes = outcomes || [];
      const allActivities = activities || [];
      const completed = allSales.filter(s => s.status === 'completed');
      const wins = allOutcomes.filter(o => o.outcome === 'won').length;
      const insights: CoachingInsight[] = [];

      // Win rate
      const winRate = allOutcomes.length > 0 ? (wins / allOutcomes.length) * 100 : 0;
      insights.push({
        area: 'Taxa de Conversão',
        score: Math.round(winRate),
        benchmark: 30,
        recommendation: winRate < 30
          ? 'Foque em qualificação e tratamento de objeções'
          : 'Excelente taxa! Continue assim',
      });

      // Average deal size
      const avgSize = completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.amount || 0), 0) / completed.length
        : 0;
      insights.push({
        area: 'Ticket Médio',
        score: Math.round(avgSize),
        benchmark: 50000,
        recommendation: avgSize < 50000
          ? 'Busque oportunidades de maior valor'
          : 'Ótimo ticket médio mantido',
      });

      // Activity volume
      const activityScore = Math.min(allActivities.length * 2, 100);
      insights.push({
        area: 'Volume de Atividades',
        score: activityScore,
        benchmark: 60,
        recommendation: activityScore < 60
          ? 'Aumente o volume de atividades diárias'
          : 'Bom ritmo de atividades',
      });

      // Connected calls ratio
      const calls = allActivities.filter(a => a.activity_type === 'call');
      const connected = calls.filter(a => a.outcome === 'connected');
      const connectRate = calls.length > 0 ? (connected.length / calls.length) * 100 : 0;
      insights.push({
        area: 'Taxa de Conexão',
        score: Math.round(connectRate),
        benchmark: 40,
        recommendation: connectRate < 40
          ? 'Melhore o timing e abordagem das ligações'
          : 'Boa taxa de conexão',
      });

      return {
        insights,
        salespersonName: sp?.name || 'Vendedor',
      };
    },
    enabled: !!salespersonId,
    staleTime: 1000 * 60 * 5,
  });
};
