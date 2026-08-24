import { format, startOfMonth, differenceInCalendarMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface CohortRow {
  cohortKey: string;        // "2024-01"
  cohortLabel: string;      // "Jan/24"
  cohortDate: Date;
  cohortSize: number;
  retention: number[];      // % per period (M0..Mn)
  absolute: number[];       // raw counts/values per period
}

export interface ClientLite { id: string; created_at: string; }
export interface SaleLite { client_name: string; created_at: string; final_value?: number | null; }

/**
 * Pure cohort matrix builder.
 * Groups clients by month-of-creation and calculates retention against sales activity per relative month.
 */
export function buildCohortMatrix(
  clients: ClientLite[],
  sales: SaleLite[],
  clientNameToId: Map<string, string>,
  periods: number,
  metric: "orders" | "revenue" = "orders",
  now: Date = new Date()
): CohortRow[] {
  if (clients.length === 0) return [];

  // group clients by cohort month
  const cohortMap = new Map<string, { date: Date; clientIds: Set<string> }>();
  for (const c of clients) {
    const d = startOfMonth(new Date(c.created_at));
    const key = format(d, "yyyy-MM");
    if (!cohortMap.has(key)) cohortMap.set(key, { date: d, clientIds: new Set() });
    cohortMap.get(key)!.clientIds.add(c.id);
  }

  // index sales by clientId + relative-month-index per cohort base would be expensive;
  // instead, build per-client (id) → [{monthKey, value}]
  const clientActivity = new Map<string, Map<string, number>>();
  for (const s of sales) {
    const id = clientNameToId.get(s.client_name);
    if (!id) continue;
    const monthKey = format(startOfMonth(new Date(s.created_at)), "yyyy-MM");
    let inner = clientActivity.get(id);
    if (!inner) { inner = new Map(); clientActivity.set(id, inner); }
    const inc = metric === "revenue" ? Number(s.final_value ?? 0) : 1;
    inner.set(monthKey, (inner.get(monthKey) ?? 0) + inc);
  }

  const rows: CohortRow[] = [];
  const sortedKeys = [...cohortMap.keys()].sort();

  for (const key of sortedKeys) {
    const { date, clientIds } = cohortMap.get(key)!;
    const maxPeriods = Math.min(periods, differenceInCalendarMonths(now, date) + 1);
    if (maxPeriods <= 0) continue;

    const absolute: number[] = [];
    const retention: number[] = [];
    const cohortSize = clientIds.size;

    for (let i = 0; i < maxPeriods; i++) {
      const target = format(
        startOfMonth(new Date(date.getFullYear(), date.getMonth() + i, 1)),
        "yyyy-MM"
      );
      let activeClients = 0;
      let totalValue = 0;
      clientIds.forEach((id) => {
        const v = clientActivity.get(id)?.get(target);
        if (v && v > 0) {
          activeClients++;
          totalValue += v;
        }
      });
      absolute.push(metric === "revenue" ? Math.round(totalValue) : activeClients);
      retention.push(cohortSize > 0 ? Math.round((activeClients / cohortSize) * 1000) / 10 : 0);
    }

    rows.push({
      cohortKey: key,
      cohortLabel: format(date, "MMM/yy", { locale: ptBR }),
      cohortDate: date,
      cohortSize,
      retention,
      absolute,
    });
  }

  return rows;
}

/** Interpolates primary opacity for heatmap cells. value in 0..100, max in 0..100. */
export function getHeatmapColor(value: number, max: number = 100): {
  background: string;
  text: string;
} {
  if (value <= 0) return { background: "hsl(var(--muted) / 0.3)", text: "hsl(var(--muted-foreground))" };
  const ratio = Math.min(value / Math.max(max, 1), 1);
  const opacity = 0.08 + ratio * 0.85;
  const text = ratio > 0.55 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))";
  return { background: `hsl(var(--primary) / ${opacity.toFixed(2)})`, text };
}

export function formatCohortLabel(date: Date): string {
  return format(date, "MMM/yy", { locale: ptBR });
}

/** Average retention across cohorts at a given relative month index, ignoring nulls. */
export function avgRetentionAt(rows: CohortRow[], periodIdx: number): number {
  const values = rows.map((r) => r.retention[periodIdx]).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
