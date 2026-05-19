import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subWeeks, subMonths, subQuarters, subDays } from "date-fns";
import { captureException } from "@/lib/errorTracking";

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
      try {
        const currentRange = getPeriodRange(period, 0);
        const previousRange = getPeriodRange(period, 1);

        // Fetch closers once
        const { data: closersData } = await supabase
          .from("salespeople")
          .select("id")
          .in("role", ["closer", "hybrid"]);
        
        const closerIds = closersData?.map(c => c.id) || [];
        if (closerIds.length === 0) throw new Error("No closers found");

        const buildSalesQuery = (range: { start: Date; end: Date }) => {
          return supabase
            .from("sales")
            .select("id, status, amount, salesperson_id")
            .in("salesperson_id", closerIds)
            .gte("created_at", range.start.toISOString())
            .lte("created_at", range.end.toISOString());
        };

        const [currentSalesRes, prevSalesRes] = await Promise.all([
          buildSalesQuery(currentRange),
          buildSalesQuery(previousRange),
        ]);

        if (currentSalesRes.error) throw currentSalesRes.error;
        if (prevSalesRes.error) throw prevSalesRes.error;

        const calculateMetrics = (sales: Array<{ status: string; amount: number | null }>): RoleMetrics => {
          const totalDeals = sales.length;
          const closedDeals = sales.filter(s => s.status === "completed").length;
          const totalValue = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
          const closedValue = sales.filter(s => s.status === "completed")
            .reduce((sum, s) => sum + Number(s.amount || 0), 0);
          const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;
          const avgDealSize = closedDeals > 0 ? closedValue / closedDeals : 0;
          const inNegotiation = sales.filter(s => s.status === "negotiation").length;
          const inProposal = sales.filter(s => s.status === "proposal").length;

          return {
            totalDeals, closedDeals, totalValue, closedValue,
            conversionRate, avgDealSize, inNegotiation, inProposal
          };
        };

        const current = calculateMetrics(currentSalesRes.data || []);
        const previous = calculateMetrics(prevSalesRes.data || []);

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
      } catch (error) {
        captureException(error, "useCloserMetrics");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCloserPipeline() {
  return useQuery({
    queryKey: ["closer-pipeline"],
    queryFn: async () => {
      try {
        const sixtyDaysAgo = subDays(new Date(), 60);
        const { data: closers } = await supabase
          .from("salespeople")
          .select("id")
          .in("role", ["closer", "hybrid"]);

        const closerIds = closers?.map(c => c.id) || [];

        const { data: sales, error } = await supabase
          .from("sales")
          .select("status, amount")
          .in("salesperson_id", closerIds)
          .gte("created_at", sixtyDaysAgo.toISOString())
          .in("status", ["proposal", "negotiation", "completed", "pending"]);

        if (error) throw error;

        const pipeline = {
          proposal: { count: 0, value: 0 },
          negotiation: { count: 0, value: 0 },
          completed: { count: 0, value: 0 },
          pending: { count: 0, value: 0 }
        };

        sales?.forEach(sale => {
          const status = sale.status as keyof typeof pipeline;
          if (status in pipeline) {
            pipeline[status].count++;
            pipeline[status].value += Number(sale.amount || 0);
          }
        });

        return [
          { stage: "Orçamentos Pendentes", ...pipeline.pending, color: "#94a3b8" },
          { stage: "Proposta", ...pipeline.proposal, color: "#8b5cf6" },
          { stage: "Negociação", ...pipeline.negotiation, color: "#f59e0b" },
          { stage: "Fechados", ...pipeline.completed, color: "#22c55e" },
        ];
      } catch (error) {
        captureException(error, "useCloserPipeline");
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useTopClosers() {
  return useQuery({
    queryKey: ["top-closers"],
    queryFn: async () => {
      try {
        const monthStart = startOfMonth(new Date());

        const { data: closers, error: closersErr } = await supabase
          .from("salespeople")
          .select("*")
          .in("role", ["closer", "hybrid"])
          .eq("is_active", true);

        if (closersErr) throw closersErr;

        const { data: sales, error: salesErr } = await supabase
          .from("sales")
          .select("salesperson_id, amount")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString());

        if (salesErr) throw salesErr;

        const stats = new Map<string, { closedDeals: number; closedValue: number }>();
        sales?.forEach(sale => {
          if (!sale.salesperson_id) return;
          const current = stats.get(sale.salesperson_id) || { closedDeals: 0, closedValue: 0 };
          current.closedDeals++;
          current.closedValue += Number(sale.amount || 0);
          stats.set(sale.salesperson_id, current);
        });

        return (closers || [])
          .map(c => ({
            ...c,
            ...stats.get(c.id) || { closedDeals: 0, closedValue: 0 }
          }))
          .sort((a, b) => b.closedValue - a.closedValue)
          .slice(0, 5);
      } catch (error) {
        captureException(error, "useTopClosers");
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useRecentClosedDeals() {
  return useQuery({
    queryKey: ["recent-closed-deals"],
    queryFn: async () => {
      try {
        const { data: deals, error } = await supabase
          .from("sales")
          .select("*")
          .eq("status", "completed")
          .order("updated_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        return deals || [];
      } catch (error) {
        captureException(error, "useRecentClosedDeals");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
