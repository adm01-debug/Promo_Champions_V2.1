import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ABCItem {
  name: string;
  revenue: number;
  percentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
  count: number;
}

interface ABCAnalysis {
  products: ABCItem[];
  clients: ABCItem[];
  summary: {
    products: { A: number; B: number; C: number };
    clients: { A: number; B: number; C: number };
  };
}

const classifyABC = (items: { name: string; revenue: number; count: number }[]): ABCItem[] => {
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
  
  const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
  
  let cumulative = 0;
  return sorted.map(item => {
    const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    cumulative += percentage;
    
    let classification: 'A' | 'B' | 'C' = 'C';
    if (cumulative <= 80) classification = 'A';
    else if (cumulative <= 95) classification = 'B';
    
    return {
      name: item.name,
      revenue: item.revenue,
      percentage,
      cumulativePercentage: cumulative,
      classification,
      count: item.count,
    };
  });
};

export function useABCAnalysis() {
  return useQuery({
    queryKey: ['abc-analysis'],
    queryFn: async (): Promise<ABCAnalysis> => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .eq('status', 'completed');

      if (error) throw error;

      // Group by product
      const productMap = new Map<string, { revenue: number; count: number }>();
      sales?.forEach(sale => {
        const existing = productMap.get(sale.product_name) || { revenue: 0, count: 0 };
        productMap.set(sale.product_name, {
          revenue: existing.revenue + Number(sale.amount),
          count: existing.count + 1,
        });
      });

      // Group by client
      const clientMap = new Map<string, { revenue: number; count: number }>();
      sales?.forEach(sale => {
        const existing = clientMap.get(sale.client_name) || { revenue: 0, count: 0 };
        clientMap.set(sale.client_name, {
          revenue: existing.revenue + Number(sale.amount),
          count: existing.count + 1,
        });
      });

      const products = classifyABC(
        Array.from(productMap.entries()).map(([name, data]) => ({ name, ...data }))
      );

      const clients = classifyABC(
        Array.from(clientMap.entries()).map(([name, data]) => ({ name, ...data }))
      );

      const countByClass = (items: ABCItem[]) => ({
        A: items.filter(i => i.classification === 'A').length,
        B: items.filter(i => i.classification === 'B').length,
        C: items.filter(i => i.classification === 'C').length,
      });

      return {
        products,
        clients,
        summary: {
          products: countByClass(products),
          clients: countByClass(clients),
        },
      };
    },
  });
}
