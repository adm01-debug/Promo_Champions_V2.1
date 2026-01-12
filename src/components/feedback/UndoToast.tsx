import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UndoToastProps {
  message: string;
  duration?: number;
  onUndo: () => void;
  onDismiss: () => void;
  className?: string;
}

export function UndoToast({
  message,
  duration = 5000,
  onUndo,
  onDismiss,
  className
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onDismiss, isPaused]);

  const handleUndo = () => {
    onUndo();
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "bg-foreground text-background rounded-xl shadow-2xl",
        "min-w-[300px] max-w-[400px] overflow-hidden",
        className
      )}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="text-background hover:bg-background/20 gap-1.5"
          >
            <Undo2 className="h-4 w-4" />
            Desfazer
          </Button>
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-background/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-background/20">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

// Hook to manage undo toast state
export function useUndoToast() {
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    onUndo: () => void;
  } | null>(null);

  const showUndoToast = useCallback((message: string, onUndo: () => void) => {
    setToast({
      id: crypto.randomUUID(),
      message,
      onUndo,
    });
  }, []);

  const hideUndoToast = useCallback(() => {
    setToast(null);
  }, []);

  const UndoToastContainer = () => (
    <AnimatePresence>
      {toast && (
        <UndoToast
          key={toast.id}
          message={toast.message}
          onUndo={toast.onUndo}
          onDismiss={hideUndoToast}
        />
      )}
    </AnimatePresence>
  );

  return {
    showUndoToast,
    hideUndoToast,
    UndoToastContainer,
  };
}
