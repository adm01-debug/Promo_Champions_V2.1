import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface InlineMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colorMap = {
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800',
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
};

export const InlineMessage: FC<InlineMessageProps> = ({
  type,
  children,
  onDismiss,
  className
}) => {
  const Icon = iconMap[type];
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border",
      colorMap[type],
      className
    )}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface CalloutProps {
  title?: string;
  children: ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'tip';
  className?: string;
}

const calloutVariants = {
  default: 'border-l-primary bg-primary/5',
  warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  danger: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
  tip: 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
};

export const Callout: FC<CalloutProps> = ({
  title,
  children,
  variant = 'default',
  className
}) => (
  <div className={cn(
    "border-l-4 pl-4 py-3 rounded-r-lg",
    calloutVariants[variant],
    className
  )}>
    {title && <p className="font-medium mb-1">{title}</p>}
    <div className="text-sm text-muted-foreground">{children}</div>
  </div>
);

interface HintProps {
  children: ReactNode;
  className?: string;
}

export const Hint: FC<HintProps> = ({ children, className }) => (
  <p className={cn("text-xs text-muted-foreground flex items-center gap-1", className)}>
    <Info className="h-3 w-3" />
    {children}
  </p>
);

interface RequiredFieldHintProps {
  className?: string;
}

export const RequiredFieldHint: FC<RequiredFieldHintProps> = ({ className }) => (
  <p className={cn("text-xs text-muted-foreground", className)}>
    Campos marcados com <span className="text-destructive">*</span> são obrigatórios
  </p>
);

interface ValidationMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'success';
  className?: string;
}

export const ValidationMessage: FC<ValidationMessageProps> = ({
  message,
  type = 'error',
  className
}) => {
  const colors = {
    error: 'text-destructive',
    warning: 'text-yellow-600',
    success: 'text-green-600'
  };

  return (
    <p className={cn("text-xs mt-1", colors[type], className)}>
      {message}
    </p>
  );
};
