import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChurnRiskClient {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  lastContactDays: number;
  factors: string[];
}

export const useChurnPrediction = () => {
  return useQuery<ChurnRiskClient[]>({
    queryKey: ['churn-prediction'],
    queryFn: async (): Promise<ChurnRiskClient[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id, name, last_contact_date,
          deals(value, closed_at, status),
          activities(created_at, type)
        `);
      
      if (error) throw error;
      if (!data) return [];
      
      const now = new Date();
      
      return data.map(client => {
        let riskScore = 0;
        const factors: string[] = [];
        
        const lastContact = client.last_contact_date 
          ? new Date(client.last_contact_date)
          : null;
        
        const daysSinceContact = lastContact
          ? (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
          : 999;
        
        if (daysSinceContact > 90) {
          riskScore += 40;
          factors.push('Sem contato há 90+ dias');
        } else if (daysSinceContact > 60) {
          riskScore += 25;
          factors.push('Sem contato há 60+ dias');
        }
        
        const recentDeals = (client.deals || []).filter((d: any) => {
          const dealDate = new Date(d.closed_at || d.created_at);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return dealDate > sixMonthsAgo;
        });
        
        if (recentDeals.length === 0) {
          riskScore += 30;
          factors.push('Nenhuma compra em 6 meses');
        }
        
        const activities = (client.activities || []).filter((a: any) => {
          const actDate = new Date(a.created_at);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return actDate > monthAgo;
        });
        
        if (activities.length < 2) {
          riskScore += 20;
          factors.push('Baixo engajamento');
        }
        
        let riskLevel: 'high' | 'medium' | 'low';
        if (riskScore >= 60) riskLevel = 'high';
        else if (riskScore >= 30) riskLevel = 'medium';
        else riskLevel = 'low';
        
        return {
          id: client.id,
          name: client.name,
          riskScore: Math.min(riskScore, 100),
          riskLevel,
          lastContactDays: Math.round(daysSinceContact),
          factors
        };
      }).sort((a, b) => b.riskScore - a.riskScore);
    }
  });
};
