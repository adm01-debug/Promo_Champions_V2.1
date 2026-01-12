import { FC, ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Loader2,
  ExternalLink,
  Undo2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface EnhancedToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  progress?: boolean;
  action?: ToastAction;
  undoAction?: () => void;
  link?: { label: string; href: string };
  onClose: (id: string) => void;
  className?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-success/10 border-success/30',
    iconClass: 'text-success',
    progressClass: 'bg-success',
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-destructive/10 border-destructive/30',
    iconClass: 'text-destructive',
    progressClass: 'bg-destructive',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
    progressClass: 'bg-warning',
  },
  info: {
    icon: Info,
    bgClass: 'bg-info/10 border-info/30',
    iconClass: 'text-info',
    progressClass: 'bg-info',
  },
  loading: {
    icon: Loader2,
    bgClass: 'bg-primary/10 border-primary/30',
    iconClass: 'text-primary animate-spin',
    progressClass: 'bg-primary',
  },
};

export const EnhancedToast: FC<EnhancedToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  progress = true,
  action,
  undoAction,
  link,
  onClose,
  className,
}) => {
  const [progressValue, setProgressValue] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (type === 'loading' || duration === 0) return;

    let startTime = Date.now();
    let remainingTime = duration;

    const tick = () => {
      if (isPaused) return;
      
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, remainingTime - elapsed);
      const newProgress = (remaining / duration) * 100;
      
      setProgressValue(newProgress);

      if (remaining <= 0) {
        onClose(id);
      }
    };

    const interval = setInterval(tick, 50);
    return () => clearInterval(interval);
  }, [id, type, duration, isPaused, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative w-full max-w-md p-4 rounded-xl border shadow-lg",
        "backdrop-blur-sm overflow-hidden",
        config.bgClass,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn("flex-shrink-0 mt-0.5", config.iconClass)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}

          {/* Actions */}
          {(action || undoAction || link) && (
            <div className="flex items-center gap-2 mt-3">
              {action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={action.onClick}
                  className="h-7 text-xs"
                >
                  {action.icon}
                  {action.label}
                </Button>
              )}
              {undoAction && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={undoAction}
                  className="h-7 text-xs"
                >
                  <Undo2 className="h-3 w-3 mr-1" />
                  Desfazer
                </Button>
              )}
              {link && (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-foreground/10 transition-colors"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      {progress && type !== 'loading' && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/5">
          <motion.div
            className={cn("h-full", config.progressClass)}
            style={{ width: `${progressValue}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<Omit<EnhancedToastProps, 'onClose'>>;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer: FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
}) => {
  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2",
        positionClasses[position]
      )}
      aria-label="Notificações"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <EnhancedToast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};
