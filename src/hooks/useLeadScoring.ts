import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface LeadScore {
  id: string;
  sale_id: string;
  score: number;
  factors: Record<string, unknown>;
  calculated_at: string;
}

export interface LeadScoreData {
  score: number;
  category: 'hot' | 'warm' | 'cold';
  factors: string[];
}

export const useLeadScoring = (clientId?: string) => {
  return useQuery<LeadScoreData>({
    queryKey: ['leadScoring', clientId],
    queryFn: async (): Promise<LeadScoreData> => {
      // Default score for now
      return { score: 50, category: 'warm', factors: [] };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useLeadScores = (saleIds?: string[]) => {
  return useQuery<Record<string, LeadScoreData>>({
    queryKey: ['lead-scores', saleIds],
    enabled: !!saleIds && saleIds.length > 0,
    queryFn: async (): Promise<Record<string, LeadScoreData>> => {
      if (!saleIds || saleIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .in('sale_id', saleIds);
      
      if (error) throw error;
      
      const scores: Record<string, LeadScoreData> = {};
      
      (data || []).forEach(ls => {
        const category: 'hot' | 'warm' | 'cold' = 
          ls.score >= 70 ? 'hot' : ls.score >= 40 ? 'warm' : 'cold';
        
        scores[ls.sale_id] = {
          score: ls.score,
          category,
          factors: Object.keys(ls.factors || {}),
        };
      });
      
      return scores;
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useCalculateLeadScores = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleIds: string[]) => {
      // Calculate scores for each sale
      const scores: { sale_id: string; score: number; factors: Record<string, unknown> }[] = [];
      
      for (const saleId of saleIds) {
        const { data: sale } = await supabase
          .from('sales')
          .select('*')
          .eq('id', saleId)
          .single();
        
        if (sale) {
          // Simple scoring algorithm
          let score = 50;
          const factors: Record<string, number> = {};
          
          // Score based on amount
          if (sale.amount >= 10000) {
            score += 20;
            factors.high_value = 20;
          } else if (sale.amount >= 5000) {
            score += 10;
            factors.medium_value = 10;
          }
          
          // Score based on status
          if (sale.status === 'proposal' || sale.status === 'negotiation') {
            score += 15;
            factors.advanced_stage = 15;
          }
          
          scores.push({ sale_id: saleId, score: Math.min(score, 100), factors });
        }
      }
      
      // Upsert scores
      if (scores.length > 0) {
        const { error } = await supabase
          .from('lead_scores')
          .upsert(
            scores.map(s => ({
              sale_id: s.sale_id,
              score: s.score,
              factors: s.factors,
              calculated_at: new Date().toISOString(),
            })),
            { onConflict: 'sale_id' }
          );
        
        if (error) throw error;
      }
      
      return scores;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scores'] });
    },
  });
};
