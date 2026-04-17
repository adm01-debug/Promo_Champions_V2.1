export interface NLQToolDataset {
  tool: string;
  args: Record<string, unknown>;
  rows: Record<string, unknown>[];
  summary: Record<string, unknown>;
}

export interface NLQResponse {
  answer: string;
  data: NLQToolDataset[];
  tool_calls: { tool: string; args: Record<string, unknown>; summary: Record<string, unknown> }[];
  period: { start: string; end: string } | null;
}

export const SUGGESTED_QUESTIONS = [
  "Quanto vendi em março?",
  "Minha taxa de conversão essa semana",
  "Top 5 clientes do trimestre",
  "Quantas atividades fiz nos últimos 7 dias",
  "Receita por categoria este mês",
  "Pipeline aberto agora",
] as const;

export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatPeriodLabel(period: NLQResponse["period"]): string | null {
  if (!period) return null;
  try {
    const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    return `${fmt.format(new Date(period.start))} → ${fmt.format(new Date(period.end))}`;
  } catch { return null; }
}

export type ChartKind = "bar" | "line" | "none";

export function decideChartKind(dataset?: NLQToolDataset): ChartKind {
  if (!dataset || dataset.rows.length < 2) return "none";
  const first = dataset.rows[0] ?? {};
  if ("period" in first) return "line";
  if ("category" in first || "salesperson_name" in first || "stage" in first || "activity_type" in first || "client_name" in first) return "bar";
  return "none";
}

export function pickChartKeys(dataset: NLQToolDataset): { xKey: string; yKey: string } {
  const first = dataset.rows[0] ?? {};
  const xKey =
    ("period" in first && "period") ||
    ("category" in first && "category") ||
    ("salesperson_name" in first && "salesperson_name") ||
    ("stage" in first && "stage") ||
    ("activity_type" in first && "activity_type") ||
    ("client_name" in first && "client_name") || "label";
  const yKey =
    ("revenue" in first && "revenue") ||
    ("value" in first && "value") ||
    ("count" in first && "count") || "value";
  return { xKey: String(xKey), yKey: String(yKey) };
}
