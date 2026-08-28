import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sellerChunks: string[][] = [];
const taskRows = Array.from({ length: 201 }, (_, index) => ({
  id: `task-${index}`,
  salesperson_id: `seller-${index}`,
  status: 'pending',
  due_date: '2000-01-01T00:00:00.000Z',
}));

vi.mock('@/integrations/supabase/client', () => {
  const builder = (initialData: unknown[]) => {
    let data = initialData;
    const query = {
      select: () => query,
      ilike: () => query,
      gte: () => query,
      not: () => query,
      in: (column: string, values: string[]) => {
        if (column === 'id') {
          sellerChunks.push([...values]);
          data = values.map(id => ({ id, name: `Vendedor ${id}` }));
        }
        return query;
      },
      then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve),
    };
    return query;
  };

  return {
    supabase: {
      from: (table: string) => builder(table === 'tasks' ? taskRows : []),
    },
  };
});

const { useChurnOverdueBySeller } = await import('./useChurnOverdueBySeller');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useChurnOverdueBySeller', () => {
  beforeEach(() => {
    sellerChunks.length = 0;
  });

  it('particiona a consulta de vendedores quando há mais de 100 IDs', async () => {
    const { result } = renderHook(() => useChurnOverdueBySeller(30, 5), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sellerChunks.map(chunk => chunk.length)).toEqual([100, 100, 1]);
  });
});
