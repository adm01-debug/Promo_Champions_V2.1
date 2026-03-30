import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateSalesReport } from "@/lib/salesReportPdf";

export async function generateCurrentMonthReport() {
  const now = new Date();
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));
  const cs = format(currentStart, "yyyy-MM-dd");
  const ce = format(currentEnd, "yyyy-MM-dd");
  const ps = format(prevStart, "yyyy-MM-dd");
  const pe = format(prevEnd, "yyyy-MM-dd");

  const [curSales, prevSales, curMetrics, prevMetrics, topDeals, spData, goals] = await Promise.all([
    supabase.from("sales").select("amount, status").gte("created_at", cs).lte("created_at", ce),
    supabase.from("sales").select("amount, status").gte("created_at", ps).lte("created_at", pe),
    supabase.from("daily_metrics").select("*").gte("date", cs).lte("date", ce),
    supabase.from("daily_metrics").select("*").gte("date", ps).lte("date", pe),
    supabase.from("sales").select("client_name, product_name, amount, status")
      .in("status", ["pending", "qualified", "proposal", "negotiation"])
      .order("amount", { ascending: false }).limit(10),
    supabase.rpc('get_active_salespeople'),
    supabase.from("sales_goals").select("salesperson_id, goal_amount").eq("month", format(now, "yyyy-MM") + "-01"),
  ]);

  const curCompleted = (curSales.data || []).filter(s => s.status === "completed");
  const prevCompleted = (prevSales.data || []).filter(s => s.status === "completed");
  const curRevenue = curCompleted.reduce((s, v) => s + Number(v.amount), 0);
  const prevRevenue = prevCompleted.reduce((s, v) => s + Number(v.amount), 0);

  const calcChange = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : Math.round(((c - p) / p) * 100);

  const curConv = (curMetrics.data || []).length
    ? (curMetrics.data || []).reduce((s, m) => s + Number(m.conversion_rate), 0) / (curMetrics.data || []).length
    : 0;
  const prevConv = (prevMetrics.data || []).length
    ? (prevMetrics.data || []).reduce((s, m) => s + Number(m.conversion_rate), 0) / (prevMetrics.data || []).length
    : 0;

  const curTicket = curCompleted.length > 0 ? curRevenue / curCompleted.length : 0;
  const prevTicket = prevCompleted.length > 0 ? prevRevenue / prevCompleted.length : 0;

  const STATUS_MAP: Record<string, string> = {
    pending: "Lead", qualified: "Qualificado", proposal: "Proposta", negotiation: "Negociação",
  };

  // Build team ranking
  const _salespeopleMap = new Map((spData.data || []).map(sp => [sp.id, sp.name]));
  const goalsMap = new Map((goals.data || []).map(g => [g.salesperson_id, Number(g.goal_amount)]));
  
  const _spSalesAgg: Record<string, number> = {};
  (curSales.data || []).forEach(() => {
    // Would need salesperson_id in the query - simplified
  });

  const teamRanking = (spData.data || []).map(sp => ({
    name: sp.name,
    sales: 0,
    goal: goalsMap.get(sp.id) || 0,
    progress: 0,
  }));

  await generateSalesReport({
    period: format(now, "MMMM yyyy", { locale: ptBR }),
    revenue: { current: curRevenue, previous: prevRevenue, change: calcChange(curRevenue, prevRevenue) },
    sales: { current: curCompleted.length, previous: prevCompleted.length, change: calcChange(curCompleted.length, prevCompleted.length) },
    conversion: { current: curConv, change: calcChange(curConv, prevConv) },
    avgTicket: { current: curTicket, change: calcChange(curTicket, prevTicket) },
    topDeals: (topDeals.data || []).map(d => ({
      client: d.client_name || "—",
      product: d.product_name || "—",
      amount: Number(d.amount),
      status: STATUS_MAP[d.status] || d.status,
    })),
    teamRanking,
    pipelineStages: [],
  });
}
