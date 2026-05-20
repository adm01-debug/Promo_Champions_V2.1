import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Client360Data {
  ltv: number;
  averageTicket: number;
  ordersCount: number;
  orders: any[];
  topProducts: { name: string; count: number; total: number }[];
  spendingHistory: { date: string; amount: number }[];
  categoryDistribution: { name: string; value: number }[];
  purchaseFrequency: number; // Dias médios entre compras
  predictedNextPurchaseDays: number | null; // Previsão de dias para a próxima compra
  churnRisk: number; // 0 a 100
}

export function useClient360(clientName: string | undefined) {
  return useQuery({
    queryKey: ["client-360", clientName],
    enabled: !!clientName,
    queryFn: async (): Promise<Client360Data> => {
      if (!clientName) throw new Error("Client name is required");

      const { data: sales, error } = await supabase
        .from("sales")
        .select("*")
        .eq("client_name", clientName)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ltv = sales.reduce((acc, sale) => acc + Number(sale.amount || 0), 0);
      const ordersCount = sales.length;
      const averageTicket = ordersCount > 0 ? ltv / ordersCount : 0;

      // Cálculo de Frequência e Previsão
      let purchaseFrequency = 0;
      let predictedNextPurchaseDays: number | null = null;
      let churnRisk = 0;

      if (ordersCount >= 2) {
        const dates = sales.map(s => new Date(s.created_at).getTime()).sort((a, b) => a - b);
        const intervals = [];
        for (let i = 1; i < dates.length; i++) {
          intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
        }
        purchaseFrequency = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        const lastPurchaseDate = new Date(sales[0].created_at).getTime();
        const daysSinceLastPurchase = (new Date().getTime() - lastPurchaseDate) / (1000 * 60 * 60 * 24);
        
        // Previsão simples baseada na média
        predictedNextPurchaseDays = Math.max(0, Math.round(purchaseFrequency - daysSinceLastPurchase));
        
        // Risco de Churn baseado na fuga da frequência média
        if (daysSinceLastPurchase > purchaseFrequency * 1.5) {
          churnRisk = Math.min(100, Math.round(((daysSinceLastPurchase - (purchaseFrequency * 1.5)) / purchaseFrequency) * 100));
        }
      }

      const productMap = new Map<string, { count: number; total: number }>();
      sales.forEach(sale => {
        if (!sale.product_name) return;
        const existing = productMap.get(sale.product_name) || { count: 0, total: 0 };
        existing.count += 1;
        existing.total += Number(sale.amount || 0);
        productMap.set(sale.product_name, existing);
      });

      const topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total - a.total);

      // Histórico de gastos para gráfico
      const spendingHistory = sales
        .map(s => ({
          date: new Date(s.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          amount: Number(s.amount || 0)
        }))
        .reverse(); // Ordem cronológica

      // Distribuição por categoria (simulada via produto ou extraída se houvesse campo category)
      const categoryDistribution = topProducts.slice(0, 5).map(p => ({
        name: p.name.split(' ')[0], // Simplificação para demonstração
        value: p.total
      }));

      return {
        ltv,
        averageTicket,
        ordersCount,
        orders: sales,
        topProducts,
        spendingHistory,
        categoryDistribution,
        purchaseFrequency,
        predictedNextPurchaseDays,
        churnRisk
      };
    },
  });
}
