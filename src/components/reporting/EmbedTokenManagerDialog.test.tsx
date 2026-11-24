import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const data = vi.hoisted(() => ({
  token: {
    id: 'tk-1',
    token: 'abc123token',
    revoked: false,
    view_count: 3,
    expires_at: null,
    created_at: '2026-11-01T00:00:00.000Z',
  },
  revoke: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@/hooks/reporting/useReportEmbedTokens', () => ({
  useReportEmbedTokens: () => ({ data: [data.token], isLoading: false }),
  useCreateReportEmbedToken: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRevokeReportEmbedToken: () => ({ mutate: data.revoke, isPending: false }),
  useDeleteReportEmbedToken: () => ({ mutate: data.remove, isPending: false }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { EmbedTokenManagerDialog } = await import('./EmbedTokenManagerDialog');

function renderDialog() {
  return render(
    <EmbedTokenManagerDialog open onOpenChange={() => {}} reportId="report-1" />
  );
}

describe('EmbedTokenManagerDialog — revogar e excluir token', () => {
  beforeEach(() => {
    data.revoke.mockReset();
    data.remove.mockReset();
  });

  it('pede confirmacao antes de revogar o link publico', async () => {
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Revogar' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(data.revoke).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Revogar' }));

    expect(data.revoke).toHaveBeenCalledTimes(1);
    expect(data.revoke).toHaveBeenCalledWith(
      { id: 'tk-1', report_id: 'report-1' },
      expect.anything()
    );
  });

  it('pede confirmacao antes de excluir o token e cancelar nao apaga', async () => {
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir token' }));
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(data.remove).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir token' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    expect(data.remove).toHaveBeenCalledTimes(1);
    expect(data.remove).toHaveBeenCalledWith(
      { id: 'tk-1', report_id: 'report-1' },
      expect.anything()
    );
  });
});
