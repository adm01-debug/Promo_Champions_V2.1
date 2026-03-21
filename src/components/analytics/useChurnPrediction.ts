import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface ChurnPredictionItem {
  clientId: string;
  clientName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  lastActivity: string | null;
  daysSinceLastPurchase: number;
}

interface UseChurnPredictionOptions {
  clientId?: string;
  timeframe?: string;
}

export const useChurnPrediction = (options?: UseChurnPredictionOptions) => {
  return useQuery<ChurnPredictionItem[]>({
    queryKey: ['churn-prediction', options?.clientId, options?.timeframe],
    queryFn: async (): Promise<ChurnPredictionItem[]> => {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      const now = new Date();

      return (clients || [])
        .map((client) => {
          const lastUpdate = new Date(client.updated_at);
          const daysSince = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

          let riskScore = Math.min(100, daysSince * 2);
          let riskLevel: ChurnPredictionItem['riskLevel'] = 'low';
          const factors: string[] = [];

          if (daysSince > 90) {
            riskLevel = 'high';
            factors.push('Sem atividade há mais de 90 dias');
          } else if (daysSince > 30) {
            riskLevel = 'medium';
            factors.push('Sem atividade há mais de 30 dias');
          }

          if (!client.email) {
            riskScore += 10;
            factors.push('Sem email cadastrado');
          }

          if (!client.phone) {
            riskScore += 10;
            factors.push('Sem telefone cadastrado');
          }

          return {
            clientId: client.id,
            clientName: client.name,
            riskScore: Math.min(100, riskScore),
            riskLevel,
            factors,
            lastActivity: client.updated_at,
            daysSinceLastPurchase: daysSince,
          };
        })
        .filter((client) => client.riskScore > 20);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};