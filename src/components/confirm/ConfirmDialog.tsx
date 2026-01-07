import { FC, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: ConfirmVariant;
  loading?: boolean;
}

const variantConfig: Record<ConfirmVariant, { icon: typeof AlertTriangle; buttonClass: string }> = {
  danger: { icon: Trash2, buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
  warning: { icon: AlertTriangle, buttonClass: 'bg-yellow-500 text-white hover:bg-yellow-600' },
  info: { icon: Info, buttonClass: 'bg-blue-500 text-white hover:bg-blue-600' },
  success: { icon: CheckCircle, buttonClass: 'bg-green-500 text-white hover:bg-green-600' }
};

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  variant = 'danger',
  loading = false
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(config.buttonClass)}
            disabled={loading}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface DeleteConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void;
  loading?: boolean;
}

export const DeleteConfirm: FC<DeleteConfirmProps> = ({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  loading
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Excluir item"
    description={`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`}
    confirmLabel="Excluir"
    onConfirm={onConfirm}
    variant="danger"
    loading={loading}
  />
);

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesDialog: FC<UnsavedChangesDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  onDiscard
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
        <AlertDialogDescription>
          Você tem alterações não salvas. O que deseja fazer?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
        <AlertDialogCancel onClick={onDiscard}>
          Descartar
        </AlertDialogCancel>
        <AlertDialogAction onClick={onSave}>
          Salvar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
