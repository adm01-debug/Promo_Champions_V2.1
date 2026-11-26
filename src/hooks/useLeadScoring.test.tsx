import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queriedTables: string[] = [];

vi.mock('@/lib/supabase/chunkedIn', () => ({
  chunkedIn: async () => [],
}));

vi.mock('@/integrations/supabase/client', () => {
  const historyRows = [
    { sale_id: 'deal-1', score: 40, recorded_at: '2026-01-01T00:00:00.000Z' },
    { sale_id: 'deal-1', score: 70, recorded_at: '2026-01-02T00:00:00.000Z' },
  ];
  const clientRows = [
    { id: 'c1', name: 'Cliente A', email: 'a@b.c', company: 'A', total_value: 1000 },
  ];
  const saleRows = [
    {
      id: 'deal-1',
      client_name: 'Cliente A',
      amount: 1000,
      status: 'won',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  const rowsFor = (table: string) => {
    if (table === 'lead_score_history') return historyRows;
    if (table === 'clients') return clientRows;
    if (table === 'sales') return saleRows;
    return [];
  };

  const builder = (rows: unknown[]) => {
    const query = {
      select: () => query,
      order: () => query,
      eq: () => query,
      then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data: rows, error: null }).then(resolve),
    };
    return query;
  };

  return {
    supabase: {
      from: (table: string) => {
        queriedTables.push(table);
        return builder(rowsFor(table));
      },
      functions: {
        invoke: async () => ({
          data: {
            scores: {
              'deal-1': {
                score: 85,
                factors: {
                  dealValue: 1,
                  stageProgress: 1,
                  timeInPipeline: 1,
                  category: 1,
                  recentActivity: 1,
                },
                labels: {},
              },
            },
          },
          error: null,
        }),
      },
    },
  };
});

const { useLeadScoring } = await import('./useLeadScoring');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useLeadScoring', () => {
  beforeEach(() => {
    queriedTables.length = 0;
  });

  it('le a serie historica da tabela alimentada pelo servidor e monta a tendencia', async () => {
    const { result } = renderHook(() => useLeadScoring(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queriedTables).toContain('lead_score_history');
    expect(queriedTables).not.toContain('lead_score_trends');

    const lead = result.current.data?.[0];
    expect(lead?.bestDealId).toBe('deal-1');
    expect(lead?.trend).toEqual([40, 70]);
  });
});
