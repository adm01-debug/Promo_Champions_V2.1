import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScoreDistribution {
  range: string;
  count: number;
}

export function useLeadScoringMetrics() {
  return useQuery({
    queryKey: ['lead-scoring-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_intelligence_metrics')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Fallback: Calculate distribution on the fly if no metrics captured yet
      if (!data) {
        const { data: scores } = await supabase.from('lead_scores').select('score');
        const distribution: Record<string, number> = {
          '0-20': 0,
          '21-40': 0,
          '41-60': 0,
          '61-80': 0,
          '81-100': 0
        };

        (scores || []).forEach(s => {
          if (s.score < 20) distribution['0-20']++;
          else if (s.score < 40) distribution['21-40']++;
          else if (s.score < 60) distribution['41-60']++;
          else if (s.score < 80) distribution['61-80']++;
          else distribution['81-100']++;
        });

        return {
          avg_score: scores?.length ? scores.reduce((a, b) => a + b.score, 0) / scores.length : 0,
          distribution: Object.entries(distribution).map(([range, count]) => ({ range, count }))
        };
      }

      const distObj = data.distribution as Record<string, number>;
      const distribution = Object.entries(distObj).map(([range, count]) => ({
        range,
        count
      })).sort((a, b) => {
        const startA = parseInt(a.range.split('-')[0]);
        const startB = parseInt(b.range.split('-')[0]);
        return startA - startB;
      });

      return {
        ...data,
        distribution
      };
    }
  });
}
