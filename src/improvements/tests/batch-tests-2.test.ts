// src/hooks/__tests__/useClosingTime.test.ts
// Data: 2024-12-28

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useClosingTime, 
  calculateAverageTimeByStage,
  formatDuration,
  calculateVarianceFromAverage
} from '../useClosingTime';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useClosingTime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch closing time data when dealId provided', async () => {
    const { result } = renderHook(() => useClosingTime('deal-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should not fetch when dealId is undefined', () => {
    const { result } = renderHook(() => useClosingTime(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('formatDuration', () => {
  it('should format less than 1 day', () => {
    expect(formatDuration(0.5)).toBe('< 1 dia');
  });

  it('should format 1 day', () => {
    expect(formatDuration(1)).toBe('1 dia');
  });

  it('should format multiple days', () => {
    expect(formatDuration(5)).toBe('5 dias');
  });

  it('should format weeks', () => {
    expect(formatDuration(14)).toBe('2 semanas');
  });

  it('should format months', () => {
    expect(formatDuration(60)).toBe('2 meses');
  });
});

describe('calculateVarianceFromAverage', () => {
  it('should detect faster than average', () => {
    const result = calculateVarianceFromAverage(20, 30);
    expect(result.status).toBe('faster');
    expect(result.percentage).toBeLessThan(-10);
  });

  it('should detect slower than average', () => {
    const result = calculateVarianceFromAverage(40, 30);
    expect(result.status).toBe('slower');
    expect(result.percentage).toBeGreaterThan(10);
  });

  it('should detect on-track', () => {
    const result = calculateVarianceFromAverage(30, 29);
    expect(result.status).toBe('on-track');
  });
});

// ============================================================================
// useFunnelData Tests
// ============================================================================

// src/hooks/__tests__/useFunnelData.test.ts

import { 
  useFunnelData, 
  calculateStageConversion,
  findBottleneckStage
} from '../useFunnelData';
import type { FunnelStage, FunnelMetrics } from '../useFunnelData';

describe('useFunnelData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch funnel data successfully', async () => {
    const { result } = renderHook(
      () => useFunnelData({ entityType: 'deals' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should apply filters correctly', async () => {
    const filters = {
      entityType: 'deals' as const,
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    };

    const { result } = renderHook(
      () => useFunnelData(filters),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('calculateStageConversion', () => {
  const stage1: FunnelStage = {
    id: '1',
    name: 'Lead',
    order: 1,
    count: 100,
    value: 500000,
    conversionRate: 100,
    averageTime: 2,
    color: '#3b82f6',
  };

  const stage2: FunnelStage = {
    id: '2',
    name: 'Qualified',
    order: 2,
    count: 60,
    value: 400000,
    conversionRate: 60,
    averageTime: 3,
    color: '#8b5cf6',
  };

  it('should calculate conversion rate correctly', () => {
    const rate = calculateStageConversion(stage1, stage2);
    expect(rate).toBe(60); // 60/100 * 100
  });

  it('should return 0 when fromStage has no count', () => {
    const emptyStage = { ...stage1, count: 0 };
    const rate = calculateStageConversion(emptyStage, stage2);
    expect(rate).toBe(0);
  });
});

describe('findBottleneckStage', () => {
  const mockMetrics: FunnelMetrics = {
    stages: [
      {
        id: '1',
        name: 'Lead',
        order: 1,
        count: 100,
        value: 500000,
        conversionRate: 100,
        averageTime: 2,
        color: '#3b82f6',
      },
      {
        id: '2',
        name: 'Proposal',
        order: 2,
        count: 60,
        value: 400000,
        conversionRate: 60,
        averageTime: 15, // gargalo
        color: '#8b5cf6',
      },
      {
        id: '3',
        name: 'Won',
        order: 3,
        count: 40,
        value: 300000,
        conversionRate: 40,
        averageTime: 5,
        color: '#10b981',
      },
    ],
    totalLeads: 100,
    totalValue: 500000,
    overallConversionRate: 40,
    averageDealSize: 7500,
    leakagePoints: [],
  };

  it('should identify slowest stage', () => {
    const bottleneck = findBottleneckStage(mockMetrics);
    expect(bottleneck?.name).toBe('Proposal');
    expect(bottleneck?.averageTime).toBe(15);
  });

  it('should return null for empty metrics', () => {
    const emptyMetrics = { ...mockMetrics, stages: [] };
    const bottleneck = findBottleneckStage(emptyMetrics);
    expect(bottleneck).toBeNull();
  });
});

// ============================================================================
// useABCAnalysis Tests
// ============================================================================

// src/hooks/__tests__/useABCAnalysis.test.ts

import { 
  useABCAnalysis, 
  getABCInsights,
  getCategoryColor,
  getActionRecommendations
} from '../useABCAnalysis';
import type { ABCAnalysisResult } from '../useABCAnalysis';

describe('useABCAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch ABC analysis successfully', async () => {
    const { result } = renderHook(
      () => useABCAnalysis({ entityType: 'clients' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should use custom criteria', async () => {
    const customCriteria = {
      categoryA: { min: 0, max: 70 },
      categoryB: { min: 70, max: 90 },
      categoryC: { min: 90, max: 100 },
    };

    const { result } = renderHook(
      () => useABCAnalysis({ entityType: 'products' }, customCriteria),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('getABCInsights', () => {
  const mockResult: ABCAnalysisResult = {
    items: [],
    categoryA: {
      items: [],
      totalValue: 800000,
      percentage: 80,
      count: 20,
    },
    categoryB: {
      items: [],
      totalValue: 150000,
      percentage: 15,
      count: 30,
    },
    categoryC: {
      items: [],
      totalValue: 50000,
      percentage: 5,
      count: 50,
    },
    totalValue: 1000000,
    totalItems: 100,
  };

  it('should generate insights for good concentration', () => {
    const insights = getABCInsights(mockResult);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].type).toBe('success');
  });

  it('should prioritize insights correctly', () => {
    const insights = getABCInsights(mockResult);
    const priorities = insights.map(i => i.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
  });
});

describe('getCategoryColor', () => {
  it('should return green for category A', () => {
    expect(getCategoryColor('A')).toBe('#10b981');
  });

  it('should return amber for category B', () => {
    expect(getCategoryColor('B')).toBe('#f59e0b');
  });

  it('should return red for category C', () => {
    expect(getCategoryColor('C')).toBe('#ef4444');
  });
});

describe('getActionRecommendations', () => {
  it('should provide recommendations for category A', () => {
    const recs = getActionRecommendations('A');
    expect(recs.length).toBeGreaterThan(0);
    expect(recs).toContain('Manter relacionamento próximo');
  });

  it('should provide recommendations for category B', () => {
    const recs = getActionRecommendations('B');
    expect(recs.length).toBeGreaterThan(0);
    expect(recs).toContain('Acompanhar potencial de crescimento');
  });

  it('should provide recommendations for category C', () => {
    const recs = getActionRecommendations('C');
    expect(recs.length).toBeGreaterThan(0);
    expect(recs).toContain('Avaliar viabilidade de manutenção');
  });
});
