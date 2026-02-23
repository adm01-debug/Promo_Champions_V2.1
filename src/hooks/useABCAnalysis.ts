// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  id: string;
  name: string;
  email?: string;
  company?: string;
  total_revenue: number;
  deals_count: number;
  last_deal_date?: string;
}

interface ABCCategory {
  category: 'A' | 'B' | 'C';
  clients: ClientData[];
  totalRevenue: number;
  percentage: number;
  description: string;
}

interface ABCAnalysisResult {
  categories: ABCCategory[];
  totalClients: number;
  totalRevenue: number;
  classificationDate: Date;
}

/**
 * Hook for ABC Analysis of clients (Pareto 80/20 principle)
 * Classifies clients into A (80% revenue), B (15% revenue), C (5% revenue)
 */
export const useABCAnalysis = () => {
  return useQuery<ABCAnalysisResult>({
    queryKey: ['abc-analysis'],
    queryFn: async (): Promise<ABCAnalysisResult> => {
      // Fetch clients with aggregated revenue
      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          company,
          deals!inner(value, status)
        `)
        .eq('deals.status', 'won');

      if (error) throw error;

      // Calculate total revenue per client
      const clientsWithRevenue: ClientData[] = clients.map(client => {
        const totalRevenue = client.deals?.reduce(
          (sum: number, deal: any) => sum + (deal.value || 0),
          0
        ) || 0;

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          total_revenue: totalRevenue,
          deals_count: client.deals?.length || 0,
        };
      }).filter(c => c.total_revenue > 0);

      // Sort by revenue descending
      clientsWithRevenue.sort((a, b) => b.total_revenue - a.total_revenue);

      const totalRevenue = clientsWithRevenue.reduce(
        (sum, c) => sum + c.total_revenue,
        0
      );

      // ABC Classification
      let accumulatedRevenue = 0;
      let categoryA: ClientData[] = [];
      let categoryB: ClientData[] = [];
      let categoryC: ClientData[] = [];

      clientsWithRevenue.forEach(client => {
        accumulatedRevenue += client.total_revenue;
        const percentage = (accumulatedRevenue / totalRevenue) * 100;

        if (percentage <= 80) {
          categoryA.push(client);
        } else if (percentage <= 95) {
          categoryB.push(client);
        } else {
          categoryC.push(client);
        }
      });

      const revenueA = categoryA.reduce((sum, c) => sum + c.total_revenue, 0);
      const revenueB = categoryB.reduce((sum, c) => sum + c.total_revenue, 0);
      const revenueC = categoryC.reduce((sum, c) => sum + c.total_revenue, 0);

      return {
        categories: [
          {
            category: 'A',
            clients: categoryA,
            totalRevenue: revenueA,
            percentage: (revenueA / totalRevenue) * 100,
            description: 'Top clients - High priority',
          },
          {
            category: 'B',
            clients: categoryB,
            totalRevenue: revenueB,
            percentage: (revenueB / totalRevenue) * 100,
            description: 'Medium clients - Growth opportunity',
          },
          {
            category: 'C',
            clients: categoryC,
            totalRevenue: revenueC,
            percentage: (revenueC / totalRevenue) * 100,
            description: 'Small clients - Nurture or automate',
          },
        ],
        totalClients: clientsWithRevenue.length,
        totalRevenue,
        classificationDate: new Date(),
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
