import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CoachingData {
  salesperson: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  metrics: {
    totalDeals: number;
    wins: number;
    losses: number;
    winRate: number;
    teamWinRate: number;
    comparisonToTeam: number;
    avgDealValue: number;
    topLossReasons: { reason: string; count: number; percentage: string }[];
    topWinReasons: { reason: string; count: number; percentage: string }[];
  };
  coaching: {
    summary: string;
    strengths: { title: string; description: string }[];
    improvements: { title: string; description: string; priority: 'alta' | 'média' | 'baixa' }[];
    actions: { action: string; timeline: string; expectedImpact: string }[];
  };
  generatedAt: string;
}

export function useSalespersonCoaching(salespersonId: string | null) {
  return useQuery({
    queryKey: ['salesperson-coaching', salespersonId],
    queryFn: async (): Promise<CoachingData> => {
      if (!salespersonId) throw new Error('No salesperson selected');

      const { data, error } = await supabase.functions.invoke('salesperson-coaching', {
        body: { salespersonId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    enabled: !!salespersonId,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}
