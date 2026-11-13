import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PredictiveScenarioPlanner } from './PredictiveScenarioPlanner';

vi.mock('@/hooks/forecast/useScenarioBaseline', () => ({
  SCENARIO_BASELINE_DAYS: 90,
  useScenarioBaseline: vi.fn(),
}));

import { useScenarioBaseline } from '@/hooks/forecast/useScenarioBaseline';

const mockBaseline = (value: Record<string, unknown>) =>
  vi.mocked(useScenarioBaseline).mockReturnValue(value as never);

// Normaliza o espaço não separável do Intl (R$ 1.000) para comparação.
const text = () => (document.body.textContent ?? '').replace(/ /g, ' ');

describe('PredictiveScenarioPlanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mostra skeleton enquanto carrega a base real', () => {
    mockBaseline({ data: undefined, isLoading: true, isError: false });
    render(<PredictiveScenarioPlanner />);
    expect(screen.getByTestId('scenario-planner-loading')).toBeInTheDocument();
  });

  it('mostra erro honesto quando a consulta falha', () => {
    mockBaseline({ data: undefined, isLoading: false, isError: true });
    render(<PredictiveScenarioPlanner />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a receita ganha'
    );
  });

  it('mostra estado vazio sem vendas ganhas, sem projeção inventada', () => {
    mockBaseline({
      data: {
        wonRevenue: 0,
        wonCount: 0,
        lostCount: 3,
        winRate: 0,
        sellersWithWins: 0,
        revenuePerSeller: null,
      },
      isLoading: false,
      isError: false,
    });
    render(<PredictiveScenarioPlanner />);
    expect(
      screen.getByText(/Nenhuma venda ganha nos últimos 90 dias/)
    ).toBeInTheDocument();
    expect(screen.queryByText('Receita Trimestral Projetada')).not.toBeInTheDocument();
  });

  it('projeta a partir da receita ganha real e não oferece ação falsa', () => {
    mockBaseline({
      data: {
        wonRevenue: 100000,
        wonCount: 8,
        lostCount: 2,
        winRate: 80,
        sellersWithWins: 4,
        revenuePerSeller: 25000,
      },
      isLoading: false,
      isError: false,
    });
    render(<PredictiveScenarioPlanner />);

    // Padrões: +2 vendedores (2 × 25.000), +5% conversão, -2% churn.
    // 100.000 + 50.000 + 5.000 + 2.000 = 157.000
    expect(text()).toContain('R$ 157.000');
    expect(text()).toContain('R$ 57.000 de incremento');
    // Win-rate real 80% × 1,05
    expect(text()).toContain('84.0%');
    // 4 vendedores com venda + 2 contratações
    expect(text()).toContain('6 Reps');
    expect(text()).toContain('Base real: R$ 100.000 em 8 vendas ganhas');
    expect(text()).not.toContain('2.50M');
    expect(
      screen.queryByRole('button', { name: /Aplicar Plano/i })
    ).not.toBeInTheDocument();
  });
});
