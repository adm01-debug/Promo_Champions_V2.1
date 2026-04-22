import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";
import {
  buildKpis,
  buildKpiDeltas,
  buildRevenueSeries,
  buildTopProducts,
  buildStatusBreakdown,
  buildTeamRanking,
  buildTopDeals,
  type ReportPeriod,
  type SalesReportData,
  type SaleRow,
  type SalespersonRow,
} from "./salesReportHelpers";

function getRange(period: ReportPeriod, refDate: Date) {
  if (period === "weekly") {
    const start = startOfWeek(refDate, { weekStartsOn: 1 });
    const end = endOfWeek(refDate, { weekStartsOn: 1 });
    const prevStart = startOfWeek(subWeeks(refDate, 1), { weekStartsOn: 1 });
    const prevEnd = endOfWeek(subWeeks(refDate, 1), { weekStartsOn: 1 });
    return { start, end, prevStart, prevEnd };
  }
  return {
    start: startOfMonth(refDate),
    end: endOfMonth(refDate),
    prevStart: startOfMonth(subMonths(refDate, 1)),
    prevEnd: endOfMonth(subMonths(refDate, 1)),
  };
}

export function useSalesReport(period: ReportPeriod, refDate: Date) {
  return useQuery<SalesReportData>({
    queryKey: ["sales-report", period, refDate.toISOString().slice(0, 10)],
    queryFn: async () => {
      const { start, end, prevStart, prevEnd } = getRange(period, refDate);
      const [curRes, prevRes, spRes] = await Promise.all([
        supabase
          .from("sales")
          .select("id, amount, status, created_at, client_name, product_name, salesperson_id")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString()),
        supabase
          .from("sales")
          .select("id, amount, status, created_at, client_name, product_name, salesperson_id")
          .gte("created_at", prevStart.toISOString())
          .lte("created_at", prevEnd.toISOString()),
        supabase.from("salespeople_public").select("id, name"),
      ]);

      if (curRes.error) throw curRes.error;
      if (prevRes.error) throw prevRes.error;

      const current = (curRes.data ?? []) as SaleRow[];
      const previous = (prevRes.data ?? []) as SaleRow[];
      const salespeople = (spRes.data ?? []) as SalespersonRow[];

      const curKpis = buildKpis(current);
      const prevKpis = buildKpis(previous);

      return {
        current: buildKpiDeltas(curKpis, prevKpis),
        revenueSeries: buildRevenueSeries(current, period, start, end),
        topProducts: buildTopProducts(current),
        statusBreakdown: buildStatusBreakdown(current),
        teamRanking: buildTeamRanking(current, salespeople),
        topDeals: buildTopDeals(current, salespeople),
        isEmpty: current.length === 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
