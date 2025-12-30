import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface ChurnPrediction {
  clientId: string;
  clientName: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivityDate: string | null;
  daysSinceLastActivity: number;
  factors: string[];
}

export const useChurnPrediction = (clientId?: string) => {
  return useQuery<ChurnPrediction[]>({
    queryKey: ['churn-prediction', clientId],
    queryFn: async (): Promise<ChurnPrediction[]> => {
      // Get clients with their last activity
      let query = supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (clientId) {
        query = query.eq('id', clientId);
      }
      
      const { data: clients, error } = await query;
      if (error) throw error;
      
      const predictions: ChurnPrediction[] = [];
      
      for (const client of clients || []) {
        // Calculate days since last update
        const lastUpdate = new Date(client.updated_at);
        const now = new Date();
        const daysSince = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Simple churn probability based on inactivity
        let churnProbability = 0;
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        const factors: string[] = [];
        
        if (daysSince > 90) {
          churnProbability = 0.8;
          riskLevel = 'high';
          factors.push('Inativo há mais de 90 dias');
        } else if (daysSince > 60) {
          churnProbability = 0.5;
          riskLevel = 'medium';
          factors.push('Inativo há mais de 60 dias');
        } else if (daysSince > 30) {
          churnProbability = 0.3;
          riskLevel = 'medium';
          factors.push('Inativo há mais de 30 dias');
        } else {
          churnProbability = 0.1;
          riskLevel = 'low';
        }
        
        if (client.total_value === 0) {
          churnProbability = Math.min(churnProbability + 0.2, 1);
          factors.push('Nenhuma compra registrada');
        }
        
        predictions.push({
          clientId: client.id,
          clientName: client.name,
          churnProbability,
          riskLevel,
          lastActivityDate: client.updated_at,
          daysSinceLastActivity: daysSince,
          factors,
        });
      }
      
      // Sort by churn probability descending
      return predictions.sort((a, b) => b.churnProbability - a.churnProbability);
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
