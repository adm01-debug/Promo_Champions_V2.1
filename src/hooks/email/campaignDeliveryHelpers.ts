/**
 * Helpers puros para monitoramento de latência de entrega de campanhas de e-mail.
 * Isolados da camada de dados para permitir testes determinísticos.
 */

/** Linha bruta retornada pela RPC `get_campaign_delivery_stats`. */
export interface CampaignDeliveryStatRow {
  job_id: string;
  prompt: string;
  status: string;
  created_at: string;
  target_count: number;
  sent_count: number;
  failed_count: number;
  pending_count: number;
  first_sent_at: string | null;
  last_sent_at: string | null;
  p50_latency_seconds: number;
  p95_latency_seconds: number;
  max_latency_seconds: number;
  throughput_per_minute: number;
}

/** Classificação de saúde da entrega de uma campanha. */
export type DeliveryHealth = 'ok' | 'lento' | 'travado' | 'falhando';

/** Limiares de classificação (segundos / percentuais). */
export const DELIVERY_THRESHOLDS = {
  /** p95 acima disso indica fila lenta. */
  slowP95Seconds: 900,
  /** Sem envio há mais tempo que isso, com pendentes, indica campanha travada. */
  stalledSeconds: 1800,
  /** Percentual de falhas acima disso indica problema de entrega. */
  failureRatePercent: 10,
} as const;

/** Converte com segurança um valor desconhecido em número finito. */
export function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Normaliza uma linha da RPC, protegendo contra nulos e strings numéricas. */
export function normalizeDeliveryRow(raw: Partial<CampaignDeliveryStatRow>): CampaignDeliveryStatRow {
  return {
    job_id: String(raw.job_id ?? ''),
    prompt: String(raw.prompt ?? ''),
    status: String(raw.status ?? 'draft'),
    created_at: String(raw.created_at ?? ''),
    target_count: toFiniteNumber(raw.target_count),
    sent_count: toFiniteNumber(raw.sent_count),
    failed_count: toFiniteNumber(raw.failed_count),
    pending_count: toFiniteNumber(raw.pending_count),
    first_sent_at: raw.first_sent_at ?? null,
    last_sent_at: raw.last_sent_at ?? null,
    p50_latency_seconds: toFiniteNumber(raw.p50_latency_seconds),
    p95_latency_seconds: toFiniteNumber(raw.p95_latency_seconds),
    max_latency_seconds: toFiniteNumber(raw.max_latency_seconds),
    throughput_per_minute: toFiniteNumber(raw.throughput_per_minute),
  };
}

/** Percentual de falhas sobre o total processado (enviados + falhas). */
export function failureRate(row: CampaignDeliveryStatRow): number {
  const processed = row.sent_count + row.failed_count;
  if (processed <= 0) return 0;
  return Math.round((row.failed_count * 10000) / processed) / 100;
}

/** Percentual concluído sobre o alvo (ou sobre o total conhecido, se o alvo for zero). */
export function completionRate(row: CampaignDeliveryStatRow): number {
  const total =
    row.target_count > 0
      ? row.target_count
      : row.sent_count + row.failed_count + row.pending_count;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((row.sent_count * 10000) / total) / 100);
}

/**
 * Classifica a saúde da entrega.
 * Ordem de precedência: falhando > travado > lento > ok.
 */
export function classifyDelivery(
  row: CampaignDeliveryStatRow,
  now: Date = new Date(),
): DeliveryHealth {
  if (failureRate(row) > DELIVERY_THRESHOLDS.failureRatePercent) return 'falhando';

  if (row.pending_count > 0) {
    const reference = row.last_sent_at ?? row.created_at;
    const ts = reference ? Date.parse(reference) : NaN;
    if (Number.isFinite(ts)) {
      const idleSeconds = (now.getTime() - ts) / 1000;
      if (idleSeconds > DELIVERY_THRESHOLDS.stalledSeconds) return 'travado';
    }
  }

  if (row.p95_latency_seconds > DELIVERY_THRESHOLDS.slowP95Seconds) return 'lento';
  return 'ok';
}

/** Formata uma duração em segundos de forma compacta em pt-BR. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(toFiniteNumber(seconds)));
  if (s < 60) return `${s}s`;
  const minutes = Math.floor(s / 60);
  if (minutes < 60) return `${minutes}min ${s % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}min`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

/** Resumo agregado exibido no topo do card. */
export interface DeliverySummary {
  campaigns: number;
  sent: number;
  failed: number;
  pending: number;
  worstP95Seconds: number;
  avgThroughputPerMinute: number;
  unhealthy: number;
}

/** Agrega as linhas em um resumo global. */
export function summarizeDelivery(
  rows: CampaignDeliveryStatRow[],
  now: Date = new Date(),
): DeliverySummary {
  const withThroughput = rows.filter((r) => r.throughput_per_minute > 0);
  return {
    campaigns: rows.length,
    sent: rows.reduce((acc, r) => acc + r.sent_count, 0),
    failed: rows.reduce((acc, r) => acc + r.failed_count, 0),
    pending: rows.reduce((acc, r) => acc + r.pending_count, 0),
    worstP95Seconds: rows.reduce((acc, r) => Math.max(acc, r.p95_latency_seconds), 0),
    avgThroughputPerMinute:
      withThroughput.length > 0
        ? Math.round(
            (withThroughput.reduce((acc, r) => acc + r.throughput_per_minute, 0) /
              withThroughput.length) *
              100,
          ) / 100
        : 0,
    unhealthy: rows.filter((r) => classifyDelivery(r, now) !== 'ok').length,
  };
}
