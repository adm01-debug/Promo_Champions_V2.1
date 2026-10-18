import type { RiskLevel } from '@/hooks/revenue/useQuotaAttainment';

import { formatBRL } from '@/lib/money';

export const RISK_LABEL: Record<RiskLevel, string> = {
  safe: 'Seguro',
  on_track: 'No ritmo',
  at_risk: 'Em risco',
  critical: 'Crítico',
};

export const RISK_BADGE: Record<
  RiskLevel,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  safe: 'default',
  on_track: 'secondary',
  at_risk: 'outline',
  critical: 'destructive',
};

export function formatCurrency(v: number): string {
  return formatBRL(v);
}

export function formatPace(v: number): string {
  return `${formatCurrency(v)}/dia`;
}

export function formatPct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}
