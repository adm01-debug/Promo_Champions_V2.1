/** Formatadores compartilhados da Race Arena. */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const COMPACT = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Formata valor em BRL sem decimais (ex: R$ 12.345). */
export function fmtCurrency(n: number): string {
  return BRL.format(Number.isFinite(n) ? n : 0);
}

/** Formata valor compacto (ex: 12,3 mi). Útil para UI estreita. */
export function fmtCompact(n: number): string {
  return COMPACT.format(Number.isFinite(n) ? n : 0);
}
