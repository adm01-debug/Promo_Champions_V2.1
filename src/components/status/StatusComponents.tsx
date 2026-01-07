import { FC, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';

type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'loading' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { icon: typeof CheckCircle; className: string; defaultLabel: string }> = {
  success: { icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200', defaultLabel: 'Sucesso' },
  error: { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-200', defaultLabel: 'Erro' },
  warning: { icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-800 border-yellow-200', defaultLabel: 'Atenção' },
  pending: { icon: Clock, className: 'bg-blue-100 text-blue-800 border-blue-200', defaultLabel: 'Pendente' },
  loading: { icon: Loader2, className: 'bg-gray-100 text-gray-800 border-gray-200', defaultLabel: 'Carregando' },
  info: { icon: AlertTriangle, className: 'bg-blue-100 text-blue-800 border-blue-200', defaultLabel: 'Info' }
};

export const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  size = 'md'
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = { sm: 12, md: 14, lg: 16 };

  return (
    <Badge variant="outline" className={cn(config.className, sizeClasses[size], "gap-1")}>
      {showIcon && (
        <Icon 
          size={iconSizes[size]} 
          className={status === 'loading' ? 'animate-spin' : ''} 
        />
      )}
      {label || config.defaultLabel}
    </Badge>
  );
};

interface StatusDotProps {
  status: StatusType;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusDot: FC<StatusDotProps> = ({ status, pulse = false, size = 'md' }) => {
  const colorClasses: Record<StatusType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    pending: 'bg-blue-500',
    loading: 'bg-gray-500',
    info: 'bg-blue-400'
  };

  const sizeClasses = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };

  return (
    <span className="relative inline-flex">
      <span className={cn("rounded-full", colorClasses[status], sizeClasses[size])} />
      {pulse && (
        <span className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          colorClasses[status]
        )} />
      )}
    </span>
  );
};

interface OnlineStatusProps {
  isOnline: boolean;
  showLabel?: boolean;
}

export const OnlineStatus: FC<OnlineStatusProps> = ({ isOnline, showLabel = true }) => (
  <div className="flex items-center gap-2">
    <StatusDot status={isOnline ? 'success' : 'error'} pulse={isOnline} size="sm" />
    {showLabel && (
      <span className={cn("text-sm", isOnline ? "text-green-600" : "text-muted-foreground")}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    )}
  </div>
);

interface ProgressStatusProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressStatus: FC<ProgressStatusProps> = ({
  current,
  total,
  label,
  showPercentage = true
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label || `${current} de ${total}`}</span>
        {showPercentage && <span className="font-medium">{percentage}%</span>}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
