/**
 * Closing Time Analysis Tests
 * Tests: stage duration, sorting by pipeline order, aggregation
 */
import { describe, it, expect } from 'vitest';

describe('Closing Time - Stage Duration Calculation', () => {
  const calculateDays = (enteredAt: string, exitedAt: string): number => {
    const entered = new Date(enteredAt);
    const exited = new Date(exitedAt);
    return Math.max(1, Math.ceil((exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)));
  };

  it('should calculate days between dates', () => {
    expect(calculateDays('2024-01-01T00:00:00Z', '2024-01-08T00:00:00Z')).toBe(7);
  });

  it('should return minimum 1 day', () => {
    expect(calculateDays('2024-01-01T00:00:00Z', '2024-01-01T12:00:00Z')).toBe(1);
  });

  it('should ceil fractional days', () => {
    expect(calculateDays('2024-01-01T00:00:00Z', '2024-01-02T06:00:00Z')).toBe(2);
  });
});

describe('Closing Time - Stage Average', () => {
  const calculateAverage = (records: { days: number }[]): number => {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, r) => sum + r.days, 0);
    return Math.round(total / records.length);
  };

  it('should average durations', () => {
    expect(calculateAverage([{ days: 5 }, { days: 10 }, { days: 15 }])).toBe(10);
  });

  it('should handle single record', () => {
    expect(calculateAverage([{ days: 7 }])).toBe(7);
  });

  it('should handle empty records', () => {
    expect(calculateAverage([])).toBe(0);
  });

  it('should round to integer', () => {
    expect(calculateAverage([{ days: 3 }, { days: 4 }])).toBe(4); // 3.5 → 4
  });
});

describe('Closing Time - Pipeline Stage Ordering', () => {
  const stageOrder = ['lead', 'prospecting', 'qualified', 'proposal', 'negotiation', 'won', 'closed'];

  const sortByStage = (stages: { stage: string }[]) => {
    return [...stages].sort((a, b) => {
      const aIdx = stageOrder.indexOf(a.stage.toLowerCase());
      const bIdx = stageOrder.indexOf(b.stage.toLowerCase());
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
  };

  it('should sort stages in pipeline order', () => {
    const stages = [
      { stage: 'proposal' },
      { stage: 'lead' },
      { stage: 'negotiation' },
    ];
    const sorted = sortByStage(stages);
    expect(sorted[0].stage).toBe('lead');
    expect(sorted[1].stage).toBe('proposal');
    expect(sorted[2].stage).toBe('negotiation');
  });

  it('should put unknown stages last', () => {
    const stages = [
      { stage: 'lead' },
      { stage: 'custom_stage' },
      { stage: 'qualified' },
    ];
    const sorted = sortByStage(stages);
    expect(sorted[2].stage).toBe('custom_stage');
  });

  it('should have 7 defined stages', () => {
    expect(stageOrder).toHaveLength(7);
  });
});

describe('Closing Time - Stage Aggregation', () => {
  const aggregateStages = (records: { stage: string; days: number }[]) => {
    const map = new Map<string, { totalDays: number; count: number }>();
    records.forEach(r => {
      const existing = map.get(r.stage) || { totalDays: 0, count: 0 };
      map.set(r.stage, { totalDays: existing.totalDays + r.days, count: existing.count + 1 });
    });
    return Array.from(map.entries()).map(([stage, { totalDays, count }]) => ({
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      avgDays: Math.round(totalDays / count),
      deals: count,
    }));
  };

  it('should group by stage', () => {
    const records = [
      { stage: 'lead', days: 5 },
      { stage: 'lead', days: 10 },
      { stage: 'proposal', days: 7 },
    ];
    const result = aggregateStages(records);
    expect(result).toHaveLength(2);
    const lead = result.find(r => r.stage === 'Lead');
    expect(lead?.avgDays).toBe(8);
    expect(lead?.deals).toBe(2);
  });

  it('should capitalize stage names', () => {
    const result = aggregateStages([{ stage: 'qualified', days: 5 }]);
    expect(result[0].stage).toBe('Qualified');
  });

  it('should handle empty data', () => {
    expect(aggregateStages([])).toHaveLength(0);
  });
});
