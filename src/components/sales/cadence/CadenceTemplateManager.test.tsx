import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const hooks = vi.hoisted(() => ({
  query: {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  create: { mutate: vi.fn(), isPending: false },
  update: { mutate: vi.fn(), isPending: false },
  remove: { mutate: vi.fn(), reset: vi.fn(), isPending: false, isError: false },
  salesperson: { id: 'sp-1' } as { id: string } | null,
}));

vi.mock('@/hooks/useMultichannel', () => ({
  useMessageTemplates: () => hooks.query,
  useCreateTemplate: () => hooks.create,
  useUpdateTemplate: () => hooks.update,
  useDeleteTemplate: () => hooks.remove,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ salesperson: hooks.salesperson }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'sonner';
import { CadenceTemplateManager } from './CadenceTemplateManager';

const template = {
  id: 'tpl-1',
  salesperson_id: 'sp-1',
  name: 'Retorno de proposta',
  channel: 'whatsapp',
  subject: null,
  body: 'Oi {{singu_lead_name}}, tudo certo com a proposta?',
  variables: ['singu_lead_name'],
  category: 'geral',
  is_active: true,
  usage_count: 0,
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

function fillForm(name: string, body: string) {
  fireEvent.change(screen.getByPlaceholderText('Ex: Boas vindas - VIP'), {
    target: { value: name },
  });
  fireEvent.change(screen.getByPlaceholderText(/Olá \{\{singu_lead_name\}\}/), {
    target: { value: body },
  });
}

describe('CadenceTemplateManager (message_templates)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.query = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
    hooks.salesperson = { id: 'sp-1' };
    hooks.remove = { mutate: vi.fn(), reset: vi.fn(), isPending: false, isError: false };
  });

  it('mostra estado vazio sem template fictício', () => {
    render(<CadenceTemplateManager />);
    expect(screen.getByText('Nenhum template cadastrado.')).toBeTruthy();
    expect(screen.queryByText('Follow-up Interesse Alto')).toBeNull();
  });

  it('mostra erro com opção de tentar novamente', () => {
    hooks.query = { data: [], isLoading: false, isError: true, refetch: vi.fn() };
    render(<CadenceTemplateManager />);
    expect(screen.getByText('Não foi possível carregar os templates.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(hooks.query.refetch).toHaveBeenCalled();
  });

  it('lista os templates reais do banco', () => {
    hooks.query = { ...hooks.query, data: [template] };
    render(<CadenceTemplateManager />);
    expect(screen.getByText('Retorno de proposta')).toBeTruthy();
    expect(screen.queryByText('Aprovação Necessária')).toBeNull();
  });

  it('cria template persistindo via mutation, sem toast falso', () => {
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: /Novo Template/ }));
    fillForm('Boas vindas', 'Olá {{singu_lead_name}}!');
    fireEvent.click(screen.getByRole('button', { name: /Salvar Template/ }));

    expect(hooks.create.mutate).toHaveBeenCalledWith(
      {
        name: 'Boas vindas',
        channel: 'whatsapp',
        body: 'Olá {{singu_lead_name}}!',
        variables: ['singu_lead_name'],
        salesperson_id: 'sp-1',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('não cria template sem vendedor vinculado', () => {
    hooks.salesperson = null;
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: /Novo Template/ }));
    fillForm('Boas vindas', 'Olá!');
    fireEvent.click(screen.getByRole('button', { name: /Salvar Template/ }));

    expect(hooks.create.mutate).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'Seu usuário não está vinculado a um vendedor.'
    );
  });

  it('edita template existente via update', () => {
    hooks.query = { ...hooks.query, data: [template] };
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fillForm('Retorno revisado', 'Texto novo');
    fireEvent.click(screen.getByRole('button', { name: /Salvar Template/ }));

    expect(hooks.update.mutate).toHaveBeenCalledWith(
      {
        id: 'tpl-1',
        name: 'Retorno revisado',
        channel: 'whatsapp',
        body: 'Texto novo',
        variables: [],
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('exclui template via delete no banco somente após confirmação', () => {
    hooks.query = { ...hooks.query, data: [template] };
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir template' }));

    expect(hooks.remove.mutate).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(screen.getByText(/"Retorno de proposta" será excluído/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(hooks.remove.mutate).toHaveBeenCalledWith(
      'tpl-1',
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    // Diálogo continua aberto até o banco confirmar a exclusão.
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('fecha o diálogo de exclusão quando o banco confirma', async () => {
    hooks.query = { ...hooks.query, data: [template] };
    hooks.remove.mutate = vi.fn((_id: string, opts?: { onSuccess?: () => void }) =>
      opts?.onSuccess?.()
    );
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('cancelar a exclusão não apaga nada', async () => {
    hooks.query = { ...hooks.query, data: [template] };
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(hooks.remove.mutate).not.toHaveBeenCalled();
  });

  it('mostra loading e erro no diálogo de exclusão', () => {
    hooks.query = { ...hooks.query, data: [template] };
    const { rerender } = render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir template' }));

    hooks.remove = { ...hooks.remove, isPending: true };
    rerender(<CadenceTemplateManager />);
    expect(
      (screen.getByRole('button', { name: /Excluindo/ }) as HTMLButtonElement).disabled
    ).toBe(true);

    hooks.remove = { ...hooks.remove, isPending: false, isError: true };
    rerender(<CadenceTemplateManager />);
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível excluir o template.'
    );
  });

  it('rotula a pré-visualização como exemplo fictício, sem selo de dado real', () => {
    render(<CadenceTemplateManager />);
    fireEvent.click(screen.getByRole('button', { name: /Novo Template/ }));
    fillForm('Boas vindas', 'Olá {{singu_lead_name}}!');

    expect(screen.getByText('Exemplo com dados fictícios')).toBeTruthy();
    expect(screen.queryByText('Preview Real')).toBeNull();
    expect(screen.queryByText(/Variáveis validadas/)).toBeNull();
  });
});
