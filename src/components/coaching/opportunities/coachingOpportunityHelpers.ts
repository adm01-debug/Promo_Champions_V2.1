import type { CoachingSeverity, CoachingSkillFocus } from "@/hooks/coaching/useCoachingOpportunities";

export const SEVERITY_LABELS: Record<CoachingSeverity, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export const SEVERITY_COLOR: Record<CoachingSeverity, string> = {
  low: "hsl(var(--muted-foreground))",
  medium: "hsl(var(--info))",
  high: "hsl(var(--warning))",
  critical: "hsl(var(--destructive))",
};

export const SEVERITY_BADGE: Record<CoachingSeverity, "secondary" | "default" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

export const SEVERITY_ORDER: Record<CoachingSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const SKILL_LABELS: Record<CoachingSkillFocus, string> = {
  discovery: "Descoberta",
  qualification: "Qualificação",
  objection_handling: "Tratar Objeções",
  closing: "Fechamento",
  prospecting: "Prospecção",
  negotiation: "Negociação",
};

export const SKILL_COLORS: Record<CoachingSkillFocus, string> = {
  discovery: "hsl(var(--info))",
  qualification: "hsl(var(--primary))",
  objection_handling: "hsl(var(--warning))",
  closing: "hsl(var(--success, var(--primary)))",
  prospecting: "hsl(var(--accent))",
  negotiation: "hsl(var(--destructive))",
};

export function formatMetricValue(metric_key: string, value: number): string {
  if (metric_key === "avg_ticket") {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }
  if (metric_key === "stage_duration") return `${value.toFixed(1)}d`;
  if (metric_key === "activities_per_day") return value.toFixed(1);
  return `${value.toFixed(1)}%`;
}

export function formatGap(gap_pct: number): string {
  const sign = gap_pct >= 0 ? "-" : "+";
  return `${sign}${Math.abs(gap_pct).toFixed(0)}%`;
}
