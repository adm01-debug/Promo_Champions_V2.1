/**
 * Funções puras de agregação das métricas de supressão de e-mail.
 * Mantidas fora do hook para permitir testes determinísticos.
 */

export interface OptOutRecordLite {
  /** ISO timestamp de criação do registro. */
  created_at: string;
  /** Origem do descadastro (unsubscribe_link, hard_bounce, spam_complaint, manual...). */
  source: string;
}

export interface SourceBreakdownItem {
  source: string;
  count: number;
  /** Percentual sobre o total da janela (0-100, 1 casa decimal). */
  pct: number;
}

export interface OptOutDailyPoint {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  count: number;
}

export interface OptOutMetrics {
  total: number;
  last7: number;
  last30: number;
  /** Variação percentual dos últimos 7 dias contra os 7 anteriores (null quando base = 0). */
  deltaPct: number | null;
  breakdown: SourceBreakdownItem[];
  daily: OptOutDailyPoint[];
}

const DAY_MS = 86_400_000;

/** Normaliza um timestamp para a chave de dia UTC (YYYY-MM-DD). */
export function toDayKey(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  return new Date(t).toISOString().slice(0, 10);
}

/** Rótulo legível (PT-BR) para cada origem conhecida. */
export function sourceLabel(source: string): string {
  switch (source) {
    case 'unsubscribe_link':
      return 'Link de descadastro';
    case 'one_click':
      return 'Um clique (RFC 8058)';
    case 'hard_bounce':
      return 'Hard bounce';
    case 'soft_bounce':
      return 'Soft bounce';
    case 'spam_complaint':
      return 'Reclamação de spam';
    case 'manual':
      return 'Manual (admin)';
    case 'provider_unsubscribe':
      return 'Descadastro no provedor';
    default:
      return source || 'Desconhecida';
  }
}

/**
 * Agrega registros de supressão em métricas de janela móvel.
 * @param records Registros já filtrados pela janela desejada.
 * @param now Referência temporal (injetável para testes).
 * @param windowDays Tamanho da série diária retornada.
 */
export function aggregateOptOutMetrics(
  records: readonly OptOutRecordLite[],
  now: number = Date.now(),
  windowDays = 30,
): OptOutMetrics {
  const bySource = new Map<string, number>();
  const byDay = new Map<string, number>();
  let last7 = 0;
  let last30 = 0;
  let prev7 = 0;

  for (const r of records) {
    const t = Date.parse(r.created_at);
    if (Number.isNaN(t)) continue;
    const age = now - t;

    const src = r.source || 'unknown';
    bySource.set(src, (bySource.get(src) ?? 0) + 1);

    const day = toDayKey(r.created_at);
    if (day) byDay.set(day, (byDay.get(day) ?? 0) + 1);

    if (age >= 0 && age < 7 * DAY_MS) last7 += 1;
    else if (age >= 7 * DAY_MS && age < 14 * DAY_MS) prev7 += 1;
    if (age >= 0 && age < 30 * DAY_MS) last30 += 1;
  }

  const total = records.length;
  const breakdown: SourceBreakdownItem[] = [...bySource.entries()]
    .map(([source, count]) => ({
      source,
      count,
      pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));

  const daily: OptOutDailyPoint[] = [];
  for (let i = windowDays - 1; i >= 0; i -= 1) {
    const key = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    daily.push({ date: key, count: byDay.get(key) ?? 0 });
  }

  const deltaPct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 1000) / 10 : null;

  return { total, last7, last30, deltaPct, breakdown, daily };
}
