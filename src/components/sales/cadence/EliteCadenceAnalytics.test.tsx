import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CadenceChannelStats } from '@/hooks/cadences/useCadenceChannelStats';

let hookState: {
  data?: CadenceChannelStats;
  isLoading: boolean;
  isError: boolean;
};

vi.mock('@/hooks/cadences/useCadenceChannelStats', () => ({
  useCadenceChannelStats: () => hookState,
}));

const { EliteCadenceAnalytics } = await import('./EliteCadenceAnalytics');

const stats: CadenceChannelStats = {
  days: 30,
  totalTasks: 1700,
  completedTasks: 450,
  completionRate: (450 / 1700) * 100,
  channels: [
    { type: 'whatsapp', total: 200, completed: 150, rate: 75 },
    { type: 'email', total: 1500, completed: 300, rate: 20 },
  ],
  topChannel: { type: 'whatsapp', total: 200, completed: 150, rate: 75 },
};

describe('EliteCadenceAnalytics', () => {
  beforeEach(() => {
    hookState = { data: stats, isLoading: false, isError: false };
  });

  it('mostra taxa de conclusão real e não exibe score, fluxo ou ação fictícios', () => {
    render(<EliteCadenceAnalytics />);

    expect(screen.getByText('26%')).toBeInTheDocument();
    expect(screen.getByText('450 de 1700 tarefas')).toBeInTheDocument();
    expect(screen.getByText('75.0% de conclusão')).toBeInTheDocument();
    expect(screen.queryByText('88')).not.toBeInTheDocument();
    expect(screen.queryByText(/Ranking S/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Matrix Shift/)).not.toBeInTheDocument();
    expect(screen.queryByText(/acima da média do setor/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+22%/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver Log de Melhorias/ })).toBeNull();
  });

  it('mostra estado vazio quando não há tarefas no período', () => {
    hookState = {
      data: {
        ...stats,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        channels: [],
        topChannel: null,
      },
      isLoading: false,
      isError: false,
    };
    render(<EliteCadenceAnalytics />);
    expect(
      screen.getByText('Nenhuma tarefa de cadência agendada nos últimos 30 dias.')
    ).toBeInTheDocument();
  });

  it('mostra erro quando a consulta falha', () => {
    hookState = { data: undefined, isLoading: false, isError: true };
    render(<EliteCadenceAnalytics />);
    expect(screen.getByText(/Não foi possível carregar/)).toBeInTheDocument();
  });
});
