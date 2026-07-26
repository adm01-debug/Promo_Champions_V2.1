import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from 'date-fns';
import { isWonSaleStatus } from '@/constants';
import { ptBR } from 'date-fns/locale';

export type ReportPeriod = 'weekly' | 'monthly';

export interface SaleRow {
  id: string;
  amount: number | null;
  status: string | null;
  created_at: string;
  client_name: string | null;
  product_name: string | null;
  salesperson_id: string | null;
  markup_pct?: number | null;
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
  /** Markup % médio das vendas ganhas com custo conhecido. 0 quando não há custo. */
  avgMarkup: number;
  /** Quantidade de vendas ganhas com markup calculável (base do avgMarkup). */
  markupSample: number;
}

export interface ReportKpiDelta extends ReportKpis {
  revenueDelta: number;
  salesCountDelta: number;
  avgTicketDelta: number;
  conversionRateDelta: number;
  avgMarkupDelta: number;
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
  markupPct: number | null;
}

/** Ponto da série de markup: média do bucket + tamanho da amostra. */
export interface MarkupPoint {
  name: string;
  /** Markup % médio do bucket. `null` quando não há venda ganha com custo conhecido. */
  value: number | null;
  sample: number;
}

/** Linha do ranking de rentabilidade (markup médio) por vendedor. */
export interface MarkupRankingRow {
  salespersonId: string;
  name: string;
  avgMarkup: number;
  sample: number;
  revenue: number;
}

export interface SalesReportData {
  current: ReportKpiDelta;
  revenueSeries: ChartPoint[];
  markupSeries: MarkupPoint[];
  markupRanking: MarkupRankingRow[];
  topProducts: TopProduct[];
  statusBreakdown: StatusSlice[];
  teamRanking: TeamRanking[];
  topDeals: TopDeal[];
  isEmpty: boolean;
}


export const STATUS_LABEL: Record<string, string> = {
  completed: 'Concluídas',
  pending: 'Pendentes',
  cancelled: 'Canceladas',
  qualified: 'Qualificadas',
  proposal: 'Em proposta',
  negotiation: 'Em negociação',
};

const calcDelta = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export function buildKpis(sales: SaleRow[]): ReportKpis {
  const completed = sales.filter(s => isWonSaleStatus(s.status));
  const revenue = completed.reduce((acc, s) => acc + Number(s.amount ?? 0), 0);
  const salesCount = completed.length;
  const avgTicket = salesCount > 0 ? revenue / salesCount : 0;
  const conversionRate = sales.length > 0 ? (salesCount / sales.length) * 100 : 0;

  // Markup médio considera apenas vendas ganhas com custo conhecido (markup_pct != null).
  const withMarkup = completed
    .map(s => (s.markup_pct === null || s.markup_pct === undefined ? null : Number(s.markup_pct)))
    .filter((v): v is number => v !== null && Number.isFinite(v));
  const markupSample = withMarkup.length;
  const avgMarkup = markupSample > 0 ? withMarkup.reduce((a, b) => a + b, 0) / markupSample : 0;

  return { revenue, salesCount, avgTicket, conversionRate, avgMarkup, markupSample };
}

export function buildKpiDeltas(current: ReportKpis, previous: ReportKpis): ReportKpiDelta {
  return {
    ...current,
    revenueDelta: calcDelta(current.revenue, previous.revenue),
    salesCountDelta: calcDelta(current.salesCount, previous.salesCount),
    avgTicketDelta: calcDelta(current.avgTicket, previous.avgTicket),
    conversionRateDelta: calcDelta(current.conversionRate, previous.conversionRate),
    avgMarkupDelta: calcDelta(current.avgMarkup, previous.avgMarkup),
  };
}

export function buildRevenueSeries(
  sales: SaleRow[],
  period: ReportPeriod,
  start: Date,
  end: Date
): ChartPoint[] {
  const completed = sales.filter(s => isWonSaleStatus(s.status));
  if (period === 'weekly') {
    const days = eachDayOfInterval({ start, end });
    return days.map(d => {
      const key = format(d, 'yyyy-MM-dd');
      const total = completed
        .filter(s => format(new Date(s.created_at), 'yyyy-MM-dd') === key)
        .reduce((acc, s) => acc + Number(s.amount ?? 0), 0);
      return { name: format(d, 'EEE', { locale: ptBR }), value: total };
    });
  }
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  return weeks.map((w, i) => {
    const ws = startOfWeek(w, { weekStartsOn: 1 });
    const we = endOfWeek(w, { weekStartsOn: 1 });
    const total = completed
      .filter(s => isWithinInterval(new Date(s.created_at), { start: ws, end: we }))
      .reduce((acc, s) => acc + Number(s.amount ?? 0), 0);
    return { name: `Sem ${i + 1}`, value: total };
  });
}

