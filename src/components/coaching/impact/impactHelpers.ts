export function formatDelta(value: number, suffix = "%"): string {
  if (!Number.isFinite(value) || value === 0) return `0${suffix}`;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${suffix}`;
}

export function deltaToneClass(value: number): string {
  if (!Number.isFinite(value) || Math.abs(value) < 0.5) return "text-muted-foreground";
  return value > 0 ? "text-success" : "text-destructive";
}

export function deltaBgClass(value: number): string {
  if (!Number.isFinite(value) || Math.abs(value) < 0.5) return "bg-muted/40";
  return value > 0 ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30";
}

export function heatmapShade(value: number): string {
  // Map -50..+50 to opacity scale
  const clamped = Math.max(-50, Math.min(50, value));
  const opacity = Math.abs(clamped) / 50;
  if (clamped >= 0) return `hsl(var(--success) / ${0.1 + opacity * 0.7})`;
  return `hsl(var(--destructive) / ${0.1 + opacity * 0.7})`;
}

export function formatCurrency(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
}

export function estimateMonthlyROI(roi: number, sessions: number): number {
  if (!sessions) return 0;
  return roi / Math.max(1, sessions / 4); // approx weekly to monthly
}
