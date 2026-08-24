import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";
import { isWonSaleStatus } from "@/constants";

export interface RevenueHistoryPoint {
  period: string;
  revenue: number;
}

/**
 * Agrega receita mensal dos últimos 18 meses a partir de `sales` com status won.
 * Bootstrap simples usado como input do ensemble Revenue Forecast v2.
 */
export function useRevenueHistory(monthsBack: number = 18) {
  return useQuery<RevenueHistoryPoint[]>({
    queryKey: ["revenue-history-v2", monthsBack],
    queryFn: async () => {
      const start = startOfMonth(subMonths(new Date(), monthsBack));
      const { data, error } = await supabase
        .from("sales")
        .select("amount, status, created_at")
        .gte("created_at", start.toISOString());
      if (error) throw error;

      const buckets = new Map<string, number>();
      for (let i = monthsBack; i >= 0; i--) {
        const key = format(startOfMonth(subMonths(new Date(), i)), "yyyy-MM");
        buckets.set(key, 0);
      }

      (data ?? []).forEach((row) => {
        if (!isWonSaleStatus(row.status)) return;
        const key = format(startOfMonth(new Date(row.created_at)), "yyyy-MM");
        if (buckets.has(key)) {
          buckets.set(key, (buckets.get(key) ?? 0) + (row.amount ?? 0));
        }
      });

      return Array.from(buckets.entries()).map(([period, revenue]) => ({
        period,
        revenue,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
