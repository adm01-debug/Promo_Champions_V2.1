import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Client360Data {
  ltv: number;
  averageTicket: number;
  ordersCount: number;
  orders: any[];
  topProducts: { name: string; count: number; total: number }[];
  spendingHistory: { date: string; amount: number; cumulativeLtv: number }[];
  categoryDistribution: { name: string; value: number }[];
  priceSensitivity: 'high' | 'medium' | 'low';
  preferredDayOfWeek: string;
  preferredTimeOfDay: string;
  purchaseFrequency: number;
  percentile: number;
  segmentAverageLtv: number;
  segmentAverageTicket: number;
  nba: { title: string; description: string; script: string };
  predictedNextPurchaseDays: number | null;
  churnRisk: number;
  engagementRatio: number;
}

export function useClient360(clientName: string | undefined) {
  return useQuery({
    queryKey: ["client-360", clientName],
    enabled: !!clientName,
    queryFn: async (): Promise<Client360Data> => {
      if (!clientName) throw new Error("Client name is required");

      const { data: sales, error } = await supabase
        .from("sales")
        .select(`
          *,
          salesperson:salespeople!sales_salesperson_id_fkey(name),
          closer:salespeople!sales_closer_id_fkey(name),
          sdr:salespeople!sales_sdr_id_fkey(name)
        `)
        .eq("client_name", clientName)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Benchmark da base
      const { data: allSales } = await supabase.from("sales").select("client_name, amount");
      const clientTotals = new Map<string, number>();
      let totalGlobalAmount = 0;
      let totalGlobalOrders = 0;
      
      allSales?.forEach(s => {
        clientTotals.set(s.client_name, (clientTotals.get(s.client_name) || 0) + Number(s.amount));
        totalGlobalAmount += Number(s.amount);
        totalGlobalOrders++;
      });
      
      const sortedTotals = Array.from(clientTotals.values()).sort((a, b) => a - b);
      const ltvValue = sales.reduce((acc, sale) => acc + Number(sale.amount || 0), 0);
      const rank = sortedTotals.filter(t => t < ltvValue).length;
      const percentile = sortedTotals.length > 0 ? Math.round((rank / sortedTotals.length) * 100) : 0;
      
      const segmentAverageLtv = sortedTotals.length > 0 ? totalGlobalAmount / clientTotals.size : 0;
      const segmentAverageTicket = totalGlobalOrders > 0 ? totalGlobalAmount / totalGlobalOrders : 0;

      const ltv = ltvValue;
      const ordersCount = sales.length;
      const averageTicket = ordersCount > 0 ? ltv / ordersCount : 0;

      // Fetch activities to calculate engagement ratio
      const firstSale = sales[sales.length - 1];
      const { data: activities } = await supabase
        .from("activities")
        .select("id")
        .eq("client_id", firstSale?.client_id || '');
      
      const engagementRatio = ordersCount > 0 ? (activities?.length || 0) / ordersCount : 0;

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
        
        predictedNextPurchaseDays = Math.max(0, Math.round(purchaseFrequency - daysSinceLastPurchase));
        
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

      // Histórico de gastos e evolução LTV
      let cumulative = 0;
      const spendingHistory = [...sales]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(s => {
          cumulative += Number(s.amount || 0);
          return {
            date: new Date(s.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            amount: Number(s.amount || 0),
            cumulativeLtv: cumulative
          };
        });

      const categoryDistribution = topProducts.slice(0, 5).map(p => ({
        name: p.name.split(' ')[0],
        value: p.total
      }));

      // Sensibilidade a Preço
      const priceVariation = ordersCount > 1 
        ? Math.sqrt(sales.reduce((acc, s) => acc + Math.pow(Number(s.amount) - averageTicket, 2), 0) / ordersCount) / averageTicket
        : 0;
      const priceSensitivity = priceVariation > 0.4 ? 'high' : priceVariation > 0.15 ? 'medium' : 'low';

      // Preferências temporais
      const daysLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayCounts = new Array(7).fill(0);
      const hourCounts = new Array(24).fill(0);
      
      sales.forEach(s => {
        const date = new Date(s.created_at);
        dayCounts[date.getDay()]++;
        hourCounts[date.getHours()]++;
      });
      
      const preferredDayOfWeek = daysLabels[dayCounts.indexOf(Math.max(...dayCounts))];
      const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
      const preferredTimeOfDay = maxHour < 12 ? 'Manhã' : maxHour < 18 ? 'Tarde' : 'Noite';

      // Next Best Action Generator
      let nba = {
        title: "Upsell Premium",
        description: "Oferecer upgrade para linha Gold baseada no ticket médio.",
        script: `Olá ${clientName}, notamos seu interesse em ${topProducts[0]?.name || 'nossos produtos'}. Temos uma condição exclusiva para o upgrade da sua conta!`
      };

      if (churnRisk > 50) {
        nba = {
          title: "Resgate Crítico",
          description: "Enviar cupom de 20% OFF para reativação imediata.",
          script: `Oi ${clientName}, sentimos sua falta! Preparamos um cupom de 20% (VOLTA20) válido por 48h para seu próximo pedido.`
        };
      } else if (ordersCount < 3) {
        nba = {
          title: "Boas-vindas Revisitada",
          description: "Garantir a segunda compra com amostra grátis.",
          script: `Olá ${clientName}, tudo bem? Queremos te presentear com um item extra no seu próximo pedido para celebrar nossa parceria!`
        };
      }

      return {
        ltv,
        averageTicket,
        ordersCount,
        orders: sales,
        topProducts,
        spendingHistory,
        categoryDistribution,
        priceSensitivity,
        preferredDayOfWeek,
        preferredTimeOfDay,
        purchaseFrequency,
        percentile,
        segmentAverageLtv,
        segmentAverageTicket,
        nba,
        predictedNextPurchaseDays,
        churnRisk,
        engagementRatio
      };
    },
  });
}