import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ScoringFactors {
  dealValue: number;
  stageProgress: number;
  timeInPipeline: number;
  category: number;
  recentActivity: number;
  labels?: Record<string, string>;
}

interface LeadScore {
  id: string;
  sale_id: string;
  score: number;
  factors: ScoringFactors;
  calculated_at: string;
}

export function useLeadScores(dealIds: string[]) {
  return useQuery({
    queryKey: ['lead-scores', dealIds],
    queryFn: async (): Promise<Record<string, LeadScore>> => {
      if (!dealIds.length) return {};

      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .in('sale_id', dealIds);

      if (error) throw error;

      const scoresMap: Record<string, LeadScore> = {};
      data?.forEach(score => {
        scoresMap[score.sale_id] = {
          id: score.id,
          sale_id: score.sale_id,
          score: score.score,
          factors: score.factors as unknown as ScoringFactors,
          calculated_at: score.calculated_at
        };
      });

      return scoresMap;
    },
    enabled: dealIds.length > 0
  });
}

export function useCalculateLeadScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('lead-scoring', {
        body: { dealIds }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, dealIds) => {
      queryClient.invalidateQueries({ queryKey: ['lead-scores', dealIds] });
    }
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-emerald-400';
  if (score >= 40) return 'text-yellow-500';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/20';
  if (score >= 60) return 'bg-emerald-400/20';
  if (score >= 40) return 'bg-yellow-500/20';
  if (score >= 20) return 'bg-orange-500/20';
  return 'bg-red-500/20';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Quente';
  if (score >= 60) return 'Morno';
  if (score >= 40) return 'Frio';
  if (score >= 20) return 'Gelado';
  return 'Congelado';
}
