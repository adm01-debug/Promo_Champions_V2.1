/**
 * Helpers para markup (margem sobre custo).
 *
 * markup_pct = ((amount - total_cost) / total_cost) * 100
 * margin_amount = amount - total_cost
 *
 * Regras de exibição:
 *   >= 40%   → excelente (success)
 *   20 – 40% → saudável (warning)
 *   <  20%   → crítico  (destructive)
 *   sem custo → neutro   (muted)
 */

export type MarkupTier = 'excellent' | 'healthy' | 'critical' | 'unknown';

export interface MarkupInfo {
  tier: MarkupTier;
  label: string;
  className: string;
  value: number | null;
}

const TIER_STYLES: Record<MarkupTier, { label: string; className: string }> = {
  excellent: {
    label: 'Excelente',
    className: 'bg-success/15 text-success border-success/30',
  },
  healthy: {
    label: 'Saudável',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  critical: {
    label: 'Crítico',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  unknown: {
    label: 'Sem custo',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

/**
 * Classifica um markup_pct pré-calculado (vindo do banco).
 * Aceita null/undefined/NaN, retornando "unknown".
 */
export function classifyMarkup(markupPct: number | null | undefined): MarkupInfo {
  if (markupPct === null || markupPct === undefined || Number.isNaN(markupPct)) {
    return { tier: 'unknown', ...TIER_STYLES.unknown, value: null };
  }

  let tier: MarkupTier;
  if (markupPct >= 40) tier = 'excellent';
  else if (markupPct >= 20) tier = 'healthy';
  else tier = 'critical';

  return { tier, ...TIER_STYLES[tier], value: markupPct };
}

/**
 * Calcula markup a partir de amount + total_cost.
 * Espelha a coluna gerada do Postgres (arredondada em 2 casas).
 * total_cost <= 0 ou nulo → retorna null (evita divisão por zero).
 */
export function computeMarkupPct(
  amount: number | null | undefined,
  totalCost: number | null | undefined,
): number | null {
  if (amount === null || amount === undefined) return null;
  if (totalCost === null || totalCost === undefined) return null;
  if (totalCost <= 0) return null;
  const raw = ((amount - totalCost) / totalCost) * 100;
  return Math.round(raw * 100) / 100;
}

export function computeMarginAmount(
  amount: number | null | undefined,
  totalCost: number | null | undefined,
): number | null {
  if (amount === null || amount === undefined) return null;
  if (totalCost === null || totalCost === undefined) return null;
  return Math.round((amount - totalCost) * 100) / 100;
}

/**
 * Formata percentual em pt-BR com sufixo "%".
 */
export function formatMarkupPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export const COST_SOURCE_LABELS: Record<string, string> = {
  promo_gifts: 'Promo Gifts',
  manual: 'Manual',
  product_default: 'Padrão do produto',
};
