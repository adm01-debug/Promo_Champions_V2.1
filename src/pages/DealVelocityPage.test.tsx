import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/analytics/DealVelocityChart', () => ({
  DealVelocityChart: () => <div data-testid="deal-velocity-chart" />,
}));

vi.mock('@/hooks/deal-intelligence/useDealAnalyticsVelocity', () => ({
  useDealVelocity: () => ({
    data: {
      overallAverage: 10,
      bySalesperson: [{ salespersonId: 'sp-1', avgDays: 8, wonDeals: 2, openDeals: 1 }],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/hooks/sales/useSalespeopleMin', () => ({
  useSalespeopleMin: () => ({
    data: [{ id: 'sp-1', name: 'Maria' }],
    isLoading: false,
    isError: false,
  }),
}));

const { default: DealVelocityPage } = await import('./DealVelocityPage');

describe('DealVelocityPage', () => {
  it('mostra o comparativo real e não exibe o botão Exportar sem ação', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <DealVelocityPage />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByText('Maria')).toBeTruthy();
    expect(screen.getByText('8d')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /exportar/i })).toBeNull();
  });
});
