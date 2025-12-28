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

export const useABCAnalysis = () => {
  return useQuery<ABCAnalysisResult>({
    queryKey: ['abc-analysis'],
    queryFn: async (): Promise<ABCAnalysisResult> => {
      // Buscar clientes com revenue agregado
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          company,
          deals!inner(value, status, closed_at)
        `);
      
      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          categories: [
            { category: 'A', clients: [], totalRevenue: 0, percentage: 0, description: 'Top 80% revenue' },
            { category: 'B', clients: [], totalRevenue: 0, percentage: 0, description: 'Next 15% revenue' },
            { category: 'C', clients: [], totalRevenue: 0, percentage: 0, description: 'Remaining 5% revenue' }
          ],
          totalClients: 0,
          totalRevenue: 0,
          classificationDate: new Date()
        };
      }
      
      // Processar dados
      const clients: ClientData[] = data.map(client => {
        const wonDeals = (client.deals || []).filter((d: any) => d.status === 'won');
        const totalRevenue = wonDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
        const lastDeal = wonDeals.length > 0 
          ? wonDeals.sort((a: any, b: any) => 
              new Date(b.closed_at).getTime() - new Date(a.closed_at).getTime()
            )[0]
          : null;
        
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          total_revenue: totalRevenue,
          deals_count: wonDeals.length,
          last_deal_date: lastDeal?.closed_at
        };
      }).filter(c => c.total_revenue > 0);
      
      // Ordenar por revenue decrescente
      clients.sort((a, b) => b.total_revenue - a.total_revenue);
      
      const totalRevenue = clients.reduce((sum, c) => sum + c.total_revenue, 0);
      
      // Classificação ABC (Curva de Pareto)
      let accumulated = 0;
      const categoryA: ClientData[] = [];
      const categoryB: ClientData[] = [];
      const categoryC: ClientData[] = [];
      
      clients.forEach(client => {
        accumulated += client.total_revenue;
        const percentage = (accumulated / totalRevenue) * 100;
        
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
            description: 'Clientes estratégicos - Alta prioridade'
          },
          {
            category: 'B',
            clients: categoryB,
            totalRevenue: revenueB,
            percentage: (revenueB / totalRevenue) * 100,
            description: 'Clientes importantes - Média prioridade'
          },
          {
            category: 'C',
            clients: categoryC,
            totalRevenue: revenueC,
            percentage: (revenueC / totalRevenue) * 100,
            description: 'Clientes regulares - Manutenção'
          }
        ],
        totalClients: clients.length,
        totalRevenue,
        classificationDate: new Date()
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000 // 30 minutos
  });
};
