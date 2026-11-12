import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const abcData = {
  products: [
    {
      name: 'Caneca',
      revenue: 1000,
      percentage: 100,
      cumulativePercentage: 100,
      classification: 'A' as const,
    },
  ],
  clients: [
    {
      name: 'Cliente Real',
      revenue: 1000,
      percentage: 100,
      cumulativePercentage: 100,
      classification: 'A' as const,
    },
  ],
  summary: { products: { A: 1, B: 0, C: 0 }, clients: { A: 1, B: 0, C: 0 } },
  totalRevenue: 1000,
  neuralInsights: [
    {
      title: 'Concentração de Receita',
      description: 'Seu principal cliente gera 100.0% da receita.',
      type: 'warning' as const,
    },
  ],
};

let hookData: typeof abcData = abcData;

vi.mock('@/hooks/bi/useABCAnalysis', () => ({
  useABCAnalysis: () => ({ data: hookData, isLoading: false }),
}));

const { ABCAnalysis } = await import('./ABCAnalysis');

function renderABC() {
  return render(
    <MemoryRouter initialEntries={['/analytics/abc']}>
      <ABCAnalysis />
    </MemoryRouter>
  );
}

describe('ABCAnalysis', () => {
  it('mostra só o insight calculado, sem automações, movimentações nem ações falsas', () => {
    hookData = abcData;
    renderABC();

    expect(
      screen.getByText('Seu principal cliente gera 100.0% da receita.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Confidence Score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Matrix Shift/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Actionable Automations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Optimization Ready/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Executar Agora/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Filtros/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exportar/i })).toBeInTheDocument();
  });

  it('sem vendas, não exibe a seção de insights', () => {
    hookData = { ...abcData, products: [], clients: [], neuralInsights: [] };
    renderABC();

    expect(screen.queryByText(/Pareto Neural Insights/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Sem dados disponíveis').length).toBeGreaterThan(0);
  });
});
