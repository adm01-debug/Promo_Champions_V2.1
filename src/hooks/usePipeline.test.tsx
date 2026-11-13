import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';

const saleRows = [
  { id: 's-completed', status: 'completed' },
  { id: 's-pending', status: 'pending' },
  { id: 's-cancelled', status: 'cancelled' },
  { id: 's-prospecting', status: 'prospecting' },
  { id: 's-won', status: 'won' },
  { id: 's-proposal', status: 'proposal' },
  { id: 's-closed', status: 'closed' },
  { id: 's-null', status: null },
];

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    select: () => query,
    is: () => query,
    order: () => query,
    eq: () => query,
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
      Promise.resolve({ data: saleRows, error: null }).then(resolve),
  };
  return { supabase: { from: () => query } };
});

const { saleStatusToStage, usePipelineDeals } = await import('./usePipeline');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('saleStatusToStage', () => {
  it('mantém status que já são colunas do board', () => {
    for (const s of [
      'lead',
      'qualified',
      'proposal',
      'negotiation',
      'won',
      'lost',
      'closed',
    ]) {
      expect(saleStatusToStage(s)).toBe(s);
    }
  });

  it('venda concluída vai para "Venda Concluída" e cancelada para "Perdido"', () => {
    expect(saleStatusToStage('completed')).toBe('won');
    expect(saleStatusToStage('cancelled')).toBe('lost');
  });

  it('estágios abertos iniciais e status ausente vão para a primeira coluna', () => {
    expect(saleStatusToStage('pending')).toBe('lead');
    expect(saleStatusToStage('prospecting')).toBe('lead');
    expect(saleStatusToStage(null)).toBe('lead');
    expect(saleStatusToStage(undefined)).toBe('lead');
  });
});

describe('usePipelineDeals', () => {
  it('agrupa as vendas pela coluna correta do status real', async () => {
    const { result } = renderHook(() => usePipelineDeals(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const ids = (stage: keyof NonNullable<typeof result.current.data>) =>
      result.current.data![stage].map(d => d.id).sort();

    expect(ids('won')).toEqual(['s-completed', 's-won']);
    expect(ids('lost')).toEqual(['s-cancelled']);
    expect(ids('lead')).toEqual(['s-null', 's-pending', 's-prospecting']);
    expect(ids('proposal')).toEqual(['s-proposal']);
    expect(ids('closed')).toEqual(['s-closed']);
  });
});
