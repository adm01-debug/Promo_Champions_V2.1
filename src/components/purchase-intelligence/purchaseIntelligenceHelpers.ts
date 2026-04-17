import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const MONTH_LABELS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const DOW_LABELS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const CONTACT_WINDOW_LABELS: Record<string, string> = {
  morning: "Manhã (9h-12h)",
  afternoon: "Tarde (13h-17h)",
  evening: "Noite (18h-20h)",
};

/** Returns HSL string opacity based on revenue intensity */
export function intensityColor(revenue: number, max: number): string {
  if (max <= 0 || revenue <= 0) return "hsl(var(--muted) / 0.3)";
  const ratio = Math.min(1, revenue / max);
  // primary token with variable alpha (0.15 -> 0.95)
  const alpha = 0.15 + ratio * 0.8;
  return `hsl(var(--primary) / ${alpha.toFixed(2)})`;
}

/** Risk score → semantic color token */
export function riskColor(score: number): string {
  if (score >= 70) return "hsl(var(--destructive))";
  if (score >= 40) return "hsl(var(--warning, var(--primary)))";
  return "hsl(var(--success, var(--primary)))";
}

export function riskLabel(score: number): string {
  if (score >= 70) return "Crítico";
  if (score >= 40) return "Atenção";
  return "Saudável";
}

export function formatBRL(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "R$ 0";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatDatePt(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  try {
    return format(date, "dd MMM yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function monthLabelFromIso(iso: string): string {
  try {
    return format(parseISO(iso), "MMM/yy", { locale: ptBR });
  } catch {
    return iso;
  }
}
