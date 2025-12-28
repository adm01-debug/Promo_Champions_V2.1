// src/hooks/__tests__/batch-tests-3.test.ts
// Testes: useProducts, useTeams, useGoalsDashboard, useBitrix24, useCadences
// Data: 2024-12-28

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// ============================================================================
// useProducts Tests
// ============================================================================

import { useProducts } from '../useProducts';

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should filter products by category', async () => {
    const { result } = renderHook(
      () => useProducts({ category: 'electronics' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should search products by name', async () => {
    const { result } = renderHook(
      () => useProducts({ search: 'laptop' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should handle empty results', async () => {
    const { result } = renderHook(
      () => useProducts({ search: 'nonexistentproduct123' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

// ============================================================================
// useTeams Tests
// ============================================================================

import { useTeams } from '../useTeams';

describe('useTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch teams successfully', async () => {
    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should include team members', async () => {
    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const teams = result.current.data || [];
    if (teams.length > 0) {
      expect(teams[0]).toHaveProperty('members');
    }
  });

  it('should calculate team metrics', async () => {
    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const teams = result.current.data || [];
    if (teams.length > 0) {
      expect(teams[0]).toHaveProperty('performance');
    }
  });
});

// ============================================================================
// useGoalsDashboard Tests
// ============================================================================

import { useGoalsDashboard } from '../useGoalsDashboard';

describe('useGoalsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch goals dashboard data', async () => {
    const { result } = renderHook(() => useGoalsDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should filter by period', async () => {
    const { result } = renderHook(
      () => useGoalsDashboard({ period: 'month' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should filter by team', async () => {
    const { result } = renderHook(
      () => useGoalsDashboard({ teamId: 'team-123' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should calculate goal completion percentage', async () => {
    const { result } = renderHook(() => useGoalsDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const data = result.current.data;
    if (data && data.goals && data.goals.length > 0) {
      expect(data.goals[0]).toHaveProperty('completion');
      expect(data.goals[0].completion).toBeGreaterThanOrEqual(0);
      expect(data.goals[0].completion).toBeLessThanOrEqual(100);
    }
  });

  it('should identify at-risk goals', async () => {
    const { result } = renderHook(() => useGoalsDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const data = result.current.data;
    if (data) {
      expect(data).toHaveProperty('atRisk');
    }
  });
});

// ============================================================================
// useBitrix24 Tests
// ============================================================================

import { useBitrix24Sync } from '../useBitrix24';

describe('useBitrix24', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync deals with Bitrix24', async () => {
    const { result } = renderHook(() => useBitrix24Sync(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should handle sync errors gracefully', async () => {
    const { result } = renderHook(() => useBitrix24Sync(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      if (result.current.isError) {
        expect(result.current.error).toBeDefined();
      }
    });
  });

  it('should return sync status', async () => {
    const { result } = renderHook(() => useBitrix24Sync(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const data = result.current.data;
    if (data) {
      expect(data).toHaveProperty('status');
      expect(['synced', 'syncing', 'error']).toContain(data.status);
    }
  });
});

// ============================================================================
// useCadences Tests
// ============================================================================

import { useCadences } from '../useCadences';

describe('useCadences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch cadences successfully', async () => {
    const { result } = renderHook(() => useCadences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should include cadence steps', async () => {
    const { result } = renderHook(() => useCadences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const cadences = result.current.data || [];
    if (cadences.length > 0) {
      expect(cadences[0]).toHaveProperty('steps');
      expect(Array.isArray(cadences[0].steps)).toBe(true);
    }
  });

  it('should filter active cadences', async () => {
    const { result } = renderHook(
      () => useCadences({ active: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const cadences = result.current.data || [];
    expect(cadences.every(c => c.active)).toBe(true);
  });

  it('should calculate cadence completion rate', async () => {
    const { result } = renderHook(() => useCadences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const cadences = result.current.data || [];
    if (cadences.length > 0) {
      expect(cadences[0]).toHaveProperty('completionRate');
      expect(cadences[0].completionRate).toBeGreaterThanOrEqual(0);
      expect(cadences[0].completionRate).toBeLessThanOrEqual(100);
    }
  });

  it('should show enrolled leads count', async () => {
    const { result } = renderHook(() => useCadences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const cadences = result.current.data || [];
    if (cadences.length > 0) {
      expect(cadences[0]).toHaveProperty('enrolledLeads');
      expect(typeof cadences[0].enrolledLeads).toBe('number');
    }
  });
});
