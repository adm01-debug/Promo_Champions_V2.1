import { FC, useState } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

interface FeedCommentOwnerActionsProps {
  content: string;
  /** Resolve após salvar; rejeita em erro (o toast fica no hook). */
  onUpdate: (content: string) => Promise<unknown>;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/** Editar/excluir o próprio comentário do feed de vitórias. */
export const FeedCommentOwnerActions: FC<FeedCommentOwnerActionsProps> = ({
  content,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState(content);

  const trimmed = draft.trim();
  const canSave = !!trimmed && trimmed !== content && !isUpdating;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await onUpdate(trimmed);
      setEditOpen(false);
    } catch {
      // Mantém o diálogo aberto; o erro já é exibido via toast pelo hook.
    }
  };

  return (
    <div className="flex items-center gap-0.5 ml-auto shrink-0">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-muted-foreground hover:text-primary"
        aria-label="Editar comentário"
        onClick={() => {
          setDraft(content);
          setEditOpen(true);
        }}
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-muted-foreground hover:text-destructive"
        aria-label="Excluir comentário"
        disabled={isDeleting}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      <Dialog open={editOpen} onOpenChange={open => !isUpdating && setEditOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar comentário</DialogTitle>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
            aria-label="Texto do comentário"
            disabled={isUpdating}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={!canSave}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDelete}
        title="Excluir comentário?"
        description="O comentário será removido do feed de vitórias. Esta ação não pode ser desfeita."
        isDeleting={isDeleting}
      />
    </div>
  );
};
