import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const data = vi.hoisted(() => ({
  flag: {
    id: 'flag-1',
    key: 'nova_ui_vendas',
    description: 'Liga a nova interface de vendas',
    is_enabled: true,
    rollout_percentage: 50,
    created_at: '2026-11-01T00:00:00.000Z',
    updated_at: '2026-11-01T00:00:00.000Z',
  },
  deleteMutate: vi.fn(),
  updateMutate: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/hooks/useFeatureFlagsAdmin', () => ({
  useAdminFeatureFlags: () => ({ data: [data.flag], isLoading: false }),
  useCreateFeatureFlag: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateFeatureFlag: () => ({ mutate: data.updateMutate, isPending: false }),
  useDeleteFeatureFlag: () => ({ mutate: data.deleteMutate, isPending: false }),
}));

const { FeatureFlagsAdmin } = await import('./FeatureFlagsAdmin');

describe('FeatureFlagsAdmin — excluir flag', () => {
  beforeEach(() => {
    data.deleteMutate.mockReset();
  });

  it('pede confirmacao citando a chave antes de excluir a flag', async () => {
    render(<FeatureFlagsAdmin />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir flag nova_ui_vendas' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain('nova_ui_vendas');
    expect(data.deleteMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(data.deleteMutate).toHaveBeenCalledTimes(1);
    expect(data.deleteMutate).toHaveBeenCalledWith('flag-1', expect.anything());
  });

  it('cancelar nao exclui a flag', async () => {
    render(<FeatureFlagsAdmin />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir flag nova_ui_vendas' }));
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(data.deleteMutate).not.toHaveBeenCalled();
  });
});
