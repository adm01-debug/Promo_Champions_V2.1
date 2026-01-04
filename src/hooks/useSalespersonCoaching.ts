import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CoachingInsight {
  area: string;
  score: number;
  benchmark: number;
  recommendation: string;
}

export const useSalespersonCoaching = (userId: string) => {
  return useQuery<CoachingInsight[]>({
    queryKey: ['salesperson-coaching', userId],
    queryFn: async () => {
      const { data: performance } = await supabase
        .from('deals')
        .select('*')
        .eq('assigned_to', userId);

      if (!performance) return [];

      const insights: CoachingInsight[] = [];

      // Win rate
      const won = performance.filter(d => d.status === 'won').length;
      const winRate = (won / performance.length) * 100;
      insights.push({
        area: 'Win Rate',
        score: winRate,
        benchmark: 30,
        recommendation: winRate < 30 ? 'Focus on qualification and objection handling' : 'Great job! Keep it up',
      });

      // Average deal size
      const avgSize = performance.reduce((sum, d) => sum + (d.value || 0), 0) / performance.length;
      insights.push({
        area: 'Deal Size',
        score: avgSize,
        benchmark: 50000,
        recommendation: avgSize < 50000 ? 'Pursue larger opportunities' : 'Strong deal sizing',
      });

      return insights;
    },
    enabled: !!userId,
  });
};
