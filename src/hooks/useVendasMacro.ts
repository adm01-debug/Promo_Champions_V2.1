import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, parseISO } from "date-fns";

export interface MacroSellerData {
  id: string;
  name: string;
  avatar_url: string | null;
  unitsQuoted: number;
  unitsSold: number;
  revenue: number;
  quotesCount: number;
  ordersCount: number;
}

export interface MacroDailyData {
  day: string;
  quoted: number;
  sold: number;
  revenue: number;
}

export interface VendasMacroData {
  totalQuoted: number;
  totalSold: number;
  totalQuotedValue: number;
  totalSoldValue: number;
  avgTicket: number;
  activeSellers: number;
  conversionRate: number;
  totalRevenue: number;
  dailyData: MacroDailyData[];
  topSellers: MacroSellerData[];
}

export function useVendasMacro(days: number = 30) {
  return useQuery({
    queryKey: ["vendas-macro", days],
    queryFn: async (): Promise<VendasMacroData> => {
      const now = new Date();
      const startDate = subDays(now, days);

      const [salesRes, salespeopleRes] = await Promise.all([
        supabase
          .from("sales")
          .select("id, salesperson_id, amount, status, created_at")
          .gte("created_at", startDate.toISOString())
          .not("status", "eq", "lost"),
        supabase
          .from("salespeople")
          .select("id, name, avatar_url")
          .eq("is_active", true),
      ]);

      const sales = salesRes.data || [];
      const salespeople = salespeopleRes.data || [];

      // Separate quoted (pipeline) vs sold (completed)
      const quoted = sales; // all non-lost = total orçado
      const sold = sales.filter(s => s.status === "completed");

      const totalQuoted = quoted.length;
      const totalSold = sold.length;
      const totalQuotedValue = quoted.reduce((sum, s) => sum + Number(s.amount), 0);
      const totalSoldValue = sold.reduce((sum, s) => sum + Number(s.amount), 0);
      const avgTicket = totalSold > 0 ? totalSoldValue / totalSold : 0;
      const conversionRate = totalQuoted > 0 ? (totalSold / totalQuoted) * 100 : 0;

      // Active sellers (those with at least 1 sale in period)
      const activeSellersSet = new Set(sales.map(s => s.salesperson_id).filter(Boolean));
      const activeSellers = activeSellersSet.size;

      // Daily data
      const dailyMap = new Map<string, MacroDailyData>();
      for (let d = 0; d <= days; d++) {
        const date = subDays(now, days - d);
        const key = format(date, "dd/MM");
        dailyMap.set(key, { day: key, quoted: 0, sold: 0, revenue: 0 });
      }

      sales.forEach(s => {
        const key = format(parseISO(s.created_at), "dd/MM");
        const entry = dailyMap.get(key);
        if (entry) {
          entry.quoted += 1;
          if (s.status === "completed") {
            entry.sold += 1;
            entry.revenue += Number(s.amount);
          }
        }
      });

      const dailyData = Array.from(dailyMap.values());

      // Top sellers
      const sellerMap = new Map<string, { quoted: number; sold: number; revenue: number; quotesCount: number; ordersCount: number }>();
      sales.forEach(s => {
        const sid = s.salesperson_id || "unknown";
        const existing = sellerMap.get(sid) || { quoted: 0, sold: 0, revenue: 0, quotesCount: 0, ordersCount: 0 };
        existing.quoted += 1;
        existing.quotesCount += 1;
        if (s.status === "completed") {
          existing.sold += 1;
          existing.ordersCount += 1;
          existing.revenue += Number(s.amount);
        }
        sellerMap.set(sid, existing);
      });

      const spMap = new Map(salespeople.map(sp => [sp.id, sp]));

      const topSellers: MacroSellerData[] = Array.from(sellerMap.entries())
        .map(([id, data]) => {
          const sp = spMap.get(id);
          return {
            id,
            name: sp?.name || "Desconhecido",
            avatar_url: sp?.avatar_url || null,
            unitsQuoted: data.quoted,
            unitsSold: data.sold,
            revenue: data.revenue,
            quotesCount: data.quotesCount,
            ordersCount: data.ordersCount,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        totalQuoted,
        totalSold,
        totalQuotedValue,
        totalSoldValue,
        avgTicket,
        activeSellers,
        conversionRate,
        totalRevenue: totalSoldValue,
        dailyData,
        topSellers,
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}
