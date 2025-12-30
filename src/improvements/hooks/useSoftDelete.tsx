// src/hooks/useSoftDelete.ts
// Hook para Soft Delete
// Data: 2024-12-28

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export type SoftDeleteTable = 
  | 'clients' 
  | 'deals' 
  | 'activities' 
  | 'products' 
  | 'suppliers' 
  | 'teams';

export interface SoftDeleteOptions {
  reason?: string;
  invalidateKeys?: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface DeletedRecord {
  id: string;
  deleted_at: string;
  deleted_by_email: string;
  delete_reason: string | null;
}

// ============================================================================
// HOOK: useSoftDelete
// ============================================================================

export const useSoftDelete = (
  table: SoftDeleteTable,
  options: SoftDeleteOptions = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('soft_delete_record', {
        p_table_name: table,
        p_record_id: id,
        p_user_id: user.id,
        p_reason: reason || options.reason || null,
      });

      if (error) throw error;
      if (!data) throw new Error('Falha ao deletar registro');

      return { id, deleted: true };
    },

    onSuccess: (result) => {
      // Invalidar queries relacionadas
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
      queryClient.invalidateQueries({ queryKey: [table] });

      // Toast com ação de desfazer
      toast.success('Item excluído', {
        description: 'O item foi movido para lixeira',
        action: {
          label: 'Desfazer',
          onClick: () => restoreSoftDelete(table, result.id),
        },
        duration: 5000,
      });

      options.onSuccess?.();
    },

    onError: (error: Error) => {
      console.error(`Soft delete error (${table}):`, error);
      toast.error('Erro ao excluir item', {
        description: error.message,
      });
      options.onError?.(error);
    },
  });
};

// ============================================================================
// HOOK: useRestoreDeleted
// ============================================================================

export const useRestoreDeleted = (
  table: SoftDeleteTable,
  options: Omit<SoftDeleteOptions, 'reason'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('restore_deleted_record', {
        p_table_name: table,
        p_record_id: id,
        p_user_id: user.id,
      });

      if (error) throw error;
      if (!data) throw new Error('Falha ao restaurar registro');

      return { id, restored: true };
    },

    onSuccess: () => {
      // Invalidar queries
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
      queryClient.invalidateQueries({ queryKey: [table] });

      toast.success('Item restaurado', {
        description: 'O item foi restaurado com sucesso',
      });

      options.onSuccess?.();
    },

    onError: (error: Error) => {
      console.error(`Restore error (${table}):`, error);
      toast.error('Erro ao restaurar item', {
        description: error.message,
      });
      options.onError?.(error);
    },
  });
};

// ============================================================================
// HOOK: useDeletedRecords
// ============================================================================

export const useDeletedRecords = (
  table: SoftDeleteTable,
  limit: number = 50
) => {
  return useQuery({
    queryKey: ['deleted-records', table, limit],
    queryFn: async (): Promise<DeletedRecord[]> => {
      const { data, error } = await supabase.rpc('get_deleted_records', {
        p_table_name: table,
        p_limit: limit,
      });

      if (error) throw error;
      return data || [];
    },
  });
};

// ============================================================================
// HELPER: restoreSoftDelete (função standalone)
// ============================================================================

async function restoreSoftDelete(table: SoftDeleteTable, id: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase.rpc('restore_deleted_record', {
      p_table_name: table,
      p_record_id: id,
      p_user_id: user.id,
    });

    if (error) throw error;

    toast.success('Item restaurado');
    
    // Recarregar página para atualizar UI
    window.location.reload();
  } catch (error) {
    console.error('Restore error:', error);
    toast.error('Erro ao restaurar item');
  }
}

// ============================================================================
// COMPONENTE: DeleteButton com Soft Delete
// ============================================================================

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface DeleteButtonProps {
  table: SoftDeleteTable;
  id: string;
  itemName: string;
  onDeleted?: () => void;
  requireReason?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  table,
  id,
  itemName,
  onDeleted,
  requireReason = false,
}) => {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  const { mutate: softDelete, isPending } = useSoftDelete(table, {
    onSuccess: () => {
      setOpen(false);
      setReason('');
      onDeleted?.();
    },
  });

  const handleDelete = () => {
    if (requireReason && !reason.trim()) {
      toast.error('Por favor, informe o motivo da exclusão');
      return;
    }

    softDelete({ id, reason: reason || undefined });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{itemName}</strong>?
            <br />
            O item será movido para a lixeira e poderá ser restaurado posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireReason && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Motivo da exclusão:
            </label>
            <Textarea
              placeholder="Informe o motivo da exclusão..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ============================================================================
// COMPONENTE: RecycleBin (Lixeira)
// ============================================================================

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RotateCcw } from 'lucide-react';

interface RecycleBinProps {
  table: SoftDeleteTable;
  isOpen: boolean;
  onClose: () => void;
}

export const RecycleBin: React.FC<RecycleBinProps> = ({
  table,
  isOpen,
  onClose,
}) => {
  const { data: deletedRecords, isLoading } = useDeletedRecords(table);
  const { mutate: restore, isPending } = useRestoreDeleted(table);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Lixeira - {table}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : deletedRecords && deletedRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Deletado há</TableHead>
                <TableHead>Deletado por</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">
                    {record.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(record.deleted_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{record.deleted_by_email}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.delete_reason || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restore(record.id)}
                      disabled={isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum item na lixeira
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default useSoftDelete;
