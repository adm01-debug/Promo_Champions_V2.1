import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const { useSquadsMock, removeMutate, removeMemberMutate } = vi.hoisted(() => ({
  useSquadsMock: vi.fn(),
  removeMutate: vi.fn(),
  removeMemberMutate: vi.fn(),
}));

vi.mock('@/hooks/admin-tasks/useSquads', () => ({
  useSquads: useSquadsMock,
  useSquadMembers: () => ({ data: [] }),
}));

vi.mock('@/hooks/sales/useSalespeopleMin', () => ({
  useSalespeopleMin: () => ({ data: [] }),
}));

import { SquadManager } from './SquadManager';

const squads = [
  { id: 'sq-1', name: 'Elite', description: null, color: '#22c55e', member_count: 2 },
];

describe('SquadManager - confirmacao de exclusao', () => {
  beforeEach(() => {
    removeMutate.mockReset();
    removeMemberMutate.mockReset();
    useSquadsMock.mockReturnValue({
      data: squads,
      isLoading: false,
      create: { mutateAsync: vi.fn(), isPending: false },
      remove: { mutate: removeMutate, isPending: false },
      addMember: { mutate: vi.fn() },
      removeMember: { mutate: removeMemberMutate, isPending: false },
    });
  });

  it('nao exclui o squad antes da confirmacao no dialogo', async () => {
    render(<SquadManager />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir squad' }));

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(removeMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(removeMutate).toHaveBeenCalledWith('sq-1', expect.anything())
    );
  });

  it('cancelar mantem o squad', async () => {
    render(<SquadManager />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir squad' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    );
    expect(removeMutate).not.toHaveBeenCalled();
  });
});
