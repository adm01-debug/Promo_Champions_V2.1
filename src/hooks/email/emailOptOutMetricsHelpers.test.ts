import { describe, expect, it } from 'vitest';
import {
  aggregateOptOutMetrics,
  sourceLabel,
  toDayKey,
} from '@/hooks/email/emailOptOutMetricsHelpers';

const NOW = Date.parse('2026-07-26T12:00:00.000Z');
const DAY = 86_400_000;
const iso = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString();

describe('aggregateOptOutMetrics', () => {
  it('retorna estrutura vazia coerente sem registros', () => {
    const m = aggregateOptOutMetrics([], NOW);
    expect(m.total).toBe(0);
    expect(m.last7).toBe(0);
    expect(m.deltaPct).toBeNull();
    expect(m.breakdown).toEqual([]);
    expect(m.daily).toHaveLength(30);
    expect(m.daily.every((d) => d.count === 0)).toBe(true);
  });

  it('conta janelas de 7 e 30 dias corretamente', () => {
    const m = aggregateOptOutMetrics(
      [
        { created_at: iso(1), source: 'hard_bounce' },
        { created_at: iso(6.9), source: 'hard_bounce' },
        { created_at: iso(8), source: 'manual' },
        { created_at: iso(29), source: 'manual' },
        { created_at: iso(40), source: 'manual' },
      ],
      NOW,
    );
    expect(m.total).toBe(5);
    expect(m.last7).toBe(2);
    expect(m.last30).toBe(4);
  });

  it('calcula delta percentual contra os 7 dias anteriores', () => {
    const m = aggregateOptOutMetrics(
      [
        { created_at: iso(1), source: 'a' },
        { created_at: iso(2), source: 'a' },
        { created_at: iso(3), source: 'a' },
        { created_at: iso(9), source: 'a' },
        { created_at: iso(10), source: 'a' },
      ],
      NOW,
    );
    expect(m.last7).toBe(3);
    expect(m.deltaPct).toBe(50);
  });

  it('ordena breakdown por volume e calcula percentuais', () => {
    const m = aggregateOptOutMetrics(
      [
        { created_at: iso(1), source: 'spam_complaint' },
        { created_at: iso(1), source: 'unsubscribe_link' },
        { created_at: iso(2), source: 'unsubscribe_link' },
        { created_at: iso(3), source: 'unsubscribe_link' },
      ],
      NOW,
    );
    expect(m.breakdown[0]).toEqual({ source: 'unsubscribe_link', count: 3, pct: 75 });
    expect(m.breakdown[1]).toEqual({ source: 'spam_complaint', count: 1, pct: 25 });
  });

  it('ignora timestamps inválidos sem quebrar', () => {
    const m = aggregateOptOutMetrics(
      [
        { created_at: 'não-é-data', source: 'manual' },
        { created_at: iso(1), source: 'manual' },
      ],
      NOW,
    );
    expect(m.last7).toBe(1);
    expect(m.total).toBe(2);
  });

  it('normaliza origem vazia como unknown', () => {
    const m = aggregateOptOutMetrics([{ created_at: iso(1), source: '' }], NOW);
    expect(m.breakdown[0].source).toBe('unknown');
  });

  it('série diária termina no dia atual e é crescente no tempo', () => {
    const m = aggregateOptOutMetrics([{ created_at: iso(0), source: 'a' }], NOW);
    expect(m.daily[m.daily.length - 1].date).toBe('2026-07-26');
    expect(m.daily[m.daily.length - 1].count).toBe(1);
    const dates = m.daily.map((d) => d.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it('respeita windowDays customizado', () => {
    const m = aggregateOptOutMetrics([], NOW, 7);
    expect(m.daily).toHaveLength(7);
  });

  it('suporta volume alto sem degradar contagem', () => {
    const rows = Array.from({ length: 5000 }, (_, i) => ({
      created_at: iso(i % 60),
      source: i % 2 === 0 ? 'hard_bounce' : 'manual',
    }));
    const m = aggregateOptOutMetrics(rows, NOW);
    expect(m.total).toBe(5000);
    expect(m.breakdown.reduce((s, b) => s + b.count, 0)).toBe(5000);
  });
});

describe('toDayKey / sourceLabel', () => {
  it('extrai a chave de dia UTC', () => {
    expect(toDayKey('2026-07-26T23:59:59.000Z')).toBe('2026-07-26');
    expect(toDayKey('inválido')).toBe('');
  });

  it('traduz origens conhecidas e faz fallback', () => {
    expect(sourceLabel('hard_bounce')).toBe('Hard bounce');
    expect(sourceLabel('one_click')).toBe('Um clique (RFC 8058)');
    expect(sourceLabel('')).toBe('Desconhecida');
    expect(sourceLabel('custom_x')).toBe('custom_x');
  });
});
