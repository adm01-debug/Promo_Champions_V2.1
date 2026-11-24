import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  data: [] as unknown[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock('@/hooks/useEligibleBonuses', () => ({
  useEligibleBonuses: () => state,
}));

vi.mock('@/hooks/useAutoAwardBonuses', () => ({
  useAutoAwardBonuses: () => undefined,
}));

import { EligibleBonusesCard } from './EligibleBonusesCard';

// QA-061: falha na receita do mês é erro fatal — o card não pode dizer "não atingido".
describe('EligibleBonusesCard (QA-061)', () => {
  beforeEach(() => {
    state.data = [];
    state.isLoading = false;
    state.isError = false;
    state.refetch.mockReset();
  });

  it('mostra erro com nova tentativa quando a leitura falha', async () => {
    state.isError = true;
    render(<EligibleBonusesCard salespersonId="sp1" />);

    expect(
      screen.getByText(/Não foi possível carregar as premiações/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Próximos marcos/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Tentar de novo/ }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });

  it('avisa que o dado é parcial quando sequência ou total de vendas falharam', () => {
    const bonuses = [
      {
        id: 'b1',
        name: 'Marco 10k',
        description: null,
        bonus_type: 'milestone',
        bonus_kind: 'fixed',
        bonus_amount: 500,
        salesperson_id: null,
        priority: 0,
        is_active: true,
        trigger_condition: {},
        created_at: '',
        updated_at: '',
        reason: 'Faltam R$ 5.000',
        progress: 0.5,
        achieved: false,
      },
    ] as unknown[] & { partial?: boolean };
    bonuses.partial = true;
    state.data = bonuses;

    render(<EligibleBonusesCard salespersonId="sp1" />);

    expect(screen.getByText('dado parcial')).toBeInTheDocument();
    expect(screen.getByText('Marco 10k')).toBeInTheDocument();
  });

  it('nao mostra o aviso de parcial quando todas as leituras funcionaram', () => {
    state.data = [];
    state.isLoading = true;

    const { container } = render(<EligibleBonusesCard salespersonId="sp1" />);

    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    expect(screen.queryByText('dado parcial')).not.toBeInTheDocument();
  });
});
