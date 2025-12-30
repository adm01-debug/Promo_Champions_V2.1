// src/hooks/__tests__/useLeadRouting.test.ts
// Testes: useLeadRouting
// Data: 2024-12-28

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useLeadRouting, 
  calculateRoutingScore, 
  findBestMatch 
} from '../useLeadRouting';
import type { SalesRepCapacity, RoutingRule } from '../useLeadRouting';

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

describe('useLeadRouting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch routing rules successfully', async () => {
    const { result } = renderHook(() => useLeadRouting(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should filter only active rules', async () => {
    const { result } = renderHook(() => useLeadRouting(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const rules = result.current.data || [];
    expect(rules.every(rule => rule.active)).toBe(true);
  });
});

describe('calculateRoutingScore', () => {
  const mockLead = { score: 75, source: 'website', territory: 'SP' };
  const mockSalesRep: SalesRepCapacity = {
    userId: '1',
    userName: 'Test Rep',
    currentLoad: 5,
    maxCapacity: 10,
    availableSlots: 5,
    skills: ['product-a', 'product-b'],
    territories: ['SP', 'RJ'],
    performanceScore: 85,
    averageCloseRate: 0.65,
  };

  it('should calculate round robin score correctly', () => {
    const score = calculateRoutingScore(mockLead, mockSalesRep, 'round_robin');
    expect(score).toBe(50); // (10-5)/10 * 100
  });

  it('should calculate weighted score correctly', () => {
    const score = calculateRoutingScore(mockLead, mockSalesRep, 'weighted');
    expect(score).toBe(42.5); // 85 * (5/10)
  });

  it('should calculate availability score correctly', () => {
    const score = calculateRoutingScore(mockLead, mockSalesRep, 'availability');
    expect(score).toBe(50); // (5/10) * 100
  });

  it('should give 100 for territory match', () => {
    const score = calculateRoutingScore(mockLead, mockSalesRep, 'territory');
    expect(score).toBe(100);
  });

  it('should give 0 for territory mismatch', () => {
    const leadNoTerritory = { ...mockLead, territory: 'MG' };
    const score = calculateRoutingScore(leadNoTerritory, mockSalesRep, 'territory');
    expect(score).toBe(0);
  });

  it('should clamp scores between 0 and 100', () => {
    const overloadedRep = { ...mockSalesRep, currentLoad: 15 };
    const score = calculateRoutingScore(mockLead, overloadedRep, 'round_robin');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('findBestMatch', () => {
  const mockLead = { score: 80, source: 'website', territory: 'SP' };
  
  const mockReps: SalesRepCapacity[] = [
    {
      userId: '1',
      userName: 'Rep 1',
      currentLoad: 3,
      maxCapacity: 10,
      availableSlots: 7,
      skills: [],
      territories: ['SP'],
      performanceScore: 90,
      averageCloseRate: 0.7,
    },
    {
      userId: '2',
      userName: 'Rep 2',
      currentLoad: 8,
      maxCapacity: 10,
      availableSlots: 2,
      skills: [],
      territories: ['RJ'],
      performanceScore: 85,
      averageCloseRate: 0.65,
    },
  ];

  const mockRules: RoutingRule[] = [
    {
      id: '1',
      criteria: 'availability',
      weight: 1,
      priority: 1,
      active: true,
    },
  ];

  it('should find best match based on availability', () => {
    const match = findBestMatch(mockLead, mockReps, mockRules);
    
    expect(match).toBeDefined();
    expect(match?.assignedTo).toBe('1'); // Rep 1 tem mais slots
  });

  it('should return null if no reps available', () => {
    const match = findBestMatch(mockLead, [], mockRules);
    expect(match).toBeNull();
  });

  it('should return null if no rules active', () => {
    const match = findBestMatch(mockLead, mockReps, []);
    expect(match).toBeNull();
  });

  it('should skip reps with no available slots', () => {
    const busyReps = mockReps.map(rep => ({ ...rep, availableSlots: 0 }));
    const match = findBestMatch(mockLead, busyReps, mockRules);
    expect(match).toBeNull();
  });

  it('should apply rule weight correctly', () => {
    const weightedRules: RoutingRule[] = [
      {
        id: '1',
        criteria: 'availability',
        weight: 2, // peso dobrado
        priority: 1,
        active: true,
      },
    ];

    const match = findBestMatch(mockLead, mockReps, weightedRules);
    expect(match).toBeDefined();
    expect(match?.score).toBeGreaterThan(0);
  });

  it('should include assignment details', () => {
    const match = findBestMatch(mockLead, mockReps, mockRules);
    
    expect(match).toBeDefined();
    expect(match?.status).toBe('assigned');
    expect(match?.criteria).toBe('availability');
    expect(match?.reason).toContain('Assigned via');
  });
});
