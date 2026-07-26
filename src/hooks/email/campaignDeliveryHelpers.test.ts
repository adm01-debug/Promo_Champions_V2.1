import { describe, expect, it } from 'vitest';

import {
  classifyDelivery,
  completionRate,
  failureRate,
  formatDuration,
  normalizeDeliveryRow,
  summarizeDelivery,
  toFiniteNumber,
  type CampaignDeliveryStatRow,
} from './campaignDeliveryHelpers';

const NOW = new Date('2026-07-26T12:00:00.000Z');

function row(overrides: Partial<CampaignDeliveryStatRow> = {}): CampaignDeliveryStatRow {
  return normalizeDeliveryRow({
    job_id: 'job-1',
    prompt: 'Campanha',
    status: 'completed',
    created_at: '2026-07-26T11:00:00.000Z',
    target_count: 100,
    sent_count: 100,
    failed_count: 0,
    pending_count: 0,
    first_sent_at: '2026-07-26T11:01:00.000Z',
    last_sent_at: '2026-07-26T11:55:00.000Z',
    p50_latency_seconds: 60,
    p95_latency_seconds: 120,
    max_latency_seconds: 200,
    throughput_per_minute: 40,
    ...overrides,
  });
}

describe('campaignDeliveryHelpers', () => {
  it('toFiniteNumber trata nulos, strings e NaN', () => {
    expect(toFiniteNumber('12.5')).toBe(12.5);
    expect(toFiniteNumber(null)).toBe(0);
    expect(toFiniteNumber(undefined, 7)).toBe(7);
    expect(toFiniteNumber('abc', 3)).toBe(3);
    expect(toFiniteNumber(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('normalizeDeliveryRow preenche defaults seguros', () => {
    const normalized = normalizeDeliveryRow({});
    expect(normalized.job_id).toBe('');
    expect(normalized.status).toBe('draft');
    expect(normalized.sent_count).toBe(0);
    expect(normalized.last_sent_at).toBeNull();
  });

  it('failureRate calcula sobre o total processado', () => {
    expect(failureRate(row({ sent_count: 90, failed_count: 10 }))).toBe(10);
    expect(failureRate(row({ sent_count: 0, failed_count: 0 }))).toBe(0);
    expect(failureRate(row({ sent_count: 0, failed_count: 5 }))).toBe(100);
  });

  it('completionRate usa alvo e cai para o total conhecido', () => {
    expect(completionRate(row({ target_count: 200, sent_count: 50 }))).toBe(25);
    expect(
      completionRate(row({ target_count: 0, sent_count: 5, failed_count: 5, pending_count: 0 })),
    ).toBe(50);
    expect(completionRate(row({ target_count: 10, sent_count: 50 }))).toBe(100);
  });

  it('classifyDelivery marca falhando acima do limiar de erro', () => {
    expect(classifyDelivery(row({ sent_count: 80, failed_count: 20 }), NOW)).toBe('falhando');
  });

  it('classifyDelivery marca travado quando há pendentes e ociosidade longa', () => {
    const stalled = row({
      pending_count: 30,
      failed_count: 0,
      last_sent_at: '2026-07-26T10:00:00.000Z',
    });
    expect(classifyDelivery(stalled, NOW)).toBe('travado');
  });

  it('classifyDelivery marca lento pelo p95', () => {
    expect(classifyDelivery(row({ p95_latency_seconds: 1200 }), NOW)).toBe('lento');
  });

  it('classifyDelivery retorna ok em cenário saudável', () => {
    expect(classifyDelivery(row(), NOW)).toBe('ok');
  });

  it('classifyDelivery ignora datas inválidas sem quebrar', () => {
    const invalid = row({ pending_count: 5, last_sent_at: 'data-invalida', created_at: 'x' });
    expect(classifyDelivery(invalid, NOW)).toBe('ok');
  });

  it('formatDuration cobre segundos, minutos, horas e dias', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(125)).toBe('2min 5s');
    expect(formatDuration(3700)).toBe('1h 1min');
    expect(formatDuration(90000)).toBe('1d 1h');
    expect(formatDuration(-10)).toBe('0s');
  });

  it('summarizeDelivery agrega totais e campanhas problemáticas', () => {
    const summary = summarizeDelivery(
      [
        row(),
        row({ job_id: 'job-2', sent_count: 50, failed_count: 20, throughput_per_minute: 20 }),
        row({ job_id: 'job-3', sent_count: 0, pending_count: 10, throughput_per_minute: 0 }),
      ],
      NOW,
    );
    expect(summary.campaigns).toBe(3);
    expect(summary.sent).toBe(150);
    expect(summary.failed).toBe(20);
    expect(summary.pending).toBe(10);
    expect(summary.avgThroughputPerMinute).toBe(30);
    expect(summary.unhealthy).toBeGreaterThanOrEqual(1);
  });

  it('summarizeDelivery lida com lista vazia', () => {
    const summary = summarizeDelivery([], NOW);
    expect(summary).toEqual({
      campaigns: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      worstP95Seconds: 0,
      avgThroughputPerMinute: 0,
      unhealthy: 0,
    });
  });
});
