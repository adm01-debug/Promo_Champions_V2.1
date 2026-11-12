import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const registry = [
  { id: 'c1', name: 'Alfa', aliases: ['A'], default_battle_card_id: 'card-1' },
  { id: 'c2', name: 'Beta', aliases: null, default_battle_card_id: null },
];
const mentionCounts: Record<string, number> = { c1: 2, c2: 5 };
const cardFilters: string[][] = [];

vi.mock('@/integrations/supabase/client', () => {
  const builder = (table: string) => {
    let competitorId: string | null = null;
    const query = {
      select: () => query,
      eq: (column: string, value: string) => {
        if (column === 'competitor_id') competitorId = value;
        return query;
      },
      order: () => query,
      in: (_column: string, values: string[]) => {
        cardFilters.push(values);
        return query;
      },
      then: (resolve: (value: unknown) => unknown) => {
        if (table === 'competitors_registry')
          return Promise.resolve({ data: registry, error: null }).then(resolve);
        if (table === 'sales_enablement_assets')
          return Promise.resolve({
            data: [{ id: 'card-1', title: 'Card Alfa', file_url: null }],
            error: null,
          }).then(resolve);
        return Promise.resolve({
          count: mentionCounts[competitorId ?? ''] ?? 0,
          error: null,
        }).then(resolve);
      },
    };
    return query;
  };
  return { supabase: { from: (table: string) => builder(table) } };
});

const { useCompetitorMarketIntel } = await import('./useCompetitorsRegistry');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useCompetitorMarketIntel', () => {
  it('combina registro, contagem de menções e battle card, ordenando por menções', async () => {
    const { result } = renderHook(() => useCompetitorMarketIntel(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cardFilters).toEqual([['card-1']]);
    expect(result.current.data).toEqual([
      { id: 'c2', name: 'Beta', aliases: [], mentions: 5, battleCard: null },
      {
        id: 'c1',
        name: 'Alfa',
        aliases: ['A'],
        mentions: 2,
        battleCard: { id: 'card-1', title: 'Card Alfa', file_url: null },
      },
    ]);
  });
});
