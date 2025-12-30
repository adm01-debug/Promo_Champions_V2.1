import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UndoToastProps {
  message: string;
  show: boolean;
  duration?: number;
  onUndo: () => void;
  onDismiss: () => void;
  className?: string;
}

export const UndoToast: FC<UndoToastProps> = ({
  message,
  show,
  duration = 5000,
  onUndo,
  onDismiss,
  className
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!show) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [show, duration, onDismiss]);

  const handleUndo = () => {
    onUndo();
    onDismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className={cn(
            "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
            "min-w-[300px] max-w-[90vw]",
            className
          )}
        >
          <div className="relative glass rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-primary"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />

            <div className="flex items-center gap-3 p-4">
              <span className="flex-1 text-sm font-medium">{message}</span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  className="gap-1.5 text-primary hover:text-primary"
                >
                  <Undo2 className="h-4 w-4" />
                  Desfazer
                </Button>
                
                <button
                  onClick={onDismiss}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for undo functionality
export const useUndoToast = <T,>() => {
  const [state, setState] = useState<{
    show: boolean;
    message: string;
    data: T | null;
    undoFn: (() => void) | null;
  }>({
    show: false,
    message: '',
    data: null,
    undoFn: null
  });

  const showUndo = (message: string, data: T, undoFn: () => void) => {
    setState({
      show: true,
      message,
      data,
      undoFn
    });
  };

  const handleUndo = () => {
    if (state.undoFn) {
      state.undoFn();
    }
  };

  const handleDismiss = () => {
    setState(prev => ({ ...prev, show: false }));
  };

  return {
    show: state.show,
    message: state.message,
    data: state.data,
    showUndo,
    handleUndo,
    handleDismiss,
    UndoToastComponent: () => (
      <UndoToast
        show={state.show}
        message={state.message}
        onUndo={handleUndo}
        onDismiss={handleDismiss}
      />
    )
  };
};
