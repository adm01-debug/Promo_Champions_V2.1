import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface ABCProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
  abcClass: 'A' | 'B' | 'C';
  percentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
}

export interface ABCClient {
  id: string;
  name: string;
  company: string | null;
  revenue: number;
  dealsCount: number;
  abcClass: 'A' | 'B' | 'C';
  percentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
  category: string;
  quantity: number;
}

export interface ABCSummary {
  classA: { count: number; revenue: number; percentage: number };
  classB: { count: number; revenue: number; percentage: number };
  classC: { count: number; revenue: number; percentage: number };
  products: Record<'A' | 'B' | 'C', number>;
  clients: Record<'A' | 'B' | 'C', number>;
}

export interface ABCAnalysisData {
  products: ABCProduct[];
  clients: ABCClient[];
  summary: ABCSummary;
}

export const useABCAnalysis = () => {
  return useQuery<ABCAnalysisData>({
    queryKey: ['abc-analysis'],
    queryFn: async (): Promise<ABCAnalysisData> => {
      // Get products with sales data
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('sales_count', { ascending: false });
      
      if (prodError) throw prodError;
      
      // Get clients with their total value
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .order('total_value', { ascending: false });
      
      if (clientError) throw clientError;
      
      // Calculate ABC classification for products
      const totalProductRevenue = (products || []).reduce((acc, p) => acc + (p.price * p.sales_count), 0);
      let cumulativeProductRevenue = 0;
      
      const abcProducts: ABCProduct[] = (products || []).map(p => {
        const revenue = p.price * p.sales_count;
        cumulativeProductRevenue += revenue;
        const percentage = totalProductRevenue > 0 ? (revenue / totalProductRevenue) * 100 : 0;
        const cumulativePercentage = totalProductRevenue > 0 ? (cumulativeProductRevenue / totalProductRevenue) * 100 : 0;
        
        let abcClass: 'A' | 'B' | 'C' = 'C';
        if (cumulativePercentage <= 80) abcClass = 'A';
        else if (cumulativePercentage <= 95) abcClass = 'B';
        
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          revenue,
          quantity: p.sales_count,
          abcClass,
          percentage,
          cumulativePercentage,
          classification: abcClass,
        };
      });
      
      // Calculate ABC classification for clients
      const totalClientRevenue = (clients || []).reduce((acc, c) => acc + (c.total_value || 0), 0);
      let cumulativeClientRevenue = 0;
      
      const abcClients: ABCClient[] = (clients || []).map(c => {
        cumulativeClientRevenue += c.total_value || 0;
        const percentage = totalClientRevenue > 0 ? ((c.total_value || 0) / totalClientRevenue) * 100 : 0;
        const cumulativePercentage = totalClientRevenue > 0 
          ? (cumulativeClientRevenue / totalClientRevenue) * 100 
          : 0;
        
        let abcClass: 'A' | 'B' | 'C' = 'C';
        if (cumulativePercentage <= 80) abcClass = 'A';
        else if (cumulativePercentage <= 95) abcClass = 'B';
        
        return {
          id: c.id,
          name: c.name,
          company: c.company,
          revenue: c.total_value || 0,
          dealsCount: 0,
          abcClass,
          percentage,
          cumulativePercentage,
          classification: abcClass,
          category: 'Cliente',
          quantity: 1,
        };
      });
      
      // Calculate summary
      const classAProducts = abcProducts.filter(p => p.abcClass === 'A');
      const classBProducts = abcProducts.filter(p => p.abcClass === 'B');
      const classCProducts = abcProducts.filter(p => p.abcClass === 'C');
      
      const classAClients = abcClients.filter(c => c.abcClass === 'A');
      const classBClients = abcClients.filter(c => c.abcClass === 'B');
      const classCClients = abcClients.filter(c => c.abcClass === 'C');
      
      const summary: ABCSummary = {
        classA: {
          count: classAProducts.length,
          revenue: classAProducts.reduce((acc, p) => acc + p.revenue, 0),
          percentage: totalProductRevenue > 0 
            ? (classAProducts.reduce((acc, p) => acc + p.revenue, 0) / totalProductRevenue) * 100 
            : 0,
        },
        classB: {
          count: classBProducts.length,
          revenue: classBProducts.reduce((acc, p) => acc + p.revenue, 0),
          percentage: totalProductRevenue > 0 
            ? (classBProducts.reduce((acc, p) => acc + p.revenue, 0) / totalProductRevenue) * 100 
            : 0,
        },
        classC: {
          count: classCProducts.length,
          revenue: classCProducts.reduce((acc, p) => acc + p.revenue, 0),
          percentage: totalProductRevenue > 0 
            ? (classCProducts.reduce((acc, p) => acc + p.revenue, 0) / totalProductRevenue) * 100 
            : 0,
        },
        products: {
          A: classAProducts.length,
          B: classBProducts.length,
          C: classCProducts.length,
        },
        clients: {
          A: classAClients.length,
          B: classBClients.length,
          C: classCClients.length,
        },
      };
      
      return { products: abcProducts, clients: abcClients, summary };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
