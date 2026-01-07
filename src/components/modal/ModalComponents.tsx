import { FC, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const BaseModal: FC<BaseModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn("sm:max-w-md", className)}>
      {(title || description) && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      {children}
    </DialogContent>
  </Dialog>
);

interface ActionModalProps extends BaseModalProps {
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: 'default' | 'destructive';
}

export const ActionModal: FC<ActionModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  variant = 'default',
  className
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn("sm:max-w-md", className)}>
      <DialogHeader>
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading ? "Aguarde..." : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface FullscreenModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const FullscreenModal: FC<FullscreenModalProps> = ({
  open,
  onClose,
  title,
  children
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-4 overflow-auto h-[calc(100vh-65px)]">
        {children}
      </div>
    </div>
  );
};

interface DrawerModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
}

export const DrawerModal: FC<DrawerModalProps> = ({
  open,
  onClose,
  title,
  children,
  side = 'right'
}) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className={cn(
        "fixed top-0 z-50 h-full w-80 bg-background shadow-xl transition-transform",
        side === 'right' ? 'right-0' : 'left-0'
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          {title && <h2 className="font-semibold">{title}</h2>}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-65px)]">
          {children}
        </div>
      </div>
    </>
  );
};
