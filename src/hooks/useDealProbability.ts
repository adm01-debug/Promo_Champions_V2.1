import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchStageProbabilities } from '@/lib/stageProbabilities';

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

      const stageProbabilities = await fetchStageProbabilities();

      const factors: string[] = [];
      let probability = calculateStageScore(sale.status, stageProbabilities);
      factors.push(`Etapa: ${sale.status}`);

      const engScore = calculateEngagementScore(activityCount || 0);
      if (engScore > 50) factors.push('Alta atividade');
      else if (engScore < 20) factors.push('Baixa atividade');

      probability = Math.round(
        (probability +
          engScore +
          calculateValueScore(sale.amount) +
          calculateTimeScore(sale.created_at)) /
          4
      );

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
          Object.entries(
            data.probabilities as Record<string, { probability: number }>
          ).forEach(([id, val]) => {
            result[id] = val.probability;
          });
          return result;
        }
      } catch {
        // Fallback
      }

      // Local fallback
      const stageProbabilities = await fetchStageProbabilities();
      return sales.reduce(
        (acc, sale) => {
          acc[sale.id] = Math.round(calculateStageScore(sale.status, stageProbabilities));
          return acc;
        },
        {} as Record<string, number>
      );
    },
  });
};

function calculateStageScore(
  status: string,
  stageProbabilities: Record<string, number>
): number {
  return (stageProbabilities[status] ?? 0.2) * 100;
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
