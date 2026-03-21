/**
 * Funnel Analysis Logic Tests
 * Tests: stage counting, conversion rates, drop-off detection, overall metrics
 */
import { describe, it, expect } from 'vitest';

describe('Funnel Analysis - Conversion Rate', () => {
  const calculateConversionRate = (currentCount: number, previousCount: number): number => {
    if (previousCount <= 0) return 0;
    return Math.round(((currentCount / previousCount) * 100) * 10) / 10;
  };

  it('should calculate percentage', () => {
    expect(calculateConversionRate(50, 100)).toBe(50);
  });

  it('should handle 100% conversion', () => {
    expect(calculateConversionRate(100, 100)).toBe(100);
  });

  it('should handle zero previous count', () => {
    expect(calculateConversionRate(10, 0)).toBe(0);
  });

  it('should handle zero current count', () => {
    expect(calculateConversionRate(0, 100)).toBe(0);
  });

  it('should round to 1 decimal', () => {
    expect(calculateConversionRate(33, 100)).toBe(33);
    expect(calculateConversionRate(1, 3)).toBe(33.3);
  });
});

describe('Funnel Analysis - Drop-off Rate', () => {
  const calculateDropOff = (conversionRate: number): number => {
    return Math.round(Math.max(0, 100 - conversionRate) * 10) / 10;
  };

  it('should be inverse of conversion', () => {
    expect(calculateDropOff(70)).toBe(30);
    expect(calculateDropOff(100)).toBe(0);
  });

  it('should not go below 0', () => {
    expect(calculateDropOff(120)).toBe(0);
  });

  it('should be 100 for 0% conversion', () => {
    expect(calculateDropOff(0)).toBe(100);
  });
});

describe('Funnel Analysis - Stage Order', () => {
  const STAGE_ORDER = ['lead', 'prospecting', 'qualified', 'proposal', 'negotiation'];

  it('should have 5 funnel stages', () => {
    expect(STAGE_ORDER).toHaveLength(5);
  });

  it('should start with lead', () => {
    expect(STAGE_ORDER[0]).toBe('lead');
  });

  it('should end with negotiation', () => {
    expect(STAGE_ORDER[STAGE_ORDER.length - 1]).toBe('negotiation');
  });

  it('should capitalize stage names', () => {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    expect(capitalize('lead')).toBe('Lead');
    expect(capitalize('proposal')).toBe('Proposal');
  });
});

describe('Funnel Analysis - Overall Metrics', () => {
  const calculateOverallConversion = (wonCount: number, totalDeals: number): number => {
    if (totalDeals <= 0) return 0;
    return Math.round(((wonCount / totalDeals) * 100) * 10) / 10;
  };

  const calculateAvgDealSize = (totalValue: number, wonCount: number): number => {
    if (wonCount <= 0) return 0;
    return Math.round(totalValue / wonCount);
  };

  it('should calculate overall conversion rate', () => {
    expect(calculateOverallConversion(10, 100)).toBe(10);
    expect(calculateOverallConversion(0, 50)).toBe(0);
  });

  it('should calculate average deal size', () => {
    expect(calculateAvgDealSize(100000, 10)).toBe(10000);
    expect(calculateAvgDealSize(0, 0)).toBe(0);
  });
});

describe('Funnel Analysis - Top Drop-off Detection', () => {
  const findTopDropOff = (stages: { stage: string; dropOffRate: number }[]): string => {
    if (stages.length === 0) return 'N/A';
    return stages.reduce((max, s) => s.dropOffRate > max.dropOffRate ? s : max, stages[0]).stage;
  };

  it('should find highest drop-off stage', () => {
    const stages = [
      { stage: 'Lead', dropOffRate: 30 },
      { stage: 'Proposal', dropOffRate: 60 },
      { stage: 'Negotiation', dropOffRate: 20 },
    ];
    expect(findTopDropOff(stages)).toBe('Proposal');
  });

  it('should return N/A for empty', () => {
    expect(findTopDropOff([])).toBe('N/A');
  });

  it('should return first if equal', () => {
    const stages = [
      { stage: 'A', dropOffRate: 50 },
      { stage: 'B', dropOffRate: 50 },
    ];
    expect(findTopDropOff(stages)).toBe('A');
  });
});
