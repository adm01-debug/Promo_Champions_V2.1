import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const contactChunks: string[][] = [];
const saleRows = Array.from({ length: 201 }, (_, index) => ({
  client_id: `client-${index}`,
  client_name: `Cliente ${index}`,
  amount: 100,
  created_at: '2000-01-01T00:00:00.000Z',
  status: 'completed',
}));

vi.mock('@/integrations/supabase/client', () => {
  const builder = (initialData: unknown[]) => {
    let data = initialData;
    const query = {
      select: () => query,
      or: () => query,
      order: () => query,
      in: (column: string, values: string[]) => {
        if (column === 'id') {
          contactChunks.push([...values]);
          data = values.map(id => ({
            id,
            phone: `+55119999${id.slice(-4).padStart(4, '0')}`,
            email: `${id}@example.test`,
          }));
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
      from: (table: string) => builder(table === 'sales' ? saleRows : []),
    },
  };
});

const { useClientsNeedingContact } = await import('./useClientsNeedingContact');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useClientsNeedingContact', () => {
  beforeEach(() => {
    contactChunks.length = 0;
  });

  it('particiona a busca de contatos para carteiras grandes', async () => {
    const { result } = renderHook(
      () => useClientsNeedingContact({ salespersonId: 'seller-1', limit: 10 }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(contactChunks.map(chunk => chunk.length)).toEqual([100, 100, 1]);
  });
});
