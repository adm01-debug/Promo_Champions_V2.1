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

export const MARKUP_TIER_LABELS: Record<MarkupTier, string> = {
  excellent: 'Excelente (≥ 40%)',
  healthy: 'Saudável (20–40%)',
  critical: 'Crítico (< 20%)',
  unknown: 'Sem custo',
};

export interface MarkupSummary {
  /** Média aritmética dos markups conhecidos (null se nenhum). */
  average: number | null;
  /** Mediana dos markups conhecidos (null se nenhum). */
  median: number | null;
  /** Quantidade de itens por faixa. */
  counts: Record<MarkupTier, number>;
  /** Total de itens avaliados. */
  total: number;
  /** Itens com markup calculável. */
  withCost: number;
}

/**
 * Agrega uma lista de markups (percentuais) em métricas de rentabilidade.
 * Valores null/undefined/NaN contam como "unknown" e não entram na média/mediana.
 */
export function summarizeMarkup(
  values: ReadonlyArray<number | null | undefined>,
): MarkupSummary {
  const counts: Record<MarkupTier, number> = {
    excellent: 0,
    healthy: 0,
    critical: 0,
    unknown: 0,
  };
  const known: number[] = [];

  for (const value of values) {
    const { tier } = classifyMarkup(value);
    counts[tier] += 1;
    if (tier !== 'unknown' && typeof value === 'number') known.push(value);
  }

  let average: number | null = null;
  let median: number | null = null;

  if (known.length > 0) {
    const sum = known.reduce((acc, v) => acc + v, 0);
    average = Math.round((sum / known.length) * 100) / 100;

    const sorted = [...known].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const raw =
      sorted.length % 2 === 0 ? ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2 : (sorted[mid] as number);
    median = Math.round(raw * 100) / 100;
  }

  return {
    average,
    median,
    counts,
    total: values.length,
    withCost: known.length,
  };
}

