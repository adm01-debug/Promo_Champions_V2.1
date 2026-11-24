import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const data = vi.hoisted(() => ({
  entry: {
    id: 'chat-1',
    question: 'Qual o proximo passo com este cliente?',
    question_type: 'general',
    created_at: '2026-11-20T10:00:00.000Z',
  },
  mutate: vi.fn(),
  setFilterType: vi.fn(),
}));

vi.mock('@/hooks/useDealChatHistory', () => ({
  QUESTION_TYPES: [{ value: 'general', label: 'Geral' }],
  useDealChatHistory: () => ({
    history: [data.entry],
    allHistory: [data.entry],
    isLoading: false,
    deleteEntry: { mutate: data.mutate, isPending: false },
    filterType: 'all',
    setFilterType: data.setFilterType,
  }),
}));

const { DealChatHistory } = await import('./DealChatHistory');

function renderHistory() {
  return render(
    <DealChatHistory dealId="deal-1" clientName="Maria" onSelectQuestion={() => {}} />
  );
}

describe('DealChatHistory — apagar pergunta', () => {
  beforeEach(() => {
    data.mutate.mockReset();
  });

  it('pede confirmacao antes de apagar e so apaga no confirmar', async () => {
    renderHistory();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir conversa' }));

    await screen.findByRole('alertdialog');
    expect(data.mutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(data.mutate).toHaveBeenCalledTimes(1);
    expect(data.mutate).toHaveBeenCalledWith('chat-1', expect.anything());
  });

  it('cancelar mantem a pergunta no historico', async () => {
    renderHistory();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir conversa' }));
    await screen.findByRole('alertdialog');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(data.mutate).not.toHaveBeenCalled();
  });
});
