import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';

// Track chunk sizes seen by `.in('client_id', chunk)` — asserts chunkedIn split works.
const inCalls: Array<{ column: string; values: unknown[] }> = [];

vi.mock('@/integrations/supabase/client', () => {
  const makeBuilder = (rows: unknown[]) => {
    const thenable = {
      data: rows,
      error: null as null | { message: string },
      // fluent chain — every call returns `thenable`
      select: () => thenable,
      eq: () => thenable,
      neq: () => thenable,
      not: () => thenable,
      order: () => thenable,
      limit: () => thenable,
      single: () => Promise.resolve({ data: null, error: null }),
      in: (column: string, values: unknown[]) => {
        inCalls.push({ column, values });
        return thenable;
      },
      then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data: thenable.data, error: thenable.error }).then(resolve),
    };
    return thenable;
  };

  return {
    supabase: {
      from: (table: string) => {
        if (table === 'sales' && inCalls.length === 0) {
          // 1st call: get client IDs (250 clients)
          const clientRows = Array.from({ length: 250 }, (_, i) => ({
            client_id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
          }));
          return makeBuilder(clientRows);
        }
        if (table === 'sales') {
          // 2nd+ call: cross-sell chunk. Return 2 different products with null-safety edges.
          return makeBuilder([
            { product_id: 'prod-a', product_name: 'Prod A', amount: 100 },
            { product_id: 'prod-b', product_name: null, amount: null }, // null-safety
            { product_id: null, product_name: 'Should skip', amount: 1 }, // null id — skipped
          ]);
        }
        if (table === 'products') {
          return makeBuilder([]); // fallback nunca deve ser atingido aqui
        }
        return makeBuilder([]);
      },
    },
  };
});

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

// Import AFTER mock is registered.
const { useProductRecommendations } = await import('./useProductRecommendations');

describe('useProductRecommendations — regressão Onda J/K', () => {
  beforeEach(() => {
    inCalls.length = 0;
  });

  it('particiona 250 client IDs em 3 chunks (100/100/50) via chunkedIn', async () => {
    const { result } = renderHook(() => useProductRecommendations('target-product'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 1º call é `.in('product_id', ...)` opcional? Não — o 1º sales.select usa .eq/.not, sem .in.
    // Todos os `.in()` observados devem ser cross-sell chunks em `client_id`.
    const clientChunks = inCalls.filter((c) => c.column === 'client_id');
    expect(clientChunks).toHaveLength(3);
    expect(clientChunks[0].values).toHaveLength(100);
    expect(clientChunks[1].values).toHaveLength(100);
    expect(clientChunks[2].values).toHaveLength(50);
  });

  it('agrega counts ignorando product_id null e tolera product_name/amount nulos', async () => {
    const { result } = renderHook(() => useProductRecommendations('target-product'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const recs = result.current.data ?? [];
    // 2 produtos válidos (prod-a e prod-b). null id foi ignorado.
    expect(recs.map((r) => r.id).sort()).toEqual(['prod-a', 'prod-b']);
    const b = recs.find((r) => r.id === 'prod-b');
    expect(b?.name).toBe('');       // null_safe → ''
    expect(b?.price).toBe(0);       // null_safe → 0
    // Confidence é count/clientIds.length. Cada produto aparece 1× por chunk × 3 chunks = 3.
    expect(recs[0].confidence).toBeGreaterThan(0);
  });
});
