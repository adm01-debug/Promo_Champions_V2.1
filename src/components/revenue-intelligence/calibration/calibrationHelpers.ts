export function calcConfidence(sampleSize: number, target = 30): number {
  return Math.min(sampleSize / target, 1);
}

export function blendProbability(baseline: number, winRate: number, confidence: number): number {
  const w = baseline * 0.3 + winRate * 0.7 * confidence + baseline * (1 - confidence) * 0.7;
  return Math.max(0, Math.min(100, Math.round(w * 100) / 100));
}

export function colorByDelta(delta: number): string {
  if (delta >= 10) return "text-emerald-500";
  if (delta >= 3) return "text-emerald-400";
  if (delta <= -10) return "text-destructive";
  if (delta <= -3) return "text-orange-500";
  return "text-muted-foreground";
}

export function confidenceLabel(confidence: number): "alta" | "média" | "baixa" {
  if (confidence >= 0.7) return "alta";
  if (confidence >= 0.35) return "média";
  return "baixa";
}

export function confidenceBadgeVariant(confidence: number): "default" | "secondary" | "outline" {
  if (confidence >= 0.7) return "default";
  if (confidence >= 0.35) return "secondary";
  return "outline";
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}