export function buildTopProducts(sales: SaleRow[], topN = 5): TopProduct[] {
  const map = new Map<string, number>();
  sales
    .filter(s => isWonSaleStatus(s.status))
    .forEach(s => {
      const name = s.product_name ?? '—';
      map.set(name, (map.get(name) ?? 0) + Number(s.amount ?? 0));
    });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

export function buildStatusBreakdown(sales: SaleRow[]): StatusSlice[] {
  const map = new Map<string, number>();
  sales.forEach(s => {
    const k = s.status ?? 'outros';
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
    .filter(s => isWonSaleStatus(s.status) && s.salesperson_id)
    .forEach(s => {
      const id = s.salesperson_id as string;
      map.set(id, (map.get(id) ?? 0) + Number(s.amount ?? 0));
    });
  return Array.from(map.entries())
    .map(([id, value]) => ({
      name: salespeople.find(p => p.id === id)?.name ?? 'Desconhecido',
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

/**
 * Ranking de rentabilidade por vendedor.
 * Considera apenas vendas ganhas com custo conhecido (markup_pct != null).
 * Vendedores sem nenhuma venda com custo são omitidos (evita 0% enganoso).
 */
export function buildMarkupRanking(
  sales: SaleRow[],
  salespeople: SalespersonRow[],
  topN = 10
): MarkupRankingRow[] {
  const map = new Map<string, { sum: number; sample: number; revenue: number }>();

  sales
    .filter(
      s =>
        isWonSaleStatus(s.status) &&
        !!s.salesperson_id &&
        s.markup_pct !== null &&
        s.markup_pct !== undefined &&
        Number.isFinite(Number(s.markup_pct))
    )
    .forEach(s => {
      const id = s.salesperson_id as string;
      const acc = map.get(id) ?? { sum: 0, sample: 0, revenue: 0 };
      acc.sum += Number(s.markup_pct);
      acc.sample += 1;
      acc.revenue += Number(s.amount ?? 0);
      map.set(id, acc);
    });

  return Array.from(map.entries())
    .map(([id, acc]) => ({
      salespersonId: id,
      name: salespeople.find(p => p.id === id)?.name ?? 'Desconhecido',
      avgMarkup: acc.sum / acc.sample,
      sample: acc.sample,
      revenue: acc.revenue,
    }))
    .sort((a, b) => b.avgMarkup - a.avgMarkup)
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
    .map(s => ({
      client: s.client_name ?? '—',
      product: s.product_name ?? '—',
      salesperson: salespeople.find(p => p.id === s.salesperson_id)?.name ?? '—',
      amount: Number(s.amount ?? 0),
      status: STATUS_LABEL[s.status ?? ''] ?? s.status ?? '—',
      markupPct:
        s.markup_pct === null || s.markup_pct === undefined || Number.isNaN(Number(s.markup_pct))
          ? null
          : Number(s.markup_pct),
    }));
}

export const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Série temporal do markup médio (apenas vendas ganhas com custo conhecido).
 * Buckets diários (semanal) ou semanais (mensal), espelhando buildRevenueSeries.
 * Buckets sem amostra retornam `value: null` para o Recharts criar gap em vez de zero enganoso.
 */
export function buildMarkupSeries(
  sales: SaleRow[],
  period: ReportPeriod,
  start: Date,
  end: Date
): MarkupPoint[] {
  const known = sales.filter(
    s =>
      isWonSaleStatus(s.status) &&
      s.markup_pct !== null &&
      s.markup_pct !== undefined &&
      Number.isFinite(Number(s.markup_pct))
  );

  const avg = (rows: SaleRow[]): { value: number | null; sample: number } => {
    if (rows.length === 0) return { value: null, sample: 0 };
    const sum = rows.reduce((acc, s) => acc + Number(s.markup_pct), 0);
    return { value: Math.round((sum / rows.length) * 100) / 100, sample: rows.length };
  };

  if (period === 'weekly') {
    return eachDayOfInterval({ start, end }).map(d => {
      const key = format(d, 'yyyy-MM-dd');
      const rows = known.filter(s => format(new Date(s.created_at), 'yyyy-MM-dd') === key);
      return { name: format(d, 'EEE', { locale: ptBR }), ...avg(rows) };
    });
  }

  return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((w, i) => {
    const ws = startOfWeek(w, { weekStartsOn: 1 });
    const we = endOfWeek(w, { weekStartsOn: 1 });
    const rows = known.filter(s => isWithinInterval(new Date(s.created_at), { start: ws, end: we }));
    return { name: `Sem ${i + 1}`, ...avg(rows) };
  });
}
