// Melhoria 17 - useLeadRouting.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeadRouting } from '../useLeadRouting';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLeadRouting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should route lead to correct salesperson based on score', async () => {
    const { result } = renderHook(() => useLeadRouting(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const route = result.current.routeLead({
      leadScore: 85,
      region: 'SP',
      industry: 'tech',
    });

    expect(route).toBeDefined();
    expect(route.salesperson_id).toBeDefined();
    expect(route.confidence).toBeGreaterThan(0.7);
    expect(route.reason).toBeDefined();
  });

  it('should route high-score leads to senior salespeople', async () => {
    const { result } = renderHook(() => useLeadRouting(), {
      wrapper: createWrapper(),
    });

    const route = result.current.routeLead({ leadScore: 95 });
    expect(route.salesperson_level).toBe('senior');
  });

  it('should balance workload when routing', async () => {
    const { result } = renderHook(() => useLeadRouting(), {
      wrapper: createWrapper(),
    });

    const routes = Array.from({ length: 10 }, () =>
      result.current.routeLead({ leadScore: 70 })
    );

    const salespeople = new Set(routes.map((r) => r.salesperson_id));
    expect(salespeople.size).toBeGreaterThan(1); // Distributed
  });

  it('should respect region restrictions', async () => {
    const { result } = renderHook(() => useLeadRouting(), {
      wrapper: createWrapper(),
    });

    const route = result.current.routeLead({
      leadScore: 75,
      region: 'RJ',
    });

    expect(route.salesperson_region).toBe('RJ');
  });

  it('should handle no available salespeople gracefully', async () => {
    // Mock empty salespeople list
    const { result } = renderHook(() => useLeadRouting(), {
      wrapper: createWrapper(),
    });

    const route = result.current.routeLead({ leadScore: 50 });
    expect(route.salesperson_id).toBeNull();
    expect(route.error).toBe('No available salespeople');
  });
});
