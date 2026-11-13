import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/hooks/useMultichannel', () => {
  const mutation = { mutate: vi.fn(), isPending: false };
  return {
    useMessageTemplates: () => ({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
    useCreateTemplate: () => mutation,
    useUpdateTemplate: () => mutation,
    useDeleteTemplate: () => mutation,
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ salesperson: { id: 'sp-1' } }),
}));

import { ApprovalQueue } from './ApprovalQueue';
import { CadenceTemplateManager } from './CadenceTemplateManager';

describe('Filas de aprovação de cadência', () => {
  it('ApprovalQueue mostra estado vazio sem leads fictícios nem botões falsos', () => {
    render(<ApprovalQueue />);
    expect(screen.getByText('Nenhuma mensagem aguardando aprovação.')).toBeTruthy();
    expect(screen.queryByText('Gabriel Medeiros')).toBeNull();
    expect(screen.queryByText('Juliana Silva')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('aba Fila de Aprovação do gerenciador não exibe itens fictícios', () => {
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Fila de Aprovação' }));
    expect(screen.getByText('Nenhuma ação aguardando aprovação.')).toBeTruthy();
    expect(screen.queryByText('Ana Silva')).toBeNull();
    expect(screen.queryByText('Bruno Costa')).toBeNull();
    expect(screen.queryByRole('button', { name: /Aprovar/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Rejeitar/ })).toBeNull();
  });
});
