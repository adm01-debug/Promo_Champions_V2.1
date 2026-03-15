import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDealProbability = (saleId: string) => {
  return useQuery<{ probability: number; factors: Record<string, number> }>({
    queryKey: ['deal-probability', saleId],
    queryFn: async () => {
      const { data: sale } = await supabase
        .from('sales')
        .select('id, status, amount, created_at, salesperson_id')
        .eq('id', saleId)
        .single();

      if (!sale) throw new Error('Deal not found');

      // Get activities count for engagement score
      const { count: activityCount } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('sale_id', saleId);

      const factors = {
        stage: calculateStageScore(sale.status),
        value: calculateValueScore(sale.amount),
        time: calculateTimeScore(sale.created_at),
        engagement: calculateEngagementScore(activityCount || 0),
      };

      const probability = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;

      return { probability: Math.round(probability), factors };
    },
    enabled: !!saleId,
  });
};

// Batch probability calculation
export const useDealProbabilities = () => {
  return useQuery({
    queryKey: ['deal-probabilities'],
    queryFn: async () => {
      const { data: sales } = await supabase
        .from('sales')
        .select('id, status, amount, created_at')
        .in('status', ['pending', 'completed']);

      return (sales || []).reduce((acc, sale) => {
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
