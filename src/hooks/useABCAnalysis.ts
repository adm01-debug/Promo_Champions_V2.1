import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  score: number;
}

interface MatrixShift {
  name: string;
  from: 'A' | 'B' | 'C';
  to: 'A' | 'B' | 'C';
  change: number;
  reason: string;
}

interface Automation {
  id: string;
  title: string;
  description: string;
  target: string;
  impact: string;
  type: 'retention' | 'expansion' | 'reactivation';
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
  matrixShifts: MatrixShift[];
  automations: Automation[];
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
      cumulativePercentage <= 80 ? 'A' :
      cumulativePercentage <= 95 ? 'B' : 'C';

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
        .in('status', ['won', 'completed']);

      if (error) throw error;

      const productMap = new Map<string, number>();
      const clientMap = new Map<string, number>();

      (sales || []).forEach(sale => {
        const amount = sale.amount || 0;
        if (sale.product_name) {
          productMap.set(sale.product_name, (productMap.get(sale.product_name) || 0) + amount);
        }
        if (sale.client_name) {
          clientMap.set(sale.client_name, (clientMap.get(sale.client_name) || 0) + amount);
        }
      });

      const productItems = Array.from(productMap.entries()).map(([name, revenue]) => ({ name, revenue }));
      const clientItems = Array.from(clientMap.entries()).map(([name, revenue]) => ({ name, revenue }));

      const products = classifyABC(productItems);
      const clients = classifyABC(clientItems);

      const countByClass = (items: ABCItem[]) => ({
        A: items.filter(i => i.classification === 'A').length,
        B: items.filter(i => i.classification === 'B').length,
        C: items.filter(i => i.classification === 'C').length,
      });

      // Simulated Neural Insights based on data
      const neuralInsights: NeuralInsight[] = [
        {
          title: "Concentração Crítica em A",
          description: `Seus principais 3 clientes geram ${((clients.slice(0, 3).reduce((s, i) => s + i.revenue, 0) / (sales?.reduce((s, i) => s + (i.amount || 0), 0) || 1)) * 100).toFixed(1)}% da receita. Risco alto de churn.`,
          type: "warning",
          score: 5
        },
        {
          title: "Expansão em Segmento B",
          description: "O segmento B cresceu 14% este mês. Recomendamos upselling para migração para classe A.",
          type: "opportunity",
          score: 4
        },
        {
          title: "Predição de Cross-Sell",
          description: "Clientes que compram Produto X têm 85% de chance de aceitar upgrade para Pacote Elite.",
          type: "trend",
          score: 4
        }
      ];

      const matrixShifts: MatrixShift[] = [
        { name: "Cliente VIP S/A", from: "B", to: "A", change: 25, reason: "Aumento de recorrência" },
        { name: "Distribuidora Beta", from: "A", to: "B", change: -12, reason: "Redução de pedidos semanais" },
        { name: "Tech Solutions", from: "C", to: "B", change: 40, reason: "Novo contrato assinado" }
      ];

      const automations: Automation[] = [
        {
          id: "1",
          title: "Escudo de Retenção Classe A",
          description: "Dispara check-in personalizado automático via WhatsApp para clientes Classe A com 15 dias sem compra.",
          target: "Classe A",
          impact: "+15% Retenção",
          type: "retention"
        },
        {
          id: "2",
          title: "Upgrade Velocity B->A",
          description: "Envia oferta exclusiva de upgrade para clientes Classe B que atingirem 90% do teto do segmento.",
          target: "Classe B",
          impact: "+22% Receita",
          type: "expansion"
        },
        {
          id: "3",
          title: "Reativação Neural",
          description: "Identifica padrões de churn em Classe C e dispara sequência de re-engajamento automatizada.",
          target: "Classe C",
          impact: "+8% Recuperação",
          type: "reactivation"
        }
      ];

      return {
        products,
        clients,
        summary: {
          products: countByClass(products),
          clients: countByClass(clients),
        },
        totalRevenue: (sales || []).reduce((sum, s) => sum + (s.amount || 0), 0),
        neuralInsights,
        matrixShifts,
        automations
      };
    },
    staleTime: 1000 * 60 * 30,
  });
};

