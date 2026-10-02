/**
 * Formatação monetária canônica (BRL, pt-BR). Único ponto de verdade —
 * não criar formatBRL/formatCurrency locais (ver scripts/check-data-layer
 * e ADR-010). `formatBRL` usa estilo currency (prefixo "R$"); para
 * prefixo custom ("R$ {x}"), usar formatNumberBR.
 */
const brlFormatters = new Map<number, Intl.NumberFormat>();

const brlFormatter = (decimals: number) => {
  let f = brlFormatters.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    brlFormatters.set(decimals, f);
  }
  return f;
};

const compactFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

export function formatBRL(
  value: number | string | null | undefined,
  options: { decimals?: number; fallback?: string } = {}
): string {
  // Convenção do produto: dashboards/listas exibem valores inteiros (R$ 1.235).
  const { decimals = 0, fallback } = options;
  const n = toNumber(value);
  if (n === null) return fallback ?? brlFormatter(decimals).format(0);
  return brlFormatter(decimals).format(n);
}

/** Notação compacta: R$ 1,2 mi / R$ 300 mil. */
export function formatBRLCompact(
  value: number | string | null | undefined,
  fallback = '—'
): string {
  const n = toNumber(value);
  if (n === null) return fallback;
  return compactFormatter.format(n);
}

/** Número pt-BR sem prefixo de moeda (para `R$ {x}` custom). */
export function formatNumberBR(
  value: number | string | null | undefined,
  fallback = '0'
): string {
  const n = toNumber(value);
  if (n === null) return fallback;
  return numberFormatter.format(n);
}
