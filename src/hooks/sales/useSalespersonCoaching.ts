import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CoachingInsight {
  area: string;
  score: number;
  benchmark: number;
  recommendation: string;
}

/**
 * Full coaching data structure used by SalespersonCoaching and CoachingComparison components.
 * Combines metrics analysis with actionable coaching recommendations.
 */
export interface EdgeFunctionCoachingData {
  salesperson: { id: string; name: string; avatar_url: string | null };
  metrics: {
    totalDeals: number;
    wins: number;
    losses: number;
    winRate: number;
    comparisonToTeam: number;
    avgDealValue: number;
    topLossReasons: Array<{ reason: string; count: number; percentage: number }>;
  };
  coaching: {
    summary: string;
    strengths: Array<{ title: string; description: string }>;
    improvements: Array<{ title: string; description: string; priority: string }>;
    actions: Array<{ action: string; timeline: string; expectedImpact: string }>;
  };
  generatedAt: string;
}

// Keep simple type as alias for backwards compatibility
export type CoachingData = EdgeFunctionCoachingData;

export const useSalespersonCoaching = (salespersonId: string | null) => {
  return useQuery<EdgeFunctionCoachingData | null>({
    queryKey: ['salesperson-coaching', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return null;

      // Get salesperson info
      const { data: sp } = await supabase
        .from('salespeople')
        .select('id, name, avatar_url')
        .eq('id', salespersonId)
        .single();

      if (!sp) return null;

      // Get their sales
      const { data: sales } = await supabase
        .from('sales')
        .select('id, amount, status, created_at')
        .eq('salesperson_id', salespersonId);

      // Get deal outcomes
      const { data: outcomes } = await supabase
        .from('deal_outcomes')
        .select('outcome, reason')
        .eq('salesperson_id', salespersonId);

      // Get activities
      const { data: activities } = await supabase
        .from('activities')
        .select('id, activity_type, outcome')
        .eq('salesperson_id', salespersonId);

      // Get team average for comparison
      const { data: _allTeamSales } = await supabase
        .from('sales')
        .select('amount, status, salesperson_id');
      
      const { data: allTeamOutcomes } = await supabase
        .from('deal_outcomes')
        .select('outcome, salesperson_id');

      const allSales = sales || [];
      const allOutcomes = outcomes || [];
      const allActivities = activities || [];

      const wins = allOutcomes.filter(o => o.outcome === 'won').length;
      const losses = allOutcomes.filter(o => o.outcome === 'lost').length;
      const totalOutcomes = allOutcomes.length;
      const winRate = totalOutcomes > 0 ? (wins / totalOutcomes) * 100 : 0;

      // Team average win rate
      const teamOutcomes = allTeamOutcomes || [];
      const teamWins = teamOutcomes.filter(o => o.outcome === 'won').length;
      const teamWinRate = teamOutcomes.length > 0 ? (teamWins / teamOutcomes.length) * 100 : 0;
      const comparisonToTeam = teamWinRate > 0 ? winRate - teamWinRate : 0;

      // Average deal value
      const completedSales = allSales.filter(s => s.status === 'completed');
      const totalRevenue = completedSales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const avgDealValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

      // Top loss reasons
      const lossReasons = allOutcomes
        .filter(o => o.outcome === 'lost' && o.reason)
        .reduce((acc, o) => {
          acc[o.reason] = (acc[o.reason] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const topLossReasons = Object.entries(lossReasons)
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: losses > 0 ? (count / losses) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Generate coaching insights
      const strengths: Array<{ title: string; description: string }> = [];
      const improvements: Array<{ title: string; description: string; priority: string }> = [];
      const actions: Array<{ action: string; timeline: string; expectedImpact: string }> = [];

      // Analyze and generate recommendations
      if (winRate >= 40) {
        strengths.push({
          title: 'Boa taxa de conversão',
          description: `Taxa de ${winRate.toFixed(1)}% está acima da média. Continue mantendo a qualidade no processo.`,
        });
      } else if (totalOutcomes > 0) {
        improvements.push({
          title: 'Taxa de conversão abaixo do esperado',
          description: `Taxa de ${winRate.toFixed(1)}% pode ser melhorada com melhor qualificação de leads.`,
          priority: 'alta',
        });
        actions.push({
          action: 'Revisar critérios de qualificação de leads',
          timeline: 'Próximas 2 semanas',
          expectedImpact: 'Aumento de 10-15% na taxa de conversão',
        });
      }

      if (avgDealValue > 50000) {
        strengths.push({
          title: 'Ticket médio alto',
          description: `Média de R$ ${avgDealValue.toFixed(0)} por deal demonstra foco em oportunidades de valor.`,
        });
      } else if (completedSales.length > 0) {
        improvements.push({
          title: 'Oportunidade de aumentar ticket médio',
          description: `Ticket atual de R$ ${avgDealValue.toFixed(0)}. Explore upsell e cross-sell.`,
          priority: 'média',
        });
        actions.push({
          action: 'Implementar estratégia de upsell nos deals existentes',
          timeline: 'Próximo mês',
          expectedImpact: 'Aumento de 20% no ticket médio',
        });
      }

      if (allActivities.length >= 50) {
        strengths.push({
          title: 'Alto volume de atividades',
          description: `${allActivities.length} atividades registradas demonstram consistência e disciplina.`,
        });
      } else {
        improvements.push({
          title: 'Aumentar volume de atividades',
          description: `${allActivities.length} atividades registradas. Recomenda-se aumentar a cadência.`,
          priority: allActivities.length < 20 ? 'alta' : 'baixa',
        });
      }

      if (comparisonToTeam < -10) {
        actions.push({
          action: 'Sessão de coaching com top performer da equipe',
          timeline: 'Esta semana',
          expectedImpact: 'Alinhamento com melhores práticas do time',
        });
      }

      const summary = winRate >= 40
        ? `${sp.name} demonstra bom desempenho com taxa de conversão de ${winRate.toFixed(1)}%. Foco em manter consistência e escalar resultados.`
        : `${sp.name} tem oportunidades de melhoria na conversão (${winRate.toFixed(1)}%). Recomenda-se foco em qualificação e tratamento de objeções.`;

      return {
        salesperson: {
          id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
        },
        metrics: {
          totalDeals: allSales.length,
          wins,
          losses,
          winRate,
          comparisonToTeam: Math.round(comparisonToTeam * 10) / 10,
          avgDealValue: Math.round(avgDealValue),
          topLossReasons,
        },
        coaching: {
          summary,
          strengths,
          improvements,
          actions,
        },
        generatedAt: new Date().toISOString(),
      };
    },
    enabled: !!salespersonId,
    staleTime: 1000 * 60 * 5,
  });
};
