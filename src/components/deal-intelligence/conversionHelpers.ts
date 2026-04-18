export const STAGE_LABELS_PT: Record<string, string> = {
  lead: "Lead",
  prospecting: "Prospecção",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  closed_won: "Ganho",
  closed_lost: "Perdido",
};

export const stageLabel = (stage: string) =>
  STAGE_LABELS_PT[stage?.toLowerCase()] ?? stage;

export type Severity = "low" | "medium" | "high" | "critical";

export const severityLabel: Record<Severity, string> = {
  low: "Saudável",
  medium: "Atenção",
  high: "Crítico",
  critical: "Urgente",
};

export const severityClasses: Record<Severity, string> = {
  low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  critical: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

export const severityFillHsl: Record<Severity, string> = {
  low: "hsl(var(--success))",
  medium: "hsl(var(--warning))",
  high: "hsl(25 95% 55%)",
  critical: "hsl(var(--destructive))",
};

export const impactLabel: Record<"low" | "medium" | "high", string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

export const formatPct = (n: number) => `${(Number(n) || 0).toFixed(1)}%`;
export const formatDays = (n: number) => `${(Number(n) || 0).toFixed(1)}d`;
