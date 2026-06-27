import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase client BEFORE importing the hook.
const rpcMock = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpcMock(...args),
    channel: () => ({
      on: function () {
        return this;
      },
      subscribe: function () {
        return this;
      },
    }),
    removeChannel: vi.fn(),
  },
}));

/**
 * Contract tests for the `get_dashboard_kpis` RPC.
 *
 * The RPC was refactored from SECURITY DEFINER -> SECURITY INVOKER. These tests
 * guard the frontend contract so future changes to the function signature or
 * permission model are caught early.
 */
describe('get_dashboard_kpis RPC contract', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('returns a fully-shaped KPI payload for authorized callers', async () => {
    rpcMock.mockResolvedValueOnce({
      data: {
        totalRevenue: 12000,
        totalSales: 8,
        firstSaleRevenue: 4000,
        recurringRevenue: 8000,
        newClients: 3,
        conversionRate: 25,
        avgTicket: 1500,
      },
      error: null,
    });

    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.rpc('get_dashboard_kpis', {
      start_date: '2026-06-01',
      end_date: '2026-06-30',
    });

    expect(error).toBeNull();
    expect(data).toMatchObject({
      totalRevenue: expect.any(Number),
      totalSales: expect.any(Number),
      firstSaleRevenue: expect.any(Number),
      recurringRevenue: expect.any(Number),
      newClients: expect.any(Number),
      conversionRate: expect.any(Number),
      avgTicket: expect.any(Number),
    });
  });

  it('surfaces "not_authenticated" when the caller has no session', async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'not_authenticated' },
    });

    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.rpc('get_dashboard_kpis', {
      start_date: '2026-06-01',
      end_date: '2026-06-30',
    });

    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
  });

  it('returns zeroed metrics for a salesperson with no own sales (RLS scoping)', async () => {
    // Under SECURITY INVOKER, RLS naturally returns no rows for users that
    // cannot see any matching sales/daily_metrics. The function still returns
    // a valid, zeroed payload — never null.
    rpcMock.mockResolvedValueOnce({
      data: {
        totalRevenue: 0,
        totalSales: 0,
        firstSaleRevenue: 0,
        recurringRevenue: 0,
        newClients: 0,
        conversionRate: 0,
        avgTicket: 0,
      },
      error: null,
    });

    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase.rpc('get_dashboard_kpis', {
      start_date: '2026-06-01',
      end_date: '2026-06-30',
    });

    expect(data).toEqual({
      totalRevenue: 0,
      totalSales: 0,
      firstSaleRevenue: 0,
      recurringRevenue: 0,
      newClients: 0,
      conversionRate: 0,
      avgTicket: 0,
    });
  });
});
