export type VelocityStatus = "ahead" | "on_track" | "slow" | "stalled";
export type ConfidenceTier = "low" | "medium" | "high";

export const velocityStatusLabel = (s: VelocityStatus): string => ({
  ahead: "Adiantado",
  on_track: "No ritmo",
  slow: "Lento",
  stalled: "Parado",
}[s]);

export const velocityStatusColor = (s: VelocityStatus): string => ({
  ahead: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  on_track: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  slow: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  stalled: "bg-destructive/15 text-destructive border-destructive/30",
}[s]);

export const velocityRingColor = (s: VelocityStatus): string => ({
  ahead: "stroke-emerald-500",
  on_track: "stroke-sky-500",
  slow: "stroke-amber-500",
  stalled: "stroke-destructive",
}[s]);

export const confidenceTierLabel = (t: ConfidenceTier): string => ({
  low: "Baixa",
  medium: "Média",
  high: "Alta",
}[t]);

export const formatDaysRemaining = (days?: number | null): string => {
  if (days == null) return "—";
  if (days <= 0) return "Hoje";
  if (days === 1) return "1 dia";
  if (days < 30) return `${days} dias`;
  const months = Math.round(days / 30);
  return months === 1 ? "~1 mês" : `~${months} meses`;
};

export const formatCloseDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};
