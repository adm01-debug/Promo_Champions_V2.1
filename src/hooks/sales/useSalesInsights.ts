import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface ClientInsight {
  name: string;
  company: string | null;
  avgTicket: number;
  totalOrders: number;
  totalValue: number;
}

export interface RepurchaseInsight {
  name: string;
  company: string | null;
  purchaseCount: number;
  totalValue: number;
  repurchaseRate: number;
}

export interface SalesInsightsData {
  avgTicketGlobal: number;
  avgTicketPrevMonth: number;
  avgTicketChange: number;
  repurchaseRateGlobal: number;
  repurchaseRatePrevMonth: number;
  repurchaseRateChange: number;
  topByAvgTicket: ClientInsight[];
  topByRepurchase: RepurchaseInsight[];
  totalUniqueClients: number;
  totalRepurchaseClients: number;
}

export function useSalesInsights() {
  return useQuery({
    queryKey: ["sales-insights"],
    queryFn: async (): Promise<SalesInsightsData> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));

      const [currentSalesRes, prevSalesRes, allSalesRes, clientsRes] = await Promise.all([
        supabase
          .from("sales")
          .select("client_name, amount")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        supabase
          .from("sales")
          .select("client_name, amount")
          .eq("status", "completed")
          .gte("created_at", prevMonthStart.toISOString())
          .lte("created_at", prevMonthEnd.toISOString()),
        supabase
          .from("sales")
          .select("client_name, amount, created_at")
          .eq("status", "completed")
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("name, company"),
      ]);

      const currentSales = currentSalesRes.data || [];
      const prevSales = prevSalesRes.data || [];
      const allSales = allSalesRes.data || [];
      const clients = clientsRes.data || [];

      const clientCompanyMap = new Map<string, string | null>();
      clients.forEach(c => clientCompanyMap.set(c.name.toLowerCase(), c.company));

      // --- Ticket Médio ---
      const calcAvgTicket = (sales: typeof currentSales) => {
        if (sales.length === 0) return 0;
        return sales.reduce((sum, s) => sum + Number(s.amount), 0) / sales.length;
      };

      const avgTicketGlobal = calcAvgTicket(currentSales);
      const avgTicketPrevMonth = calcAvgTicket(prevSales);
      const avgTicketChange = avgTicketPrevMonth > 0
        ? ((avgTicketGlobal - avgTicketPrevMonth) / avgTicketPrevMonth) * 100
        : 0;

      // Top clients by avg ticket (current month)
      const clientTicketMap = new Map<string, { total: number; count: number }>();
      currentSales.forEach(s => {
        const existing = clientTicketMap.get(s.client_name) || { total: 0, count: 0 };
        existing.total += Number(s.amount);
        existing.count += 1;
        clientTicketMap.set(s.client_name, existing);
      });

      const topByAvgTicket: ClientInsight[] = Array.from(clientTicketMap.entries())
        .map(([name, data]) => ({
          name,
          company: clientCompanyMap.get(name.toLowerCase()) || null,
          avgTicket: data.total / data.count,
          totalOrders: data.count,
          totalValue: data.total,
        }))
        .sort((a, b) => b.avgTicket - a.avgTicket)
        .slice(0, 8);

      // --- Taxa de Recompra ---
      // All-time: clients with 2+ purchases
      const allClientMap = new Map<string, number>();
      allSales.forEach(s => {
        allClientMap.set(s.client_name, (allClientMap.get(s.client_name) || 0) + 1);
      });

      const totalUniqueClients = allClientMap.size;
      const totalRepurchaseClients = Array.from(allClientMap.values()).filter(c => c >= 2).length;
      const repurchaseRateGlobal = totalUniqueClients > 0
        ? (totalRepurchaseClients / totalUniqueClients) * 100
        : 0;

      // Previous month repurchase
      const prevClientMap = new Map<string, number>();
      prevSales.forEach(s => {
        prevClientMap.set(s.client_name, (prevClientMap.get(s.client_name) || 0) + 1);
      });
      const prevUnique = prevClientMap.size;
      const prevRepurchase = Array.from(prevClientMap.values()).filter(c => c >= 2).length;
      const repurchaseRatePrevMonth = prevUnique > 0 ? (prevRepurchase / prevUnique) * 100 : 0;
      const repurchaseRateChange = repurchaseRatePrevMonth > 0
        ? ((repurchaseRateGlobal - repurchaseRatePrevMonth) / repurchaseRatePrevMonth) * 100
        : 0;

      // Top repurchase clients
      const topByRepurchase: RepurchaseInsight[] = Array.from(allClientMap.entries())
        .filter(([, count]) => count >= 2)
        .map(([name, count]) => {
          const clientSales = allSales.filter(s => s.client_name === name);
          const totalValue = clientSales.reduce((sum, s) => sum + Number(s.amount), 0);
          return {
            name,
            company: clientCompanyMap.get(name.toLowerCase()) || null,
            purchaseCount: count,
            totalValue,
            repurchaseRate: 100, // they are repeat buyers
          };
        })
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 8);

      return {
        avgTicketGlobal,
        avgTicketPrevMonth,
        avgTicketChange,
        repurchaseRateGlobal,
        repurchaseRatePrevMonth,
        repurchaseRateChange,
        topByAvgTicket,
        topByRepurchase,
        totalUniqueClients,
        totalRepurchaseClients,
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}
