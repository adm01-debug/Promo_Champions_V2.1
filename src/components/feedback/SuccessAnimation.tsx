import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Info, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessAnimationProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  description?: string;
  show: boolean;
  onClose?: () => void;
  showConfetti?: boolean;
}

export const SuccessAnimation: FC<SuccessAnimationProps> = ({
  type,
  message,
  description,
  show,
  onClose,
  showConfetti = false
}) => {
  const configs = {
    success: {
      icon: Check,
      bgColor: 'bg-success/10',
      iconColor: 'text-success',
      borderColor: 'border-success/20'
    },
    error: {
      icon: X,
      bgColor: 'bg-destructive/10',
      iconColor: 'text-destructive',
      borderColor: 'border-destructive/20'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10',
      iconColor: 'text-warning',
      borderColor: 'border-warning/20'
    },
    info: {
      icon: Info,
      bgColor: 'bg-info/10',
      iconColor: 'text-info',
      borderColor: 'border-info/20'
    },
    loading: {
      icon: Loader2,
      bgColor: 'bg-muted',
      iconColor: 'text-muted-foreground',
      borderColor: 'border-border'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  // Trigger confetti on success
  if (show && type === 'success' && showConfetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className={`
            fixed bottom-24 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-4 p-4 rounded-xl
            ${config.bgColor} ${config.borderColor} border
            shadow-lg backdrop-blur-sm
            min-w-[300px] max-w-[90vw]
          `}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${config.bgColor}
            `}
          >
            <Icon 
              className={`w-6 h-6 ${config.iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} 
            />
          </motion.div>
          
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-semibold text-foreground"
            >
              {message}
            </motion.p>
            {description && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground"
              >
                {description}
              </motion.p>
            )}
          </div>

          {onClose && type !== 'loading' && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-foreground/10 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for easy usage
import { useState, useCallback } from 'react';

export const useSuccessAnimation = () => {
  const [state, setState] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    message: string;
    description?: string;
    showConfetti?: boolean;
  }>({
    show: false,
    type: 'success',
    message: '',
    description: undefined,
    showConfetti: false
  });

  const showSuccess = useCallback((message: string, description?: string, showConfetti = true) => {
    setState({ show: true, type: 'success', message, description, showConfetti });
    setTimeout(() => setState(s => ({ ...s, show: false })), 3000);
  }, []);

  const showError = useCallback((message: string, description?: string) => {
    setState({ show: true, type: 'error', message, description, showConfetti: false });
    setTimeout(() => setState(s => ({ ...s, show: false })), 4000);
  }, []);

  const showWarning = useCallback((message: string, description?: string) => {
    setState({ show: true, type: 'warning', message, description, showConfetti: false });
    setTimeout(() => setState(s => ({ ...s, show: false })), 3500);
  }, []);

  const showInfo = useCallback((message: string, description?: string) => {
    setState({ show: true, type: 'info', message, description, showConfetti: false });
    setTimeout(() => setState(s => ({ ...s, show: false })), 3000);
  }, []);

  const showLoading = useCallback((message: string, description?: string) => {
    setState({ show: true, type: 'loading', message, description, showConfetti: false });
  }, []);

  const hide = useCallback(() => {
    setState(s => ({ ...s, show: false }));
  }, []);

  return {
    ...state,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hide,
    onClose: hide
  };
};
