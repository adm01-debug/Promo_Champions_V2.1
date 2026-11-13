import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

import { computeSalespersonVelocity } from './useDealAnalyticsVelocity';

const sale = (
  salesperson_id: string | null,
  status: string,
  days: number
): {
  salesperson_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
} => {
  const created = new Date('2026-01-01T00:00:00Z');
  const updated = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    salesperson_id,
    status,
    created_at: created.toISOString(),
    updated_at: updated.toISOString(),
  };
};

describe('computeSalespersonVelocity', () => {
  it('calcula média de dias até o ganho por vendedor, do mais rápido ao mais lento', () => {
    const result = computeSalespersonVelocity([
      sale('a', 'won', 10),
      sale('a', 'completed', 20),
      sale('a', 'proposal', 3),
      sale('b', 'won', 5),
      sale('b', 'lost', 40),
    ]);

    expect(result).toEqual([
      { salespersonId: 'b', avgDays: 5, wonDeals: 1, openDeals: 0 },
      { salespersonId: 'a', avgDays: 15, wonDeals: 2, openDeals: 1 },
    ]);
  });

  it('ignora vendedores sem deal ganho e vendas sem vendedor', () => {
    const result = computeSalespersonVelocity([
      sale('c', 'proposal', 2),
      sale(null, 'won', 7),
    ]);

    expect(result).toEqual([]);
  });
});
