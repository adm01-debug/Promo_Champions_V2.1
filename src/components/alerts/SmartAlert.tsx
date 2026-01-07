import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface SmartAlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  icon?: React.ReactNode;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-600 dark:text-green-400',
    iconColor: 'text-green-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-600 dark:text-red-400',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-500',
  },
};

export const SmartAlert: React.FC<SmartAlertProps> = ({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className,
  icon,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border',
        config.bg,
        config.border,
        className
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
        {icon || <Icon className="h-5 w-5" />}
      </div>
      <div className="flex-1 space-y-1">
        {title && (
          <p className={cn('font-semibold text-sm', config.text)}>{title}</p>
        )}
        <p className={cn('text-sm', config.text)}>{message}</p>
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className={cn('mt-2 h-7 px-2', config.text)}
          >
            {action.label}
          </Button>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded-md hover:bg-foreground/10 transition-colors',
            config.text
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};

interface AlertStackProps {
  alerts: Array<{
    id: string;
    variant?: AlertVariant;
    title?: string;
    message: string;
  }>;
  onDismiss?: (id: string) => void;
  className?: string;
}

export const AlertStack: React.FC<AlertStackProps> = ({
  alerts,
  onDismiss,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence mode="popLayout">
        {alerts.map(alert => (
          <SmartAlert
            key={alert.id}
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            dismissible={!!onDismiss}
            onDismiss={() => onDismiss?.(alert.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
