import { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  errorMessage?: string;
  className?: string;
}

/**
 * AutoSaveIndicator - Shows auto-save status in forms
 */
export const AutoSaveIndicator: FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved,
  errorMessage,
  className,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <AnimatePresence mode="wait">
        {status === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Salvando...</span>
          </motion.div>
        )}

        {status === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 text-green-600"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Salvo!</span>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMessage || 'Erro ao salvar'}</span>
          </motion.div>
        )}

        {status === 'idle' && lastSaved && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>Salvo às {formatTime(lastSaved)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AutoSaveFormProps {
  children: ReactNode;
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  className?: string;
}

/**
 * AutoSaveForm - Wrapper that shows auto-save status
 */
export const AutoSaveForm: FC<AutoSaveFormProps> = ({
  children,
  status,
  lastSaved,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-0 right-0 z-10">
        <AutoSaveIndicator status={status} lastSaved={lastSaved} />
      </div>
      {children}
    </div>
  );
};
