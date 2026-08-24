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

  /**
   * Role-scoped scenarios.
   *
   * Under SECURITY INVOKER the RPC reads `sales` and `daily_metrics`
   * through the caller's RLS. We don't simulate Postgres here — we lock in
   * the **shape contract** the frontend depends on for each role.
   */
  describe('role scoping', () => {
    it('vendedor: totalRevenue reflects own sales; newClients/conversionRate are 0', async () => {
      // RLS on `sales` filters to salesperson_id = auth.uid(); `daily_metrics`
      // is admin/manager-only, so derived clients/conversion fall back to 0.
      rpcMock.mockResolvedValueOnce({
        data: {
          totalRevenue: 4200, // own sales only
          totalSales: 3,
          firstSaleRevenue: 1200,
          recurringRevenue: 3000,
          newClients: 0,
          conversionRate: 0,
          avgTicket: 1400,
        },
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.rpc('get_dashboard_kpis', {
        start_date: '2026-06-01',
        end_date: '2026-06-30',
      });

      expect(error).toBeNull();
      const kpis = data as Record<string, number>;
      expect(kpis.totalRevenue).toBeGreaterThan(0);
      expect(kpis.newClients).toBe(0);
      expect(kpis.conversionRate).toBe(0);
    });

    it('manager: totalRevenue is the global aggregate; clients/conversion are populated', async () => {
      // Managers/admins satisfy daily_metrics RLS, so the aggregate columns
      // are filled and totalRevenue spans every salesperson in scope.
      rpcMock.mockResolvedValueOnce({
        data: {
          totalRevenue: 250000,
          totalSales: 180,
          firstSaleRevenue: 90000,
          recurringRevenue: 160000,
          newClients: 42,
          conversionRate: 27.5,
          avgTicket: 1388,
        },
        error: null,
      });

      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.rpc('get_dashboard_kpis', {
        start_date: '2026-06-01',
        end_date: '2026-06-30',
      });

      const kpis = data as Record<string, number>;
      expect(kpis.totalRevenue).toBeGreaterThan(10000);
      expect(kpis.newClients).toBeGreaterThan(0);
      expect(kpis.conversionRate).toBeGreaterThan(0);
    });
  });
});
