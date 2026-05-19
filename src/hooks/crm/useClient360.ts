import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Client360Data {
  ltv: number;
  averageTicket: number;
  ordersCount: number;
  orders: any[];
  topProducts: { name: string; count: number; total: number }[];
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

      return {
        ltv,
        averageTicket,
        ordersCount,
        orders: sales,
        topProducts,
      };
    },
  });
}
