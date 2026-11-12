import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Account } from '@/hooks/abm/useAccounts';

const account: Account = {
  id: 'acc-1',
  name: 'Conta Alfa',
  parent_account_id: null,
  industry: 'Varejo',
  tier: 'enterprise',
  annual_revenue: 1000,
  employee_count: 50,
  website: null,
  country: null,
  account_score: 70,
  health_status: 'healthy',
  owner_id: 'sp-1',
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const updateMutate = vi.fn();
const deleteMutate = vi.fn();
const mutation = (mutate = vi.fn()) => ({ mutate, isPending: false });
let isAdminOrManager = false;

vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => ({ isAdminOrManager }),
}));

vi.mock('@/hooks/abm/useAccounts', () => ({
  useAccounts: () => ({ data: [account], isLoading: false }),
  useAccountContacts: () => ({ data: [] }),
  useAccountPlan: () => ({ data: null, isLoading: false }),
  useUpdateAccountPlan: () => mutation(),
  useCreateAccount: () => mutation(),
  useUpdateAccount: () => mutation(updateMutate),
  useDeleteAccount: () => mutation(deleteMutate),
  useCreateContact: () => mutation(),
  useRecalculateAccountScore: () => mutation(),
}));

const { default: AccountBasedSelling } = await import('./AccountBasedSelling');

function renderPage() {
  render(
    <HelmetProvider>
      <AccountBasedSelling />
    </HelmetProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: /Conta Alfa/ }));
}

describe('AccountBasedSelling — editar/excluir conta', () => {
  beforeEach(() => {
    updateMutate.mockReset();
    deleteMutate.mockReset();
  });

  it('vendedor (dono) vê Editar mas não vê Excluir', () => {
    isAdminOrManager = false;
    renderPage();

    expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Excluir/ })).not.toBeInTheDocument();
  });

  it('dono edita a conta: envia id e campos do formulário', () => {
    isAdminOrManager = false;
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Editar/ }));
    expect(screen.getByText('Editar Conta')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateMutate).toHaveBeenCalledWith(
      {
        id: 'acc-1',
        name: 'Conta Alfa',
        tier: 'enterprise',
        industry: 'Varejo',
        annual_revenue: 1000,
        employee_count: 50,
      },
      expect.any(Object)
    );
  });

  it('admin/gestor vê Excluir, com aviso da cascata, e confirma a exclusão', () => {
    isAdminOrManager = true;
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Excluir/ }));
    expect(screen.getByText(/Customer Success/)).toBeInTheDocument();
    expect(screen.getByText(/renovações, tickets de suporte/)).toBeInTheDocument();

    const confirm = screen
      .getAllByRole('button', { name: 'Excluir' })
      .find(b => b.closest('[role="alertdialog"]'));
    expect(confirm).toBeDefined();
    fireEvent.click(confirm!);

    expect(deleteMutate).toHaveBeenCalledWith('acc-1', expect.any(Object));
  });
});
