import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, endOfDay } from "date-fns";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface Sale {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  created_at: string;
}

interface DailyMetric {
  id: string;
  date: string;
  revenue: number;
  revenue_goal: number;
  new_clients: number;
  total_sales: number;
  conversion_rate: number;
  avg_ticket: number;
}

interface CategoryMetric {
  id: string;
  date: string;
  category: string;
  percentage: number;
}

export function useSales(dateRange: DateRange) {
  return useQuery({
    queryKey: ["sales", dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });

      if (dateRange.from) {
        query = query.gte("created_at", startOfDay(dateRange.from).toISOString());
      }
      if (dateRange.to) {
        query = query.lte("created_at", endOfDay(dateRange.to).toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Sale[];
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useDailyMetrics(dateRange: DateRange) {
  return useQuery({
    queryKey: ["daily_metrics", dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from("daily_metrics")
        .select("*")
        .order("date", { ascending: true });

      if (dateRange.from) {
        query = query.gte("date", dateRange.from.toISOString().split("T")[0]);
      }
      if (dateRange.to) {
        query = query.lte("date", dateRange.to.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DailyMetric[];
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useCategoryMetrics(dateRange: DateRange) {
  return useQuery({
    queryKey: ["category_metrics", dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from("category_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(4);

      const { data, error } = await query;

      if (error) throw error;
      return data as CategoryMetric[];
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
}

export function useReportMetrics(dateRange: DateRange) {
  const salesQuery = useSales(dateRange);
  const metricsQuery = useDailyMetrics(dateRange);
  const categoryQuery = useCategoryMetrics(dateRange);

  const calculateMetrics = () => {
    if (!salesQuery.data || salesQuery.data.length === 0) {
      return {
        totalRevenue: 0,
        newClients: 0,
        conversionRate: 0,
        avgTicket: 0,
        revenueChange: 0,
        clientsChange: 0,
        conversionChange: 0,
        ticketChange: 0,
      };
    }

    const completedSales = salesQuery.data.filter(s => s.status === "completed");
    const totalRevenue = completedSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const avgTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
    
    // Get unique clients
    const uniqueClients = new Set(salesQuery.data.map(s => s.client_name));
    
    return {
      totalRevenue,
      newClients: uniqueClients.size,
      conversionRate: salesQuery.data.length > 0 
        ? (completedSales.length / salesQuery.data.length) * 100 
        : 0,
      avgTicket,
      revenueChange: 12.5,
      clientsChange: 8.3,
      conversionChange: -2.1,
      ticketChange: 15.7,
    };
  };

  const formatRevenueData = () => {
    if (!metricsQuery.data) return [];
    
    return metricsQuery.data.map(m => ({
      mes: new Date(m.date).toLocaleDateString("pt-BR", { month: "short" }),
      receita: Number(m.revenue),
      meta: Number(m.revenue_goal),
    }));
  };

  const formatCategoryData = () => {
    if (!categoryQuery.data) return [];
    
    const colors: Record<string, string> = {
      subscription: "hsl(24, 100%, 55%)",
      service: "hsl(280, 80%, 60%)",
      project: "hsl(340, 80%, 55%)",
      other: "hsl(142, 76%, 45%)",
    };

    const names: Record<string, string> = {
      subscription: "Assinaturas",
      service: "Serviços",
      project: "Projetos",
      other: "Outros",
    };

    return categoryQuery.data.map(c => ({
      name: names[c.category] || c.category,
      value: Number(c.percentage),
      color: colors[c.category] || "hsl(200, 80%, 50%)",
    }));
  };

  const formatSalesData = () => {
    if (!salesQuery.data) return [];
    
    // Group by day/week/month depending on period
    const grouped = salesQuery.data.reduce((acc, sale) => {
      const date = new Date(sale.created_at).toLocaleDateString("pt-BR", { weekday: "short" });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([dia, vendas]) => ({ dia, vendas }));
  };

  return {
    sales: salesQuery.data || [],
    metrics: calculateMetrics(),
    revenueData: formatRevenueData(),
    categoryData: formatCategoryData(),
    salesData: formatSalesData(),
    isLoading: salesQuery.isLoading || metricsQuery.isLoading || categoryQuery.isLoading,
    error: salesQuery.error || metricsQuery.error || categoryQuery.error,
  };
}
