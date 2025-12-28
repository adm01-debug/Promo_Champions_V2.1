import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesRecommendation {
  type: 'follow_up' | 'upsell' | 'cross_sell' | 'retention';
  priority: 'high' | 'medium' | 'low';
  clientId: string;
  clientName: string;
  message: string;
  expectedValue: number;
}

export const useSalesAssistant = () => {
  return useQuery<SalesRecommendation[]>({
    queryKey: ['sales-assistant'],
    queryFn: async (): Promise<SalesRecommendation[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const recommendations: SalesRecommendation[] = [];
      
      // Buscar clientes do vendedor
      const { data: deals } = await supabase
        .from('deals')
        .select('*, clients(*)') 
        .eq('assigned_to', user.id);
      
      if (!deals) return [];
      
      deals.forEach((deal: any) => {
        const client = deal.clients;
        if (!client) return;
        
        // Follow-up para deals abertos há mais de 7 dias
        if (deal.status === 'open') {
          const created = new Date(deal.created_at);
          const daysOpen = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysOpen > 7) {
            recommendations.push({
              type: 'follow_up',
              priority: daysOpen > 14 ? 'high' : 'medium',
              clientId: client.id,
              clientName: client.name,
              message: `Deal aberto há ${Math.round(daysOpen)} dias - Agendar follow-up`,
              expectedValue: deal.value
            });
          }
        }
      });
      
      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    },
    refetchInterval: 5 * 60 * 1000
  });
};
