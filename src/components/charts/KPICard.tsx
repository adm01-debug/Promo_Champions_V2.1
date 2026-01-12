import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { SparklineChart } from './SparklineChart';
import { TrendIndicator } from './TrendIndicator';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  icon?: LucideIcon;
  sparklineData?: number[];
  trend?: {
    value: number;
    label?: string;
  };
  target?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export const KPICard: FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  currency = 'R$',
  icon: Icon,
  sparklineData,
  trend,
  target,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  children,
}) => {
  const variantStyles = {
    default: {
      border: 'border-border',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    primary: {
      border: 'border-primary/20',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    success: {
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    danger: {
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  };

  const sizeStyles = {
    sm: { padding: 'p-3', title: 'text-xs', value: 'text-xl' },
    md: { padding: 'p-4', title: 'text-sm', value: 'text-2xl' },
    lg: { padding: 'p-6', title: 'text-base', value: 'text-3xl' },
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `${currency} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  const targetProgress = target ? (value / target.value) * 100 : null;

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          styles.border,
          onClick && 'cursor-pointer hover:shadow-lg',
          className
        )}
        onClick={onClick}
      >
        <CardContent className={sizes.padding}>
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {Icon && (
                <div className={cn('p-2 rounded-lg', styles.iconBg)}>
                  <Icon className={cn('h-4 w-4', styles.iconColor)} />
                </div>
              )}
              <span className={cn('font-medium text-muted-foreground', sizes.title)}>
                {title}
              </span>
            </div>
            
            {sparklineData && sparklineData.length > 1 && (
              <SparklineChart
                data={sparklineData}
                width={80}
                height={30}
                color={`hsl(var(--${variant === 'default' ? 'primary' : variant}))`}
              />
            )}
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-2 mb-2">
            <AnimatedCounter
              value={value}
              formatter={() => formatValue()}
              className={cn('font-bold', sizes.value)}
            />
            
            {(trend || previousValue !== undefined) && (
              <TrendIndicator
                value={trend?.value ?? value}
                previousValue={previousValue}
                size="sm"
              />
            )}
          </div>

          {/* Target progress */}
          {target && targetProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{target.label || 'Meta'}</span>
                <span>{targetProgress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    targetProgress >= 100 ? 'bg-emerald-500' :
                    targetProgress >= 75 ? 'bg-primary' :
                    targetProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(targetProgress, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          )}

          {children}
        </CardContent>

        {/* Decorative gradient */}
        <div 
          className={cn(
            'absolute top-0 right-0 w-24 h-24 opacity-5 blur-2xl rounded-full',
            variant === 'primary' && 'bg-primary',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-red-500',
          )}
        />
      </Card>
    </motion.div>
  );
};
