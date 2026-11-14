import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  // Cadeia do soft-delete: from('activities').update().eq().is().select('id')
  const select = vi.fn();
  const is = vi.fn(() => ({ select }));
  const eq = vi.fn(() => ({ is }));
  const update = vi.fn(() => ({ eq }));
  // Cadeia do histórico: from('activity_audit_logs').select().eq().order()
  const order = vi.fn();
  const auditEq = vi.fn(() => ({ order }));
  const auditSelect = vi.fn(() => ({ eq: auditEq }));
  const from = vi.fn((table: string) =>
    table === 'activity_audit_logs' ? { select: auditSelect } : { update }
  );
  const getUser = vi.fn();
  return { select, is, eq, update, order, auditEq, auditSelect, from, getUser };
});

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mocks.from, auth: { getUser: mocks.getUser } },
}));
vi.mock('@/hooks/semantic/useIndexEntity', () => ({
  useIndexEntity: () => ({ index: vi.fn() }),
}));
vi.mock('sonner', () => ({ toast }));

const { ActivityItemRow } = await import('./ActivityItemRow');

const activity = {
  id: 'act-1',
  activity_type: 'call' as const,
  outcome: 'connected' as const,
  contact_name: 'Maria',
  notes: null,
  duration_minutes: null,
  created_at: '2026-11-01T10:00:00.000Z',
  salesperson_id: 'sp-1',
};

function renderRow() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return render(createElement(ActivityItemRow, { activity }), { wrapper });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

async function openDeleteAndConfirm() {
  fireEvent.click(screen.getByRole('button', { name: 'Excluir atividade' }));
  await screen.findByRole('alertdialog');
  fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
}

describe('ActivityItemRow — exclusão', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  it('mantém o diálogo aberto com "Excluindo..." enquanto a exclusão está pendente e fecha no sucesso', async () => {
    const pending = deferred<{ data: { id: string }[]; error: null }>();
    mocks.select.mockReturnValue(pending.promise);
    renderRow();

    await openDeleteAndConfirm();

    expect(await screen.findByText('Excluindo...')).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    pending.resolve({ data: [{ id: 'act-1' }], error: null });

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    );
    expect(toast.success).toHaveBeenCalledWith('Atividade excluída');
  });

  it('mantém o diálogo aberto e mostra o erro quando a exclusão falha', async () => {
    mocks.select.mockResolvedValue({ data: null, error: new Error('falhou') });
    renderRow();

    await openDeleteAndConfirm();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Erro ao excluir atividade: falhou')
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).not.toBeDisabled();
  });
});

describe('ActivityItemRow — histórico de alterações', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lê activity_audit_logs da atividade e lista as alterações', async () => {
    mocks.order.mockResolvedValue({
      data: [
        {
          id: 'log-1',
          activity_id: 'act-1',
          action: 'UPDATE',
          old_data: { outcome: 'no_answer' },
          new_data: { outcome: 'connected' },
          created_at: '2026-11-02T10:00:00.000Z',
          changed_by: 'user-1',
        },
      ],
      error: null,
    });
    const { container } = renderRow();

    const historyButton = container.querySelector('button:not([aria-label])');
    expect(historyButton).not.toBeNull();
    fireEvent.click(historyButton as HTMLButtonElement);

    expect(await screen.findByText('UPDATE')).toBeInTheDocument();
    expect(mocks.from).toHaveBeenCalledWith('activity_audit_logs');
    expect(mocks.auditEq).toHaveBeenCalledWith('activity_id', 'act-1');
  });

  it('mostra erro (e não "Nenhuma alteração registrada") quando a leitura falha', async () => {
    mocks.order.mockResolvedValue({ data: null, error: new Error('rls') });
    const { container } = renderRow();

    fireEvent.click(
      container.querySelector('button:not([aria-label])') as HTMLButtonElement
    );

    expect(
      await screen.findByText('Não foi possível carregar o histórico')
    ).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma alteração registrada')).not.toBeInTheDocument();
  });
});
