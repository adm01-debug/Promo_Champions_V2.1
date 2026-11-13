import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarginAlertsCard } from './MarginAlertsCard';

vi.mock('@/hooks/bi/useCriticalMarkupSales', () => ({
  useCriticalMarkupSales: vi.fn(),
}));

import { useCriticalMarkupSales } from '@/hooks/bi/useCriticalMarkupSales';

const renderCard = () =>
  render(
    <MemoryRouter>
      <MarginAlertsCard days={30} />
    </MemoryRouter>
  );

describe('MarginAlertsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra estado vazio quando não há vendas com markup crítico', () => {
    vi.mocked(useCriticalMarkupSales).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);

    renderCard();

    expect(
      screen.getByText('Nenhuma venda com markup crítico nos últimos 30 dias.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/INCIDENTES CRÍTICOS/)).not.toBeInTheDocument();
    expect(screen.queryByText('Tech Solutions Inc')).not.toBeInTheDocument();
  });

  it('lista vendas reais com markup crítico e conta os incidentes', () => {
    vi.mocked(useCriticalMarkupSales).mockReturnValue({
      data: [
        {
          id: 'v1',
          clientName: 'Cliente Real',
          productName: 'Caneta',
          amount: 1000,
          markupPct: 12.5,
          createdAt: '2026-11-01T00:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
    } as never);

    renderCard();

    expect(screen.getByText('Cliente Real')).toBeInTheDocument();
    expect(screen.getByText('Caneta')).toBeInTheDocument();
    expect(screen.getByText('12,5%')).toBeInTheDocument();
    expect(screen.getByText(/1\s+INCIDENTE CRÍTICO/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REVISAR VENDAS' })).toBeInTheDocument();
  });
});
