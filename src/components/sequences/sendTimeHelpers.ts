const DOW_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function formatWindow(dow: number, hour: number): string {
  const d = DOW_PT[dow] ?? '?';
  const h = String(hour).padStart(2, '0');
  return `${d} ${h}:00`;
}

export function formatOptimizedFor(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return formatWindow(d.getDay(), d.getHours());
}

/**
 * Converte o score da janela em largura de barra, de 0 a 100, proporcional a
 * melhor janela da lista. Comparacao e sempre relativa ao proprio contato: o
 * score absoluto nao tem escala fixa, so serve para ordenar.
 */
export function normalizeScore(score: number, max: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return 0;
  const pct = (score / max) * 100;
  return Math.max(0, Math.min(100, pct));
}
