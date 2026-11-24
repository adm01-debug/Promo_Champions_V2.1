import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

import { PlaybookItemRow } from './PlaybookItemRow';
import type { PlaybookItem } from '@/hooks/usePlaybooks';

const item: PlaybookItem = {
  id: 'pb-1',
  playbook_id: 'play-1',
  content: 'Ligar em 5 minutos apos o lead responder',
  item_order: 1,
  is_required: true,
  item_type: 'task',
  created_at: '2026-01-01T00:00:00Z',
};

describe('PlaybookItemRow - confirmacao de exclusao', () => {
  const onDelete = vi.fn();
  const onUpdate = vi.fn();

  beforeEach(() => {
    onDelete.mockReset();
    onUpdate.mockReset();
  });

  it('pede confirmacao antes de remover o item', async () => {
    render(<PlaybookItemRow item={item} onDelete={onDelete} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir', hidden: false }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('pb-1'));
  });
});
