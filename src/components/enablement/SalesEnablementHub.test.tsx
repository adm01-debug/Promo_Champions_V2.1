import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EnablementAsset } from '@/hooks/sales/useSalesEnablement';

const useEnablementAssets = vi.fn();
const restoreMutate = vi.fn();
let isAdminOrManager = true;

const asset = (over: Partial<EnablementAsset>): EnablementAsset => ({
  id: 'material-1',
  title: 'Proposta padrão',
  description: null,
  category: 'proposal',
  asset_type: 'document',
  file_url: null,
  thumbnail_url: null,
  tags: [],
  funnel_stage: null,
  is_active: true,
  view_count: 3,
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
  ...over,
});

const idleMutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };

vi.mock('@/hooks/sales/useSalesEnablement', () => ({
  useEnablementAssets: (...args: unknown[]) => useEnablementAssets(...args),
  useLogAssetUsage: () => idleMutation,
  useCreateAsset: () => idleMutation,
  useUpdateAsset: () => idleMutation,
  useArchiveAsset: () => idleMutation,
  useRestoreAsset: () => ({ mutate: restoreMutate, isPending: false }),
  usePlaybooks: () => ({ data: [], isLoading: false }),
  useAssetEfficiency: () => ({ data: undefined }),
}));

vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => ({ isAdminOrManager }),
}));

const { SalesEnablementHub } = await import('./SalesEnablementHub');

describe('SalesEnablementHub — materiais arquivados', () => {
  beforeEach(() => {
    isAdminOrManager = true;
    restoreMutate.mockClear();
    useEnablementAssets.mockReset();
    useEnablementAssets.mockImplementation((_category: string, archived: boolean) => ({
      data: archived
        ? [asset({ id: 'material-2', title: 'Case antigo', is_active: false })]
        : [asset({})],
      isLoading: false,
    }));
  });

  it('gestor alterna para Arquivados e reativa o material', () => {
    render(<SalesEnablementHub />);
    expect(useEnablementAssets).toHaveBeenLastCalledWith('all', false);
    expect(screen.getByText('Proposta padrão')).toBeInTheDocument();
    expect(screen.getByLabelText('Arquivar material')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Arquivados'));

    expect(useEnablementAssets).toHaveBeenLastCalledWith('all', true);
    expect(screen.getByText('Case antigo')).toBeInTheDocument();
    expect(screen.queryByLabelText('Arquivar material')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Editar material')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reativar/ }));
    expect(restoreMutate).toHaveBeenCalledWith('material-2');
  });

  it('vendedor não vê o filtro de arquivados nem ações de gestão', () => {
    isAdminOrManager = false;
    render(<SalesEnablementHub />);
    expect(screen.queryByText('Arquivados')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Arquivar material')).not.toBeInTheDocument();
    expect(useEnablementAssets).toHaveBeenLastCalledWith('all', false);
  });

  it('mostra estado vazio honesto quando não há arquivados', () => {
    useEnablementAssets.mockImplementation((_category: string, archived: boolean) => ({
      data: archived ? [] : [asset({})],
      isLoading: false,
    }));
    render(<SalesEnablementHub />);
    fireEvent.click(screen.getByText('Arquivados'));
    expect(
      screen.getByText('Nenhum material arquivado nesta categoria.')
    ).toBeInTheDocument();
  });
});
