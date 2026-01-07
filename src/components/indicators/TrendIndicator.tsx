import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  showPercentage?: boolean;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  previousValue,
  showPercentage = true,
  showArrow = true,
  size = 'md',
  animated = true,
  className,
}: TrendIndicatorProps) {
  const change = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const content = (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        sizeClasses[size],
        isPositive && 'text-green-600 dark:text-green-400',
        isNegative && 'text-red-600 dark:text-red-400',
        isNeutral && 'text-muted-foreground',
        className
      )}
    >
      {showArrow && (
        <>
          {isPositive && <TrendingUp className={iconSizes[size]} />}
          {isNegative && <TrendingDown className={iconSizes[size]} />}
          {isNeutral && <Minus className={iconSizes[size]} />}
        </>
      )}
      {showPercentage && (
        <span>
          {isPositive && '+'}
          {change.toFixed(1)}%
        </span>
      )}
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

interface ComparisonBadgeProps {
  current: number;
  previous: number;
  label?: string;
  format?: (value: number) => string;
  className?: string;
}

export function ComparisonBadge({
  current,
  previous,
  label,
  format = (v) => v.toLocaleString('pt-BR'),
  className,
}: ComparisonBadgeProps) {
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
        isPositive
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        className
      )}
    >
      {label && <span className="font-medium">{label}</span>}
      <span>{format(current)}</span>
      <TrendIndicator value={current} previousValue={previous} size="sm" />
    </motion.div>
  );
}
