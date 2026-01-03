import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface DealScore {
  saleId: string;
  score: number;
  probability: number;
  factors: {
    valueScore: number;
    activityScore: number;
    velocityScore: number;
    sourceScore: number;
    categoryScore: number;
  };
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PredictiveScoreResult {
  deals: DealScore[];
  avgScore: number;
  highPriorityCount: number;
}

export function usePredictiveDealScoring() {
  return useQuery({
    queryKey: ['predictive-deal-scoring'],
    queryFn: async (): Promise<PredictiveScoreResult> => {
      // Buscar deals ativos
      const { data: activeDeals, error: dealsError } = await supabase
        .from('sales')
        .select('id, amount, status, source, category, created_at, salesperson_id')
        .eq('status', 'pending');

      if (dealsError) throw dealsError;

      // Buscar atividades recentes para cada deal
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('sale_id, activity_type, outcome, created_at')
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      // Buscar histórico de conversão por source
      const { data: completedDeals, error: completedError } = await supabase
        .from('sales')
        .select('source, category, amount')
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Calcular taxas de conversão por source
      const sourceConversion: Record<string, number> = {};
      const categoryConversion: Record<string, number> = {};

      completedDeals?.forEach(deal => {
        if (deal.source) {
          sourceConversion[deal.source] = (sourceConversion[deal.source] || 0) + 1;
        }
        if (deal.category) {
          categoryConversion[deal.category] = (categoryConversion[deal.category] || 0) + 1;
        }
      });

      const totalCompleted = completedDeals?.length || 1;

      // Calcular score para cada deal
      const deals: DealScore[] = (activeDeals || []).map(deal => {
        const dealActivities = activities?.filter(a => a.sale_id === deal.id) || [];
        const recentActivities = dealActivities.filter(a => {
          const actDate = new Date(a.created_at);
          const now = new Date();
          return (now.getTime() - actDate.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 dias
        });

        // Score baseado em valor (0-25)
        const avgValue = completedDeals?.reduce((sum, d) => sum + d.amount, 0) || 0;
        const avgAmount = totalCompleted > 0 ? avgValue / totalCompleted : 1;
        const valueScore = Math.min(25, Math.round((deal.amount / avgAmount) * 12.5));

        // Score baseado em atividades recentes (0-25)
        const activityScore = Math.min(25, recentActivities.length * 5);

        // Score baseado em velocidade (0-25)
        const daysSinceCreation = Math.ceil(
          (new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const velocityScore = Math.max(0, 25 - Math.floor(daysSinceCreation / 7) * 5);

        // Score baseado na source (0-15)
        const sourceRate = deal.source ? (sourceConversion[deal.source] || 0) / totalCompleted : 0;
        const sourceScore = Math.round(sourceRate * 100 * 0.15);

        // Score baseado na categoria (0-10)
        const categoryRate = deal.category ? (categoryConversion[deal.category] || 0) / totalCompleted : 0;
        const categoryScore = Math.round(categoryRate * 100 * 0.10);

        const score = valueScore + activityScore + velocityScore + sourceScore + categoryScore;
        const probability = Math.min(95, Math.max(5, score));

        let priority: 'high' | 'medium' | 'low';
        let recommendation: string;

        if (score >= 70) {
          priority = 'high';
          recommendation = 'Fechar agora! Deal com alta probabilidade de conversão.';
        } else if (score >= 40) {
          priority = 'medium';
          recommendation = 'Aumentar engajamento. Agendar follow-up em 2 dias.';
        } else {
          priority = 'low';
          recommendation = 'Reavaliar qualificação. Considerar nurturing campaign.';
        }

        return {
          saleId: deal.id,
          score,
          probability,
          factors: { valueScore, activityScore, velocityScore, sourceScore, categoryScore },
          recommendation,
          priority,
        };
      });

      const avgScore = deals.length > 0
        ? deals.reduce((sum, d) => sum + d.score, 0) / deals.length
        : 0;

      const highPriorityCount = deals.filter(d => d.priority === 'high').length;

      return { deals, avgScore, highPriorityCount };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
