import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  total_revenue: number;
  deals_count: number;
  last_contact_date?: string;
}

interface ABCCategory {
  category: 'A' | 'B' | 'C';
  clients: Client[];
  totalRevenue: number;
  percentage: number;
}

interface ClientPortfolioData {
  totalClients: number;
  totalRevenue: number;
  avgRevenuePerClient: number;
  categories: ABCCategory[];
}

export const useClientPortfolio = () => {
  return useQuery<ClientPortfolioData>({
    queryKey: ['client-portfolio'],
    queryFn: async (): Promise<ClientPortfolioData> => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          phone,
          company,
          deals(value, status)
        `);
      
      if (error) throw error;
      if (!data) throw new Error('No data returned');
      
      const clients: Client[] = data.map(client => {
        const wonDeals = (client.deals || []).filter((d: { status: string }) => d.status === 'won');
        const totalRevenue = wonDeals.reduce((sum: number, d: { value: number }) => sum + d.value, 0);
        
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          total_revenue: totalRevenue,
          deals_count: wonDeals.length
        };
      }).filter(c => c.total_revenue > 0);
      
      clients.sort((a, b) => b.total_revenue - a.total_revenue);
      
      const totalRevenue = clients.reduce((sum, c) => sum + c.total_revenue, 0);
      
      // Classificação ABC
      let accumulated = 0;
      const aClients: Client[] = [];
      const bClients: Client[] = [];
      const cClients: Client[] = [];
      
      clients.forEach(client => {
        accumulated += client.total_revenue;
        const percentage = (accumulated / totalRevenue) * 100;
        
        if (percentage <= 80) {
          aClients.push(client);
        } else if (percentage <= 95) {
          bClients.push(client);
        } else {
          cClients.push(client);
        }
      });
      
      const aRevenue = aClients.reduce((sum, c) => sum + c.total_revenue, 0);
      const bRevenue = bClients.reduce((sum, c) => sum + c.total_revenue, 0);
      const cRevenue = cClients.reduce((sum, c) => sum + c.total_revenue, 0);
      
      return {
        totalClients: clients.length,
        totalRevenue,
        avgRevenuePerClient: totalRevenue / clients.length,
        categories: [
          {
            category: 'A',
            clients: aClients,
            totalRevenue: aRevenue,
            percentage: (aRevenue / totalRevenue) * 100
          },
          {
            category: 'B',
            clients: bClients,
            totalRevenue: bRevenue,
            percentage: (bRevenue / totalRevenue) * 100
          },
          {
            category: 'C',
            clients: cClients,
            totalRevenue: cRevenue,
            percentage: (cRevenue / totalRevenue) * 100
          }
        ]
      };
    },
    staleTime: 10 * 60 * 1000
  });
};
