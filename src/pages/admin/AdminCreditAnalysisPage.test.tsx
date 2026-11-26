import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const tables = vi.hoisted(() => ({
  orders: [] as Record<string, unknown>[],
  credit_outbox: [] as Record<string, unknown>[],
}));

vi.mock('react-helmet-async', () => ({ Helmet: () => null }));

vi.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/integrations/supabase/client', () => {
  const make = (table: 'orders' | 'credit_outbox') => {
    const q: Record<string, unknown> = {};
    const chain = () => q;
    Object.assign(q, {
      select: chain,
      eq: chain,
      in: chain,
      order: chain,
      limit: chain,
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({ data: tables[table], error: null }).then(resolve),
    });
    return q;
  };
  return { supabase: { from: (table: 'orders' | 'credit_outbox') => make(table) } };
});

import AdminCreditAnalysisPage from './AdminCreditAnalysisPage';

const order = (id: string, number: string, total: number) => ({
  id,
  order_number: number,
  total,
  created_at: '2026-11-28T10:00:00.000Z',
  clients: { name: `Cliente ${number}`, cnpj: '12.345.678/0001-90' },
});

const event = (orderId: string, status: string, lastError: string | null = null) => ({
  order_id: orderId,
  status,
  attempts: status === 'dead' ? 3 : 1,
  last_error: lastError,
  next_attempt_at: '2026-11-28T11:00:00.000Z',
  delivered_at: status === 'delivered' ? '2026-11-28T10:05:00.000Z' : null,
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminCreditAnalysisPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AdminCreditAnalysisPage — fila de crédito da 1ª venda (#761)', () => {
  beforeEach(() => {
    tables.orders = [];
    tables.credit_outbox = [];
  });

  it('lista pedido aguardando crédito com cliente, CNPJ e valor', async () => {
    tables.orders = [order('o1', 'PED-1', 1250.5)];
    tables.credit_outbox = [event('o1', 'pending')];

    renderPage();

    expect(await screen.findByText('PED-1')).toBeTruthy();
    expect(screen.getByText('Cliente PED-1')).toBeTruthy();
    expect(screen.getByText('12.345.678/0001-90')).toBeTruthy();
    expect(screen.getByText(/1\.250,50/)).toBeTruthy();
    expect(screen.getByText('Na fila')).toBeTruthy();
  });

  it('sinaliza como "Não gerado" o pedido sem evento de solicitação', async () => {
    tables.orders = [order('o1', 'PED-1', 100)];
    tables.credit_outbox = [];

    renderPage();

    expect(await screen.findByText('Não gerado')).toBeTruthy();
  });

  it('conta solicitações entregues e falhas no cabeçalho', async () => {
    tables.orders = [order('o1', 'PED-1', 100), order('o2', 'PED-2', 200)];
    tables.credit_outbox = [
      event('o1', 'delivered'),
      event('o2', 'dead', 'secret_not_configured'),
    ];

    renderPage();

    expect(await screen.findByText('PED-1')).toBeTruthy();
    expect(screen.getByText('Solicitação entregue')).toBeTruthy();
    expect(screen.getByText('Envio falhou')).toBeTruthy();
    const delivered = screen.getByText('Solicitação entregue').parentElement;
    const failed = screen.getByText('Envio falhou').parentElement;
    expect(delivered?.textContent).toContain('1');
    expect(failed?.textContent).toContain('1');
  });

  it('mostra o último erro de envio no detalhe do pedido', async () => {
    tables.orders = [order('o1', 'PED-1', 100)];
    tables.credit_outbox = [event('o1', 'dead', 'secret_not_configured')];

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /Detalhes/i }));

    expect(await screen.findByText('Último erro de envio')).toBeTruthy();
    expect(screen.getByText('secret_not_configured')).toBeTruthy();
  });

  it('mostra estado vazio quando não há pedido aguardando crédito', async () => {
    renderPage();

    expect(
      await screen.findByText('Nenhum pedido aguardando análise de crédito.')
    ).toBeTruthy();
  });
});
