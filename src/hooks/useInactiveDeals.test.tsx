import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { subDays } from 'date-fns';

type Result = { data: unknown; error: unknown };
const responses: Record<string, Result> = {};
const selects: Record<string, string> = {};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      const query = {
        select: (cols: string) => {
          selects[table] = cols;
          return query;
        },
        not: () => query,
        order: () => query,
        then: (resolve: (value: Result) => unknown) =>
          Promise.resolve(responses[table] ?? { data: [], error: null }).then(resolve),
      };
      return query;
    },
  },
}));

const { useInactiveDeals } = await import('./useInactiveDeals');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useInactiveDeals', () => {
  beforeEach(() => {
    for (const k of Object.keys(responses)) delete responses[k];
    for (const k of Object.keys(selects)) delete selects[k];
  });

  it('começa carregando e expõe o vendedor real do deal para notificação', async () => {
    responses.stage_inactivity_rules = { data: [], error: null };
    responses.activities = { data: [], error: null };
    responses.sales = {
      data: [
        {
          id: 'sale-1',
          client_name: 'Cliente A',
          status: 'proposal',
          updated_at: subDays(new Date(), 12).toISOString(),
          created_at: subDays(new Date(), 30).toISOString(),
          salesperson: { name: 'Ana', auth_user_id: 'user-ana' },
        },
        {
          id: 'sale-2',
          client_name: 'Cliente B',
          status: 'lead',
          updated_at: subDays(new Date(), 5).toISOString(),
          created_at: subDays(new Date(), 30).toISOString(),
          salesperson: null,
        },
      ],
      error: null,
    };

    const { result } = renderHook(() => useInactiveDeals(), { wrapper });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(selects.sales).toContain(
      'salespeople!sales_salesperson_id_fkey(name, auth_user_id)'
    );

    const byId = Object.fromEntries(result.current.inactiveDeals.map(d => [d.id, d]));
    expect(byId['sale-1']).toMatchObject({
      severity: 'critical',
      salespersonName: 'Ana',
      salespersonUserId: 'user-ana',
    });
    expect(byId['sale-2']).toMatchObject({
      salespersonName: null,
      salespersonUserId: null,
    });
  });

  it('sinaliza erro quando a consulta de vendas falha (não mostra "tudo em dia")', async () => {
    responses.sales = { data: null, error: { message: 'permission denied' } };

    const { result } = renderHook(() => useInactiveDeals(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.inactiveDeals).toEqual([]);
  });
});
