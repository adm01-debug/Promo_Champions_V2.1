import { formatBRL } from '@/lib/money';

export function colorByDelta(delta: number): string {
  if (delta >= 10) return 'text-emerald-500';
  if (delta >= 3) return 'text-emerald-400';
  if (delta <= -10) return 'text-destructive';
  if (delta <= -3) return 'text-orange-500';
  return 'text-muted-foreground';
}

export function confidenceLabel(confidence: number): 'alta' | 'média' | 'baixa' {
  if (confidence >= 0.7) return 'alta';
  if (confidence >= 0.35) return 'média';
  return 'baixa';
}

export function confidenceBadgeVariant(
  confidence: number
): 'default' | 'secondary' | 'outline' {
  if (confidence >= 0.7) return 'default';
  if (confidence >= 0.35) return 'secondary';
  return 'outline';
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatCurrency(value: number): string {
  return formatBRL(value);
}
