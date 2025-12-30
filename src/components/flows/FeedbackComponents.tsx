import { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface InlineFeedbackProps {
  type: FeedbackType;
  message: string;
  show: boolean;
  className?: string;
}

const feedbackConfig: Record<FeedbackType, { icon: typeof CheckCircle2; color: string }> = {
  success: { icon: CheckCircle2, color: "text-green-500 bg-green-500/10 border-green-500/20" },
  error: { icon: XCircle, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  warning: { icon: AlertCircle, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  info: { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" }
};

export const InlineFeedback: FC<InlineFeedbackProps> = ({
  type,
  message,
  show,
  className
}) => {
  const config = feedbackConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md border text-sm",
            config.color,
            className
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente de loading com contexto
interface ContextualLoadingProps {
  isLoading: boolean;
  message?: string;
  children: ReactNode;
}

export const ContextualLoading: FC<ContextualLoadingProps> = ({
  isLoading,
  message = "Carregando...",
  children
}) => {
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm text-muted-foreground">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente de confirmação inline
interface InlineConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const InlineConfirm: FC<InlineConfirmProps> = ({
  onConfirm,
  onCancel,
  message = "Tem certeza?",
  confirmLabel = "Sim",
  cancelLabel = "Não"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-2 text-sm"
    >
      <span className="text-muted-foreground">{message}</span>
      <button
        onClick={onConfirm}
        className="px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
      >
        {confirmLabel}
      </button>
      <button
        onClick={onCancel}
        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
      >
        {cancelLabel}
      </button>
    </motion.div>
  );
};
