import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDealProbability = (dealId: string) => {
  return useQuery<{ probability: number; factors: Record<string, number> }>({
    queryKey: ['deal-probability', dealId],
    queryFn: async () => {
      const { data: deal } = await supabase
        .from('deals')
        .select('*, client:clients(*), activities(*)')
        .eq('id', dealId)
        .single();

      if (!deal) throw new Error('Deal not found');

      const factors = {
        stage: calculateStageScore(deal.stage),
        value: calculateValueScore(deal.value),
        time: calculateTimeScore(deal.created_at),
        engagement: calculateEngagementScore(deal.activities || []),
      };

      const probability = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;

      return { probability: Math.round(probability), factors };
    },
    enabled: !!dealId,
  });
};

function calculateStageScore(stage: string): number {
  const scores: Record<string, number> = {
    'Lead': 10,
    'Qualified': 30,
    'Proposal': 50,
    'Negotiation': 75,
    'Closed Won': 100,
  };
  return scores[stage] || 0;
}

function calculateValueScore(value: number): number {
  return Math.min(value / 1000, 100);
}

function calculateTimeScore(createdAt: string): number {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(100 - days * 2, 0);
}

function calculateEngagementScore(activities: any[]): number {
  return Math.min(activities.length * 5, 100);
}
