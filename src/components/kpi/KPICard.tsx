import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/metrics/MetricDisplay';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: number[];
  format?: 'number' | 'currency' | 'percent';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'outline';
  className?: string;
}

export const KPICard: FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs período anterior',
  icon: Icon,
  trend,
  format = 'number',
  size = 'md',
  variant = 'default',
  className,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(val);
    }
  };

  const sizeClasses = {
    sm: { padding: 'p-3', title: 'text-xs', value: 'text-lg', icon: 'h-8 w-8' },
    md: { padding: 'p-4', title: 'text-sm', value: 'text-2xl', icon: 'h-10 w-10' },
    lg: { padding: 'p-6', title: 'text-base', value: 'text-4xl', icon: 'h-12 w-12' },
  };

  const variantClasses = {
    default: 'bg-card border',
    gradient: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
    outline: 'bg-transparent border-2',
  };

  const TrendIcon = change === undefined
    ? null
    : change > 0
    ? TrendingUp
    : change < 0
    ? TrendingDown
    : Minus;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-xl border transition-shadow hover:shadow-md',
        sizeClasses[size].padding,
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn('text-muted-foreground', sizeClasses[size].title)}>
            {title}
          </p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('font-bold', sizeClasses[size].value)}
          >
            {formatValue(value)}
          </motion.p>
        </div>
        {Icon && (
          <div className={cn('rounded-lg bg-primary/10 p-2', sizeClasses[size].icon)}>
            <Icon className="h-full w-full text-primary" />
          </div>
        )}
      </div>

      {(change !== undefined || trend) && (
        <div className="mt-3 flex items-center justify-between gap-4">
          {change !== undefined && TrendIcon && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                change > 0 && 'text-green-500',
                change < 0 && 'text-red-500',
                change === 0 && 'text-muted-foreground'
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            </div>
          )}
          {trend && (
            <div className="flex-1 max-w-[80px]">
              <Sparkline
                data={trend}
                height={24}
                color={change && change > 0 ? 'hsl(142, 76%, 36%)' : change && change < 0 ? 'hsl(0, 84%, 60%)' : 'hsl(var(--muted-foreground))'}
              />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// KPI Grid
interface KPIGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const KPIGrid: FC<KPIGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colClasses[columns], className)}>
      {children}
    </div>
  );
};

// Mini KPI
interface MiniKPIProps {
  label: string;
  value: string | number;
  change?: number;
  className?: string;
}

export const MiniKPI: FC<MiniKPIProps> = ({
  label,
  value,
  change,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs',
              change > 0 && 'text-green-500',
              change < 0 && 'text-red-500'
            )}
          >
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  );
};
