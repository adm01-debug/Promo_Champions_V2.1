import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

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
  is_first_sale: boolean;
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
      const query = supabase
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
  // All computed values are memoized based on query data
  const salesQuery = useSales(dateRange);
  const metricsQuery = useDailyMetrics(dateRange);
  const categoryQuery = useCategoryMetrics(dateRange);

  const calculateMetrics = () => {
    if (!salesQuery.data || salesQuery.data.length === 0) {
      return {
        totalRevenue: 0,
        activationRevenue: 0,
        portfolioRevenue: 0,
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
    const activationRevenue = completedSales.filter(s => s.is_first_sale).reduce((sum, s) => sum + Number(s.amount), 0);
    const portfolioRevenue = totalRevenue - activationRevenue;
    const avgTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
    
    // Get unique clients
    const uniqueClients = new Set(salesQuery.data.map(s => s.client_name));
    
    // Calculate real change percentages based on daily metrics if available
    let revenueChange = 0;
    let clientsChange = 0;
    let conversionChange = 0;
    let ticketChange = 0;
    
    if (metricsQuery.data && metricsQuery.data.length >= 2) {
      const midpoint = Math.floor(metricsQuery.data.length / 2);
      const firstHalf = metricsQuery.data.slice(0, midpoint);
      const secondHalf = metricsQuery.data.slice(midpoint);
      
      const firstRevenue = firstHalf.reduce((sum, m) => sum + Number(m.revenue), 0);
      const secondRevenue = secondHalf.reduce((sum, m) => sum + Number(m.revenue), 0);
      const firstClients = firstHalf.reduce((sum, m) => sum + m.new_clients, 0);
      const secondClients = secondHalf.reduce((sum, m) => sum + m.new_clients, 0);
      const firstConversion = firstHalf.length > 0 ? firstHalf.reduce((sum, m) => sum + Number(m.conversion_rate), 0) / firstHalf.length : 0;
      const secondConversion = secondHalf.length > 0 ? secondHalf.reduce((sum, m) => sum + Number(m.conversion_rate), 0) / secondHalf.length : 0;
      const firstTicket = firstHalf.length > 0 ? firstHalf.reduce((sum, m) => sum + Number(m.avg_ticket), 0) / firstHalf.length : 0;
      const secondTicket = secondHalf.length > 0 ? secondHalf.reduce((sum, m) => sum + Number(m.avg_ticket), 0) / secondHalf.length : 0;
      
      revenueChange = firstRevenue > 0 ? ((secondRevenue - firstRevenue) / firstRevenue) * 100 : 0;
      clientsChange = firstClients > 0 ? ((secondClients - firstClients) / firstClients) * 100 : 0;
      conversionChange = firstConversion > 0 ? ((secondConversion - firstConversion) / firstConversion) * 100 : 0;
      ticketChange = firstTicket > 0 ? ((secondTicket - firstTicket) / firstTicket) * 100 : 0;
    }
    
    return {
      totalRevenue,
      activationRevenue,
      portfolioRevenue,
      newClients: uniqueClients.size,
      conversionRate: salesQuery.data.length > 0 
        ? (completedSales.length / salesQuery.data.length) * 100 
        : 0,
      avgTicket,
      revenueChange: Number(revenueChange.toFixed(1)),
      clientsChange: Number(clientsChange.toFixed(1)),
      conversionChange: Number(conversionChange.toFixed(1)),
      ticketChange: Number(ticketChange.toFixed(1)),
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

  const metrics = useMemo(() => calculateMetrics(), [salesQuery.data, metricsQuery.data]);
  const revenueData = useMemo(() => formatRevenueData(), [metricsQuery.data]);
  const categoryData = useMemo(() => formatCategoryData(), [categoryQuery.data]);
  const salesData = useMemo(() => formatSalesData(), [salesQuery.data]);

  return {
    sales: salesQuery.data || [],
    metrics,
    revenueData,
    categoryData,
    salesData,
    isLoading: salesQuery.isLoading || metricsQuery.isLoading || categoryQuery.isLoading,
    error: salesQuery.error || metricsQuery.error || categoryQuery.error,
  };
}
