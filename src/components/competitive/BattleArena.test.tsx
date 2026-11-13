import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const futuro = new Date(Date.now() + 86_400_000).toISOString();

vi.mock('@/hooks/sales/useSalesBattles', () => ({
  useSalesBattles: () => ({
    battles: [
      {
        id: 'ativa',
        title: 'Batalha em andamento',
        metric: 'deals',
        battle_type: 'ffa',
        status: 'active',
        ends_at: futuro,
        xp_reward: 100,
        battle_participants: [],
      },
      {
        id: 'finalizada',
        title: 'Batalha encerrada',
        metric: 'deals',
        battle_type: 'ffa',
        status: 'completed',
        ends_at: '2026-01-01T00:00:00.000Z',
        xp_reward: 100,
        winner_id: 'vendedor-1',
        battle_participants: [],
      },
    ],
    isLoading: false,
    cancelBattle: { mutate: vi.fn(), isPending: false },
  }),
}));

vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => ({ isAdminOrManager: true }),
}));

vi.mock('./CreateBattleDialog', () => ({ CreateBattleDialog: () => null }));

const { BattleArena } = await import('./BattleArena');

describe('BattleArena — gerenciar batalhas', () => {
  it('mostra editar/cancelar só na batalha ativa, nunca na finalizada', () => {
    render(<BattleArena />);

    expect(screen.getByText('Batalha em andamento')).toBeInTheDocument();
    expect(screen.getByText('Batalha encerrada')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Editar batalha' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Cancelar batalha' })).toHaveLength(1);
  });
});
