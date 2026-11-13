import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PowerDialer from './PowerDialer';

const auth = vi.hoisted(() => ({ userId: 'u-gestor', isAdmin: false }));

const QUEUES = [
  {
    id: 'q-propria',
    owner_id: 'u-gestor',
    name: 'Fila própria',
    priority_strategy: 'score',
  },
  {
    id: 'q-alheia',
    owner_id: 'u-vendedor',
    name: 'Fila alheia',
    priority_strategy: 'score',
  },
];

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: auth.userId } }),
}));

vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => ({ isAdmin: auth.isAdmin }),
}));

vi.mock('@/hooks/dialer/usePowerDialer', () => {
  const mutation = () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    variables: undefined,
  });
  return {
    useDialerQueues: () => ({ data: QUEUES, isLoading: false }),
    useNextItem: mutation,
    useRebuildQueue: mutation,
    useDeleteQueue: mutation,
    useQueueStats: () => ({ data: undefined }),
  };
});

vi.mock('@/components/dialer/QueueBuilderDialog', () => ({
  QueueBuilderDialog: () => null,
}));
vi.mock('@/components/dialer/CurrentCallCard', () => ({
  CurrentCallCard: () => null,
}));
vi.mock('@/components/dialer/CallDispositionForm', () => ({
  CallDispositionForm: () => null,
}));

const renderPage = () =>
  render(
    <HelmetProvider>
      <PowerDialer />
    </HelmetProvider>
  );

describe('PowerDialer — permissão de editar/excluir fila', () => {
  beforeEach(() => {
    auth.userId = 'u-gestor';
    auth.isAdmin = false;
  });

  it('usuário não admin (ex.: gestor) só vê Editar/Excluir nas próprias filas', () => {
    renderPage();
    expect(screen.getByLabelText('Editar fila Fila própria')).toBeInTheDocument();
    expect(screen.getByLabelText('Excluir fila Fila própria')).toBeInTheDocument();
    expect(screen.queryByLabelText('Editar fila Fila alheia')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Excluir fila Fila alheia')).not.toBeInTheDocument();
  });

  it('admin vê Editar/Excluir em todas as filas', () => {
    auth.userId = 'u-admin';
    auth.isAdmin = true;
    renderPage();
    for (const nome of ['Fila própria', 'Fila alheia']) {
      expect(screen.getByLabelText(`Editar fila ${nome}`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Excluir fila ${nome}`)).toBeInTheDocument();
    }
  });
});
