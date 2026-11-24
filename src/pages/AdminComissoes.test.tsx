import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { vi, describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import type { Commission } from '@/hooks/useCommissions';
import AdminComissoes from './AdminComissoes';

const state = vi.hoisted(() => ({
  data: [] as Commission[],
  error: null as Error | null,
}));

vi.mock('@/hooks/useCommissions', () => ({
  useAllCommissions: () => ({
    data: state.data,
    isLoading: false,
    isError: state.error !== null,
    error: state.error,
    refetch: () => undefined,
  }),
  useUpdateCommissionStatus: () => ({ mutateAsync: () => Promise.resolve() }),
}));

function makeCommission(overrides: Partial<Commission>): Commission {
  return {
    id: 'c1',
    sale_id: 's1',
    salesperson_id: 'sp1',
    rule_id: null,
    base_amount: 1000,
    percentage: 5,
    commission_amount: 50,
    status: 'pending',
    approved_at: null,
    approved_by: null,
    paid_at: null,
    paid_by: null,
    payment_notes: null,
    created_at: '2026-11-01T10:00:00.000Z',
    updated_at: '2026-11-01T10:00:00.000Z',
    sales: null,
    salespeople: null,
    ...overrides,
  };
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <HelmetProvider>
        <MemoryRouter>
          <AdminComissoes />
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

const EMPTY = /Nenhuma comissão encontrada/i;

describe('AdminComissoes — filtro de busca', () => {
  it('mantém na lista a comissão sem vendedor e sem cliente quando a busca está vazia', () => {
    state.error = null;
    state.data = [makeCommission({ salespeople: null, sales: null })];

    renderPage();

    expect(screen.queryByText(EMPTY)).toBeNull();
  });

  it('esconde a comissão sem vínculo quando o termo buscado não casa nada', () => {
    state.error = null;
    state.data = [makeCommission({ sales: null, salespeople: null })];

    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Buscar vendedor ou cliente/i), {
      target: { value: 'zzz' },
    });

    expect(screen.getByText(EMPTY)).toBeTruthy();
  });

  it('filtra pelo nome do vendedor mantendo a busca existente', () => {
    state.error = null;
    state.data = [
      makeCommission({
        id: 'com-nome',
        salespeople: { name: 'Ana Souza' },
        sales: { client_name: 'Cliente da Ana', product_name: 'Plano X', amount: 1000 },
      }),
      makeCommission({ id: 'sem-nome', sales: null, salespeople: null }),
    ];

    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Buscar vendedor ou cliente/i), {
      target: { value: 'ana' },
    });

    expect(screen.getByText('Cliente da Ana')).toBeTruthy();
    expect(screen.queryByText(EMPTY)).toBeNull();
  });

  it('busca pelo cliente mesmo sem vendedor vinculado', () => {
    state.error = null;
    state.data = [
      makeCommission({
        sales: { client_name: 'Acme Ltda', product_name: 'Plano Y', amount: 1000 },
        salespeople: null,
      }),
    ];

    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Buscar vendedor ou cliente/i), {
      target: { value: 'acme' },
    });

    expect(screen.getByText('Acme Ltda')).toBeTruthy();
    expect(screen.queryByText(EMPTY)).toBeNull();
  });
});
