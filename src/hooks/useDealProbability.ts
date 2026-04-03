import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDealProbability = (saleId: string) => {
  return useQuery<{ probability: number; factors: string[] }>({
    queryKey: ['deal-probability', saleId],
    queryFn: async () => {
      // Try edge function first for richer analysis
      try {
        const { data, error } = await supabase.functions.invoke('deal-probability', {
          body: { dealIds: [saleId] },
        });

        if (!error && data?.probabilities?.[saleId]) {
          return data.probabilities[saleId];
        }
      } catch {
        // Fallback to local calculation
      }

      // Local fallback
      const { data: sale } = await supabase
        .from('sales')
        .select('id, status, amount, created_at, salesperson_id')
        .eq('id', saleId)
        .single();

      if (!sale) throw new Error('Deal not found');

      const { count: activityCount } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('sale_id', saleId);

      const factors: string[] = [];
      let probability = calculateStageScore(sale.status);
      factors.push(`Etapa: ${sale.status}`);

      const engScore = calculateEngagementScore(activityCount || 0);
      if (engScore > 50) factors.push('Alta atividade');
      else if (engScore < 20) factors.push('Baixa atividade');

      probability = Math.round((probability + engScore + calculateValueScore(sale.amount) + calculateTimeScore(sale.created_at)) / 4);

      return { probability, factors: factors.length > 0 ? factors : ['Análise padrão'] };
    },
    enabled: !!saleId,
  });
};

// Batch probability calculation using edge function
export const useDealProbabilities = () => {
  return useQuery({
    queryKey: ['deal-probabilities'],
    queryFn: async () => {
      const { data: sales } = await supabase
        .from('sales')
        .select('id, status, amount, created_at')
        .in('status', ['pending', 'completed']);

      if (!sales || sales.length === 0) return {};

      const dealIds = sales.map(s => s.id);

      // Try edge function
      try {
        const { data, error } = await supabase.functions.invoke('deal-probability', {
          body: { dealIds: dealIds.slice(0, 50) },
        });

        if (!error && data?.probabilities) {
          const result: Record<string, number> = {};
          Object.entries(data.probabilities).forEach(([id, val]: [string, any]) => {
            result[id] = val.probability;
          });
          return result;
        }
      } catch {
        // Fallback
      }

      // Local fallback
      return sales.reduce((acc, sale) => {
        acc[sale.id] = Math.round(calculateStageScore(sale.status));
        return acc;
      }, {} as Record<string, number>);
    },
  });
};

function calculateStageScore(status: string): number {
  const scores: Record<string, number> = {
    'pending': 30,
    'completed': 100,
    'cancelled': 0,
    'lead': 10,
    'prospecting': 20,
    'qualified': 40,
    'proposal': 60,
    'negotiation': 75,
    'won': 100,
    'lost': 0,
  };
  return scores[status] || 20;
}

function calculateValueScore(value: number): number {
  return Math.min(value / 1000, 100);
}

function calculateTimeScore(createdAt: string): number {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(100 - days * 2, 0);
}

function calculateEngagementScore(activityCount: number): number {
  return Math.min(activityCount * 5, 100);
}
