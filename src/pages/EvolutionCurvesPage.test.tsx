import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { formatBRL } from '@/lib/money';

vi.mock('@/components/competitive/EvolutionChart', () => ({
  EvolutionChart: () => <div data-testid="evolution-chart" />,
}));

vi.mock('@/hooks/useEvolutionCurves', () => ({
  useEvolutionCurves: () => ({
    chartData: [{ date: '2026-11-12', 'sp-1': 100, 'sp-2': 50 }],
    salespeople: [
      { id: 'sp-1', name: 'João' },
      { id: 'sp-2', name: 'João' },
    ],
    isLoading: false,
    isError: false,
  }),
}));

// O DOM normaliza o espaço não separável do Intl para espaço comum.
const brl = (value: number) => formatBRL(value).replace(/\s/g, ' ');

const { default: EvolutionCurvesPage } = await import('./EvolutionCurvesPage');

describe('EvolutionCurvesPage', () => {
  it('mostra a receita de cada vendedor homônimo separadamente, sem botões sem ação', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <EvolutionCurvesPage />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getAllByText('João')).toHaveLength(2);
    expect(screen.getByText(brl(100))).toBeTruthy();
    expect(screen.getByText(brl(50))).toBeTruthy();
    expect(screen.queryByRole('button', { name: /compartilhar/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /filtrar segmentos/i })).toBeNull();
  });
});
