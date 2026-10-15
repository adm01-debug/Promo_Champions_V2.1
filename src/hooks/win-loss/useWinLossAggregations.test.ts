import { describe, expect, it } from 'vitest';
import { aggregateByCompetitor, aggregateBySalesperson } from './useWinLossAggregations';
import type { WLAnalysisRow } from './useWinLossData';

const row = (over: Partial<WLAnalysisRow>): WLAnalysisRow =>
  ({
    outcome: 'won',
    sale_id: 's1',
    analyzed_at: '2026-10-01T00:00:00Z',
    cycle_days: 10,
    amount: 1000,
    primary_reason: null,
    competitor: null,
    lost_stage: null,
    ...over,
  }) as WLAnalysisRow;

describe('aggregateBySalesperson (usa lib winRate)', () => {
  const salesMap = new Map([
    ['s1', 'sp-a'],
    ['s2', 'sp-a'],
    ['s3', 'sp-a'],
    ['s4', 'sp-b'],
  ]);
  const spNames = new Map([
    ['sp-a', 'Ana'],
    ['sp-b', 'Beto'],
  ]);

  it('calcula winRate = wins/(wins+losses) por vendedor', () => {
    const rows = [
      row({ sale_id: 's1', outcome: 'won' }),
      row({ sale_id: 's2', outcome: 'won' }),
      row({ sale_id: 's3', outcome: 'lost' }),
      row({ sale_id: 's4', outcome: 'lost' }),
    ];
    const stats = aggregateBySalesperson(rows, salesMap, spNames);
    const ana = stats.find(s => s.salespersonId === 'sp-a');
    const beto = stats.find(s => s.salespersonId === 'sp-b');
    expect(ana?.winRate).toBeCloseTo((2 / 3) * 100, 5);
    expect(ana?.total).toBe(3);
    expect(beto?.winRate).toBe(0);
  });

  it('vendedor sem deals decididos não aparece (sale_id sem mapa é ignorado)', () => {
    const rows = [row({ sale_id: 'desconhecido', outcome: 'won' })];
    expect(aggregateBySalesperson(rows, salesMap, spNames)).toHaveLength(0);
  });

  it('0 wins e 0 losses → winRate 0', () => {
    const rows = [row({ sale_id: 's4', outcome: 'lost' })];
    const stats = aggregateBySalesperson(rows, salesMap, spNames);
    expect(stats[0]?.winRate).toBe(0);
  });
});

describe('aggregateByCompetitor (usa lib winRate)', () => {
  it('winRateVs reflete wins/(total) do confronto', () => {
    const rows = [
      row({ competitor: 'ACME', outcome: 'won' }),
      row({ competitor: 'ACME', outcome: 'lost' }),
      row({ competitor: 'ACME', outcome: 'lost' }),
    ];
    const stats = aggregateByCompetitor(rows);
    expect(stats[0]?.winRateVs).toBeCloseTo((1 / 3) * 100, 5);
    expect(stats[0]?.encounters).toBe(3);
    expect(stats[0]?.losses).toBe(2);
  });

  it('ignora rows sem competitor', () => {
    const rows = [row({ competitor: null }), row({ competitor: 'X' })];
    const stats = aggregateByCompetitor(rows);
    expect(stats).toHaveLength(1);
    expect(stats[0]?.name).toBe('X');
  });
});
