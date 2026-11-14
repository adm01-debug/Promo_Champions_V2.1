import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const roleState = { isAdminOrManager: false };

vi.mock('@/hooks/useTasks', () => ({
  useCreateTask: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/hooks/sales/useSalespeople', () => ({
  useSalespeople: () => ({
    data: [
      { id: 'sp-logado', name: 'Vendedor Logado' },
      { id: 'sp-outro', name: 'Outro Vendedor' },
    ],
  }),
}));
vi.mock('@/hooks/crm/useClients', () => ({ useClients: () => ({ data: [] }) }));
vi.mock('@/hooks/sales/useSalesData', () => ({ useSalesData: () => ({ data: [] }) }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ salesperson: { id: 'sp-logado' } }),
}));
vi.mock('@/hooks/useUserRoles', () => ({ useUserRoles: () => roleState }));
// Radix Select só monta as opções com o menu aberto; aqui as opções viram itens simples.
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const { CreateTaskDialog } = await import('./CreateTaskDialog');

describe('CreateTaskDialog — opções de responsável', () => {
  beforeEach(() => {
    roleState.isAdminOrManager = false;
  });

  it('vendedor só pode escolher a si mesmo (a policy recusa outro responsável)', () => {
    render(<CreateTaskDialog open onOpenChange={() => {}} />);

    expect(screen.getByText('Vendedor Logado')).toBeInTheDocument();
    expect(screen.queryByText('Outro Vendedor')).not.toBeInTheDocument();
  });

  it('admin/gestor continua vendo todos os vendedores', () => {
    roleState.isAdminOrManager = true;
    render(<CreateTaskDialog open onOpenChange={() => {}} />);

    expect(screen.getByText('Vendedor Logado')).toBeInTheDocument();
    expect(screen.getByText('Outro Vendedor')).toBeInTheDocument();
  });
});
