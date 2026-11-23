import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';

import { useSalesReport } from './useSalesReport';

const salespeopleError = { message: 'salespeople_public indisponivel' };

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    const query = {
      select: () => query,
      gte: () => query,
      lte: () => query,
      then: (resolve: (value: { data: unknown[]; error: unknown }) => unknown) =>
        Promise.resolve({
          data: [],
          error: table === 'salespeople_public' ? salespeopleError : null,
        }).then(resolve),
    };
    return query;
  };

  return { supabase: { from: (table: string) => builder(table) } };
});

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    {
      client: new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    },
    children
  );

describe('useSalesReport', () => {
  it('propaga o erro do fetch de salespeople em vez de ranking vazio', async () => {
    const { result } = renderHook(
      () => useSalesReport('month', new Date('2026-11-10T12:00:00.000Z')),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(salespeopleError);
  });
});
