import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface InAppAlertProps {
  type?: AlertType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissable?: boolean;
  onDismiss?: () => void;
  autoClose?: number; // milliseconds
  position?: 'top' | 'bottom';
  className?: string;
}

export const InAppAlert: FC<InAppAlertProps> = ({
  type = 'info',
  title,
  message,
  action,
  dismissable = true,
  onDismiss,
  autoClose,
  position = 'top',
  className
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const configs: Record<AlertType, { icon: LucideIcon; bg: string; border: string; iconColor: string }> = {
    info: {
      icon: Info,
      bg: 'bg-info/10',
      border: 'border-info/20',
      iconColor: 'text-info'
    },
    success: {
      icon: CheckCircle,
      bg: 'bg-success/10',
      border: 'border-success/20',
      iconColor: 'text-success'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      iconColor: 'text-warning'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
      iconColor: 'text-destructive'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  const positionClasses = position === 'top'
    ? 'top-4 left-1/2 -translate-x-1/2'
    : 'bottom-4 left-1/2 -translate-x-1/2';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20, scale: 0.95 }}
          className={cn(
            'fixed z-50 max-w-lg w-full mx-4',
            positionClasses,
            className
          )}
        >
          <div className={cn(
            'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
            config.bg,
            config.border
          )}>
            <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconColor)} />
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{title}</p>
              {message && (
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              )}
              
              {action && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-2 text-sm"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
            </div>

            {dismissable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Banner variant for persistent messages
interface BannerAlertProps {
  type?: AlertType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissable?: boolean;
  onDismiss?: () => void;
}

export const BannerAlert: FC<BannerAlertProps> = ({
  type = 'info',
  message,
  action,
  dismissable = true,
  onDismiss
}) => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const bgColors: Record<AlertType, string> = {
    info: 'bg-info text-info-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-destructive text-destructive-foreground'
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={cn('w-full overflow-hidden', bgColors[type])}
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-4 text-sm">
            <span>{message}</span>
            
            {action && (
              <Button
                variant="secondary"
                size="sm"
                className="h-7"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            
            {dismissable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute right-4"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
