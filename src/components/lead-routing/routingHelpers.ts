export const STRATEGY_LABELS: Record<string, string> = {
  best_match: "Melhor Match (IA)",
  round_robin: "Round-Robin",
  weighted: "Ponderado",
  top_performer: "Top Performer",
  specific_user: "Vendedor Específico",
};

export const STRATEGY_TONES: Record<string, string> = {
  best_match: "bg-primary/15 text-primary border-primary/30",
  round_robin: "bg-status-info/15 text-status-info border-status-info/30",
  weighted: "bg-status-warning/15 text-status-warning border-status-warning/30",
  top_performer: "bg-accent/20 text-accent-foreground border-accent/30",
  specific_user: "bg-muted text-muted-foreground",
};

export const formatStrategy = (s: string) => STRATEGY_LABELS[s] ?? s;
export const strategyTone = (s: string) =>
  STRATEGY_TONES[s] ?? "bg-muted text-muted-foreground";

export const formatPercent = (n: number) =>
  `${(n * 100).toFixed(1)}%`;

export const capacityHealth = (current: number, max: number) => {
  if (max <= 0) return { label: "Sem limite", tone: "text-muted-foreground", pct: 0 };
  const pct = Math.min(100, Math.round((current / max) * 100));
  if (pct >= 90) return { label: "Saturado", tone: "text-status-error", pct };
  if (pct >= 70) return { label: "Alto", tone: "text-status-warning", pct };
  if (pct >= 40) return { label: "Saudável", tone: "text-status-success", pct };
  return { label: "Disponível", tone: "text-primary", pct };
};
