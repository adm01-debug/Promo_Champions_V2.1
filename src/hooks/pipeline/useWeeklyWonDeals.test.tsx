import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: Array<[string, ...unknown[]]> = [];
let response: { count: number | null; error: { message: string } | null } = {
  count: 0,
  error: null,
};

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    select: (...args: unknown[]) => (calls.push(['select', ...args]), query),
    in: (...args: unknown[]) => (calls.push(['in', ...args]), query),
    is: (...args: unknown[]) => (calls.push(['is', ...args]), query),
    gte: (...args: unknown[]) => (calls.push(['gte', ...args]), query),
    then: (resolve: (value: typeof response) => unknown) =>
      Promise.resolve(response).then(resolve),
  };
  return {
    supabase: {
      from: (table: string) => (calls.push(['from', table]), query),
    },
  };
});

const { useWeeklyWonDeals, WEEKLY_WON_DEALS_WINDOW_DAYS } =
  await import('./useWeeklyWonDeals');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useWeeklyWonDeals', () => {
  beforeEach(() => {
    calls.length = 0;
    response = { count: 0, error: null };
  });

  it('conta vendas ganhas não excluídas fechadas nos últimos 7 dias', async () => {
    response = { count: 5, error: null };
    const before = Date.now();

    const { result } = renderHook(() => useWeeklyWonDeals(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(5);

    expect(calls).toContainEqual(['from', 'sales']);
    expect(calls).toContainEqual(['select', 'id', { count: 'exact', head: true }]);
    expect(calls).toContainEqual(['in', 'status', ['completed', 'won', 'closed']]);
    expect(calls).toContainEqual(['is', 'deleted_at', null]);

    const gte = calls.find(c => c[0] === 'gte');
    expect(gte?.[1]).toBe('closed_at');
    const since = new Date(gte?.[2] as string).getTime();
    const windowMs = WEEKLY_WON_DEALS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    expect(before - since).toBeGreaterThanOrEqual(windowMs - 1000);
    expect(before - since).toBeLessThanOrEqual(windowMs + 1000);
  });

  it('retorna 0 quando o banco não devolve contagem', async () => {
    response = { count: null, error: null };

    const { result } = renderHook(() => useWeeklyWonDeals(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });

  it('propaga erro do banco em vez de inventar número', async () => {
    response = { count: null, error: { message: 'permission denied' } };

    const { result } = renderHook(() => useWeeklyWonDeals(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
