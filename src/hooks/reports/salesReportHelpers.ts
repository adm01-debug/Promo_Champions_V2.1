import { format, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export type ReportPeriod = "weekly" | "monthly";

export interface SaleRow {
  id: string;
  amount: number | null;
  status: string | null;
  created_at: string;
  client_name: string | null;
  product_name: string | null;
  salesperson_id: string | null;
}

export interface SalespersonRow {
  id: string;
  name: string;
}

export interface ReportKpis {
  revenue: number;
  salesCount: number;
  avgTicket: number;
  conversionRate: number;
}

export interface ReportKpiDelta extends ReportKpis {
  revenueDelta: number;
  salesCountDelta: number;
  avgTicketDelta: number;
  conversionRateDelta: number;
}

export interface ChartPoint {
  name: string;
  value: number;
}

export interface StatusSlice {
  name: string;
  value: number;
  key: string;
}

export interface TopProduct {
  name: string;
  value: number;
}

export interface TeamRanking {
  name: string;
  value: number;
}

export interface TopDeal {
  client: string;
  product: string;
  salesperson: string;
  amount: number;
  status: string;
}

export interface SalesReportData {
  current: ReportKpiDelta;
  revenueSeries: ChartPoint[];
  topProducts: TopProduct[];
  statusBreakdown: StatusSlice[];
  teamRanking: TeamRanking[];
  topDeals: TopDeal[];
  isEmpty: boolean;
}

export const STATUS_LABEL: Record<string, string> = {
  completed: "Concluídas",
  pending: "Pendentes",
  cancelled: "Canceladas",
  qualified: "Qualificadas",
  proposal: "Em proposta",
  negotiation: "Em negociação",
};

const calcDelta = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export function buildKpis(sales: SaleRow[]): ReportKpis {
  const completed = sales.filter((s) => s.status === "completed");
  const revenue = completed.reduce((acc, s) => acc + Number(s.amount ?? 0), 0);
  const salesCount = completed.length;
  const avgTicket = salesCount > 0 ? revenue / salesCount : 0;
  const conversionRate = sales.length > 0 ? (salesCount / sales.length) * 100 : 0;
  return { revenue, salesCount, avgTicket, conversionRate };
}

export function buildKpiDeltas(current: ReportKpis, previous: ReportKpis): ReportKpiDelta {
  return {
    ...current,
    revenueDelta: calcDelta(current.revenue, previous.revenue),
    salesCountDelta: calcDelta(current.salesCount, previous.salesCount),
    avgTicketDelta: calcDelta(current.avgTicket, previous.avgTicket),
    conversionRateDelta: calcDelta(current.conversionRate, previous.conversionRate),
  };
}

export function buildRevenueSeries(
  sales: SaleRow[],
  period: ReportPeriod,
  start: Date,
  end: Date
): ChartPoint[] {
  const completed = sales.filter((s) => s.status === "completed");
  if (period === "weekly") {
    const days = eachDayOfInterval({ start, end });
    return days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      const total = completed
        .filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === key)
        .reduce((acc, s) => acc + Number(s.amount ?? 0), 0);
      return { name: format(d, "EEE", { locale: ptBR }), value: total };
    });
  }
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  return weeks.map((w, i) => {
    const ws = startOfWeek(w, { weekStartsOn: 1 });
    const we = endOfWeek(w, { weekStartsOn: 1 });
    const total = completed
      .filter((s) => isWithinInterval(new Date(s.created_at), { start: ws, end: we }))
      .reduce((acc, s) => acc + Number(s.amount ?? 0), 0);
    return { name: `Sem ${i + 1}`, value: total };
  });
}

export function buildTopProducts(sales: SaleRow[], topN = 5): TopProduct[] {
  const map = new Map<string, number>();
  sales
    .filter((s) => s.status === "completed")
    .forEach((s) => {
      const name = s.product_name ?? "—";
      map.set(name, (map.get(name) ?? 0) + Number(s.amount ?? 0));
    });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

export function buildStatusBreakdown(sales: SaleRow[]): StatusSlice[] {
  const map = new Map<string, number>();
  sales.forEach((s) => {
    const k = s.status ?? "outros";
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([key, value]) => ({
    key,
    name: STATUS_LABEL[key] ?? key,
    value,
  }));
}

export function buildTeamRanking(
  sales: SaleRow[],
  salespeople: SalespersonRow[],
  topN = 5
): TeamRanking[] {
  const map = new Map<string, number>();
  sales
    .filter((s) => s.status === "completed" && s.salesperson_id)
    .forEach((s) => {
      const id = s.salesperson_id as string;
      map.set(id, (map.get(id) ?? 0) + Number(s.amount ?? 0));
    });
  return Array.from(map.entries())
    .map(([id, value]) => ({
      name: salespeople.find((p) => p.id === id)?.name ?? "Desconhecido",
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

export function buildTopDeals(
  sales: SaleRow[],
  salespeople: SalespersonRow[],
  topN = 10
): TopDeal[] {
  return [...sales]
    .sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0))
    .slice(0, topN)
    .map((s) => ({
      client: s.client_name ?? "—",
      product: s.product_name ?? "—",
      salesperson: salespeople.find((p) => p.id === s.salesperson_id)?.name ?? "—",
      amount: Number(s.amount ?? 0),
      status: STATUS_LABEL[s.status ?? ""] ?? s.status ?? "—",
    }));
}

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
