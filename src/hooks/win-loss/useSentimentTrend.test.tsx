import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;

const quarter = (year: number, q: number) => `${year}\u00b7Q${q}`;

// call_insights e a unica fonte do sentimento numerico (-1..1). O embed para
// call_recordings existe via call_insights_recording_id_fkey e e o que da a
// data real da gravacao e a venda associada.
const insightRows: Row[] = [
  {
    sentiment_score: 0.8,
    created_at: '2026-02-10T10:00:00.000Z',
    call_recordings: { recorded_at: '2026-02-01T09:00:00.000Z', sale_id: 'sale-won' },
  },
  {
    sentiment_score: -0.4,
    created_at: '2026-05-10T10:00:00.000Z',
    call_recordings: { recorded_at: '2026-05-02T09:00:00.000Z', sale_id: 'sale-lost' },
  },
  {
    sentiment_score: 0.2,
    created_at: '2026-05-20T10:00:00.000Z',
    call_recordings: { recorded_at: '2026-05-03T09:00:00.000Z', sale_id: 'sale-open' },
  },
];

const saleRows = [
  { id: 'sale-won', status: 'won' },
  { id: 'sale-lost', status: 'lost' },
  { id: 'sale-open', status: 'negotiation' },
];

const selects: Array<{ table: string; columns: string }> = [];

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    const query = {
      select: (columns: string) => {
        selects.push({ table, columns });
        return query;
      },
      gte: () => query,
      not: () => query,
      in: () => query,
      eq: () => query,
      then: (resolve: (value: unknown) => unknown) => {
        const data =
          table === 'call_insights' ? insightRows : table === 'sales' ? saleRows : null;
        return Promise.resolve({ data, error: null }).then(resolve);
      },
    };
    return query;
  };

  return { supabase: { from: (table: string) => builder(table) } };
});

const { useSentimentTrend } = await import('./useSentimentTrend');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useSentimentTrend', () => {
  it('le o sentimento de call_insights e nunca da call_recordings.sentiment_score', async () => {
    const { result } = renderHook(() => useSentimentTrend(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const insightSelect = selects.find(s => s.table === 'call_insights');
    expect(insightSelect?.columns).toContain('sentiment_score');
    expect(insightSelect?.columns).toContain('call_recordings(recorded_at, sale_id)');
    // A coluna que nao existe (call_recordings.sentiment_score) nao pode voltar:
    // era ela que fazia a query falhar com 42703 e deixava a serie vazia.
    expect(selects.some(s => s.table === 'call_recordings')).toBe(false);
  });

  it('agrega por trimestre usando a data da gravacao e resolve o desfecho pela venda', async () => {
    const { result } = renderHook(() => useSentimentTrend(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const points = result.current.data ?? [];
    expect(points).toHaveLength(2);
    expect(points[0]).toMatchObject({
      quarter: quarter(2026, 1),
      avgSentiment: 0.8,
      count: 1,
    });
    expect(points[0]?.winRate).toBe(100);
    expect(points[1]).toMatchObject({
      quarter: quarter(2026, 2),
      count: 2,
    });
    expect(points[1]?.avgSentiment).toBeCloseTo(-0.1, 6);
    // Venda aberta nao entra no denominador do win rate (so desfecho decide).
    expect(points[1]?.winRate).toBe(0);
  });
});
