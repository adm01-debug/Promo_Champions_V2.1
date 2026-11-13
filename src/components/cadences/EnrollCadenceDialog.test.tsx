import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateAsync = vi.fn().mockResolvedValue({});
const roles = { isAdminOrManager: false };

vi.mock('@/hooks/useCadences', () => ({
  useCadences: () => ({
    data: [{ id: 'cad-1', name: 'Cadência Teste', is_active: true }],
  }),
  useCadenceSteps: () => ({ data: [] }),
  useEnrollInCadence: () => ({ mutateAsync, isPending: false }),
}));

vi.mock('@/hooks/sales/useSalespeople', () => ({
  useSalespeople: () => ({
    data: [
      { id: 'sp-eu', name: 'Eu Vendedor' },
      { id: 'sp-colega', name: 'Colega' },
    ],
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ salesperson: { id: 'sp-eu', name: 'Eu Vendedor' } }),
}));

vi.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: () => roles,
}));

vi.mock('./CadenceCard', () => ({
  CadenceCard: ({
    cadence,
    onSelect,
  }: {
    cadence: { name: string };
    onSelect: () => void;
  }) => (
    <button type="button" onClick={onSelect}>
      {cadence.name}
    </button>
  ),
}));

// Select nativo para inspecionar as opções sem depender do portal do Radix.
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    children: ReactNode;
  }) => (
    <select
      aria-label="Responsável"
      value={value}
      onChange={e => onValueChange(e.target.value)}
    >
      <option value="" />
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

const { EnrollCadenceDialog } = await import('./EnrollCadenceDialog');

function abrirDialogo() {
  render(<EnrollCadenceDialog saleId="sale-1" clientName="Cliente X" />);
  fireEvent.click(screen.getByRole('button', { name: /Iniciar Cadência/ }));
}

describe('EnrollCadenceDialog — responsável da inscrição', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
    roles.isAdminOrManager = false;
  });

  it('vendedor sem escolher responsável inscreve com o próprio salesperson_id', async () => {
    abrirDialogo();
    fireEvent.click(screen.getByRole('button', { name: 'Cadência Teste' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Iniciar Cadência' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith({
      sale_id: 'sale-1',
      cadence_id: 'cad-1',
      salesperson_id: 'sp-eu',
    });
  });

  it('vendedor só vê a si mesmo na lista de responsáveis', () => {
    abrirDialogo();
    const select = screen.getByRole('combobox', { name: 'Responsável' });
    expect(within(select).queryByRole('option', { name: 'Colega' })).toBeNull();
    expect(
      within(select).getByRole('option', { name: 'Eu Vendedor' })
    ).toBeInTheDocument();
    expect(select).toHaveValue('sp-eu');
  });

  it('admin/gestor continua vendo todos os vendedores', () => {
    roles.isAdminOrManager = true;
    abrirDialogo();
    const select = screen.getByRole('combobox', { name: 'Responsável' });
    expect(within(select).getByRole('option', { name: 'Colega' })).toBeInTheDocument();
    expect(
      within(select).getByRole('option', { name: 'Eu Vendedor' })
    ).toBeInTheDocument();
  });
});
