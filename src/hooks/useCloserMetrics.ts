import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subWeeks, subMonths, subQuarters } from "date-fns";

export type SalesRole = 'sdr' | 'closer' | 'hybrid';
export type PeriodFilter = "week" | "month" | "quarter";

interface RoleMetrics {
  totalDeals: number;
  closedDeals: number;
  totalValue: number;
  closedValue: number;
  conversionRate: number;
  avgDealSize: number;
  inNegotiation: number;
  inProposal: number;
}

interface RoleComparison {
  current: RoleMetrics;
  previous: RoleMetrics;
  changes: {
    deals: number;
    value: number;
    conversion: number;
  };
}

function getPeriodRange(period: PeriodFilter, offset: number = 0) {
  const now = new Date();
  
  switch (period) {
    case "week": {
      const weekRef = offset === 0 ? now : subWeeks(now, offset);
      return { start: startOfWeek(weekRef, { weekStartsOn: 1 }), end: endOfWeek(weekRef, { weekStartsOn: 1 }) };
    }
    case "month": {
      const monthRef = offset === 0 ? now : subMonths(now, offset);
      return { start: startOfMonth(monthRef), end: endOfMonth(monthRef) };
    }
    case "quarter": {
      const quarterRef = offset === 0 ? now : subQuarters(now, offset);
      return { start: startOfQuarter(quarterRef), end: endOfQuarter(quarterRef) };
    }
  }
}

export function useCloserMetrics(period: PeriodFilter = "month") {
  return useQuery({
    queryKey: ["closer-metrics", period],
    queryFn: async (): Promise<RoleComparison> => {
      const currentRange = getPeriodRange(period, 0);
      const previousRange = getPeriodRange(period, 1);

      // Fetch all data in parallel for better performance
      const [closersResult, currentSalesResult, previousSalesResult] = await Promise.all([
        supabase
          .from("salespeople")
          .select("id")
          .in("role", ["closer", "hybrid"]),
        supabase
          .from("sales")
          .select("id, status, amount, salesperson_id")
          .gte("created_at", currentRange.start.toISOString())
          .lte("created_at", currentRange.end.toISOString()),
        supabase
          .from("sales")
          .select("id, status, amount, salesperson_id")
          .gte("created_at", previousRange.start.toISOString())
          .lte("created_at", previousRange.end.toISOString()),
      ]);

      const closerIds = closersResult.data?.map(c => c.id) || [];
      
      // Filter sales by Closer IDs
      const currentSales = currentSalesResult.data?.filter(s => closerIds.includes(s.salesperson_id || '')) || [];
      const previousSales = previousSalesResult.data?.filter(s => closerIds.includes(s.salesperson_id || '')) || [];

      const calculateMetrics = (sales: Array<{ id: string; status: string; amount: number; salesperson_id: string | null }>): RoleMetrics => {
        const totalDeals = sales?.length || 0;
        const closedDeals = sales?.filter(s => s.status === "completed").length || 0;
        const totalValue = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
        const closedValue = sales?.filter(s => s.status === "completed")
          .reduce((sum, s) => sum + Number(s.amount), 0) || 0;
        const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;
        const avgDealSize = closedDeals > 0 ? closedValue / closedDeals : 0;
        const inNegotiation = sales?.filter(s => s.status === "negotiation").length || 0;
        const inProposal = sales?.filter(s => s.status === "proposal").length || 0;

        return {
          totalDeals,
          closedDeals,
          totalValue,
          closedValue,
          conversionRate,
          avgDealSize,
          inNegotiation,
          inProposal,
        };
      };

      const current = calculateMetrics(currentSales || []);
      const previous = calculateMetrics(previousSales || []);

      const calcChange = (curr: number, prev: number) => 
        prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;

      return {
        current,
        previous,
        changes: {
          deals: calcChange(current.closedDeals, previous.closedDeals),
          value: calcChange(current.closedValue, previous.closedValue),
          conversion: calcChange(current.conversionRate, previous.conversionRate),
        },
      };
    },
    staleTime: 60000, // Consider data fresh for 1 minute
  });
}

export function useCloserPipeline() {
  return useQuery({
    queryKey: ["closer-pipeline"],
    queryFn: async () => {
      // Fetch closers
      const { data: closers } = await supabase
        .from("salespeople")
        .select("id")
        .in("role", ["closer", "hybrid"]);

      const closerIds = closers?.map(c => c.id) || [];

      const { data: sales } = await supabase
        .from("sales")
        .select("status, amount")
        .in("salesperson_id", closerIds)
        .in("status", ["proposal", "negotiation", "completed"]);

      const { data: pendingBudgets } = await supabase
        .from("sales")
        .select("amount")
        .in("salesperson_id", closerIds)
        .eq("status", "pending");

      const pipeline = {
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        completed: { count: 0, value: 0 },
        pending: { count: pendingBudgets?.length || 0, value: pendingBudgets?.reduce((sum, b) => sum + Number(b.amount), 0) || 0 }
      };

      sales?.forEach(sale => {
        const status = sale.status as keyof typeof pipeline;
        if (status in pipeline) {
          pipeline[status].count++;
          pipeline[status].value += Number(sale.amount);
        }
      });

      return [
        { stage: "Orçamentos Pendentes", ...pipeline.pending, color: "#94a3b8" },
        { stage: "Proposta", ...pipeline.proposal, color: "#8b5cf6" },
        { stage: "Negociação", ...pipeline.negotiation, color: "#f59e0b" },
        { stage: "Fechados", ...pipeline.completed, color: "#22c55e" },
      ];
    },
  });
}

export function useTopClosers() {
  return useQuery({
    queryKey: ["top-closers"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);

      // Fetch closers
      const { data: closers } = await supabase
        .from("salespeople")
        .select("*")
        .in("role", ["closer", "hybrid"])
        .eq("is_active", true);

      // Fetch this month's completed sales
      const { data: sales } = await supabase
        .from("sales")
        .select("salesperson_id, amount")
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString());

      // Calculate stats per closer
      const stats = new Map<string, { closedDeals: number; closedValue: number }>();

      sales?.forEach(sale => {
        if (!sale.salesperson_id) return;
        const current = stats.get(sale.salesperson_id) || { closedDeals: 0, closedValue: 0 };
        current.closedDeals++;
        current.closedValue += Number(sale.amount);
        stats.set(sale.salesperson_id, current);
      });

      return closers?.map(c => ({
        ...c,
        ...stats.get(c.id) || { closedDeals: 0, closedValue: 0 }
      }))
      .sort((a, b) => b.closedValue - a.closedValue)
      .slice(0, 5) || [];
    },
  });
}

export function useRecentClosedDeals() {
  return useQuery({
    queryKey: ["recent-closed-deals"],
    queryFn: async () => {
      const { data: closers } = await supabase
        .from("salespeople")
        .select("id")
        .in("role", ["closer", "hybrid"]);

      const closerIds = closers?.map(c => c.id) || [];

      const { data: deals } = await supabase
        .from("sales")
        .select("*")
        .in("salesperson_id", closerIds)
        .eq("status", "completed")
        .order("updated_at", { ascending: false })
        .limit(6);

      return deals || [];
    },
  });
}
