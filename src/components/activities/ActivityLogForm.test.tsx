import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityLogForm } from './ActivityLogForm';

const mutate = vi.fn();
const authState: { salesperson: { id: string; name: string } | null } = {
  salesperson: null,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/hooks/activities/useActivities', () => ({
  useCreateActivity: () => ({ mutate, isPending: false }),
}));

vi.mock('@/hooks/sales/useSalespeople', () => ({
  useSalespeople: () => ({
    data: [{ id: 'sp-vendedor', name: 'Vendedor Logado', auth_user_id: 'auth-1' }],
  }),
}));

vi.mock('@/hooks/crm/useClients', () => ({
  useClients: () => ({ data: [] }),
}));

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Registrar Atividade' }));
}

describe('ActivityLogForm', () => {
  beforeEach(() => {
    mutate.mockClear();
    authState.salesperson = null;
  });

  it('envia o vendedor logado como salesperson_id sem abrir o combo Vendedor', async () => {
    authState.salesperson = { id: 'sp-vendedor', name: 'Vendedor Logado' };
    render(<ActivityLogForm />);

    submit();

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(mutate.mock.calls[0][0]).toMatchObject({ salesperson_id: 'sp-vendedor' });
  });

  it('preenche o vendedor logado quando o perfil carrega depois da montagem', async () => {
    const { rerender } = render(<ActivityLogForm />);
    authState.salesperson = { id: 'sp-vendedor', name: 'Vendedor Logado' };
    rerender(<ActivityLogForm />);

    submit();

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(mutate.mock.calls[0][0]).toMatchObject({ salesperson_id: 'sp-vendedor' });
  });
});
