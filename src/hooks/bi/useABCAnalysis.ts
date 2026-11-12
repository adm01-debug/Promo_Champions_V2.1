import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WON_SALE_STATUSES } from '@/constants';

interface ABCItem {
  name: string;
  revenue: number;
  percentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
}

interface NeuralInsight {
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'trend';
}

interface ABCSummary {
  products: Record<'A' | 'B' | 'C', number>;
  clients: Record<'A' | 'B' | 'C', number>;
}

interface ABCAnalysisResult {
  products: ABCItem[];
  clients: ABCItem[];
  summary: ABCSummary;
  totalRevenue: number;
  neuralInsights: NeuralInsight[];
}

function classifyABC(items: { name: string; revenue: number }[]): ABCItem[] {
  const sorted = [...items].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sorted.reduce((sum, i) => sum + i.revenue, 0);
  if (totalRevenue === 0) return [];

  let cumulative = 0;
  return sorted.map(item => {
    cumulative += item.revenue;
    const percentage = (item.revenue / totalRevenue) * 100;
    const cumulativePercentage = (cumulative / totalRevenue) * 100;
    const classification: 'A' | 'B' | 'C' =
      cumulativePercentage <= 80 ? 'A' : cumulativePercentage <= 95 ? 'B' : 'C';

    return {
      name: item.name,
      revenue: item.revenue,
      percentage,
      cumulativePercentage,
      classification,
    };
  });
}

export const useABCAnalysis = () => {
  return useQuery<ABCAnalysisResult>({
    queryKey: ['abc-analysis'],
    queryFn: async (): Promise<ABCAnalysisResult> => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('amount, product_name, client_name, status')
        .in('status', [...WON_SALE_STATUSES]);

      if (error) throw error;

      const productMap = new Map<string, number>();
      const clientMap = new Map<string, number>();

      (sales || []).forEach(sale => {
        const amount = sale.amount || 0;
        if (sale.product_name) {
          productMap.set(
            sale.product_name,
            (productMap.get(sale.product_name) || 0) + amount
          );
        }
        if (sale.client_name) {
          clientMap.set(
            sale.client_name,
            (clientMap.get(sale.client_name) || 0) + amount
          );
        }
      });

      const productItems = Array.from(productMap.entries()).map(([name, revenue]) => ({
        name,
        revenue,
      }));
      const clientItems = Array.from(clientMap.entries()).map(([name, revenue]) => ({
        name,
        revenue,
      }));

      const products = classifyABC(productItems);
      const clients = classifyABC(clientItems);

      const countByClass = (items: ABCItem[]) => ({
        A: items.filter(i => i.classification === 'A').length,
        B: items.filter(i => i.classification === 'B').length,
        C: items.filter(i => i.classification === 'C').length,
      });

      const totalRevenue = (sales || []).reduce((sum, s) => sum + (s.amount || 0), 0);

      // Único insight exibido: calculado a partir das vendas reais (concentração da receita).
      const neuralInsights: NeuralInsight[] = [];
      const topClients = clients.slice(0, 3);
      if (topClients.length > 0 && totalRevenue > 0) {
        const topShare =
          (topClients.reduce((s, i) => s + i.revenue, 0) / totalRevenue) * 100;
        neuralInsights.push({
          title: 'Concentração de Receita',
          description:
            topClients.length === 1
              ? `Seu principal cliente gera ${topShare.toFixed(1)}% da receita.`
              : `Seus ${topClients.length} principais clientes geram ${topShare.toFixed(1)}% da receita.`,
          type: 'warning',
        });
      }

      return {
        products,
        clients,
        summary: {
          products: countByClass(products),
          clients: countByClass(clients),
        },
        totalRevenue,
        neuralInsights,
      };
    },
    staleTime: 1000 * 60 * 30,
  });
};
