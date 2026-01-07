import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function InlineConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'p-4 rounded-lg border shadow-lg bg-background',
            variant === 'destructive' && 'border-destructive/50'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-full',
                variant === 'destructive'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              )}
            >
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isConfirming || loading}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              size="sm"
              onClick={handleConfirm}
              disabled={isConfirming || loading}
              loading={isConfirming || loading}
              className="h-8"
            >
              <Check className="h-3 w-3 mr-1" />
              {confirmText}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing confirmation state
export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

  const requestConfirmation = useCallback((action: () => void | Promise<void>) => {
    setPendingAction(() => action);
    setIsOpen(true);
  }, []);

  const confirm = useCallback(async () => {
    if (pendingAction) {
      await pendingAction();
    }
    setIsOpen(false);
    setPendingAction(null);
  }, [pendingAction]);

  const cancel = useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isOpen,
    requestConfirmation,
    confirm,
    cancel,
  };
}
