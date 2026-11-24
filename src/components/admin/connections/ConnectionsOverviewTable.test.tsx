import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hooks = vi.hoisted(() => ({
  list: { data: [] as unknown[], isLoading: false },
  health: { data: [] as unknown[] },
  del: { mutate: vi.fn(), isPending: false },
  update: { mutate: vi.fn(), isPending: false },
  test: { mutate: vi.fn(), isPending: false },
}));

vi.mock('@/hooks/admin/useIntegrationConnections', () => ({
  useIntegrationConnections: () => hooks.list,
  useIntegrationHealth: () => hooks.health,
  useTestConnection: () => hooks.test,
  useUpdateConnection: () => hooks.update,
  useDeleteConnection: () => hooks.del,
}));

vi.mock('./useCredentialsSource', () => ({
  useCredentialsSource: () => ({ source: 'all', setSource: vi.fn() }),
}));

import { ConnectionsOverviewTable } from './ConnectionsOverviewTable';

const conn = {
  id: 'c-1',
  kind: 'database',
  label: 'Banco principal',
  config: {},
  secret_refs: [],
  source: 'db',
  enabled: true,
  created_by: null,
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

describe('ConnectionsOverviewTable (confirmação de remoção)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.list = { data: [], isLoading: false };
    hooks.health = { data: [] };
    hooks.del = { mutate: vi.fn(), isPending: false };
    hooks.update = { mutate: vi.fn(), isPending: false };
    hooks.test = { mutate: vi.fn(), isPending: false };
  });

  it('não remove a conexão antes da confirmação', async () => {
    hooks.list = { data: [conn], isLoading: false };
    render(<ConnectionsOverviewTable />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Remover conexão Banco principal' })
    );

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain('Banco principal');
    expect(hooks.del.mutate).not.toHaveBeenCalled();
  });

  it('remove a conexão ao confirmar', async () => {
    hooks.list = { data: [conn], isLoading: false };
    render(<ConnectionsOverviewTable />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Remover conexão Banco principal' })
    );
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(hooks.del.mutate).toHaveBeenCalledTimes(1));
    expect(hooks.del.mutate.mock.calls[0][0]).toBe('c-1');
  });
});
