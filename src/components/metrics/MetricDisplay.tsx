import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  previousValue?: number;
  currentValue?: number;
  format?: 'number' | 'currency' | 'percent';
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  trendLabel?: string;
  tooltip?: string;
  className?: string;
}

export const MetricDisplay: FC<MetricDisplayProps> = ({
  label,
  value,
  previousValue,
  currentValue,
  format = 'number',
  size = 'md',
  showTrend = true,
  trendLabel,
  tooltip,
  className,
}) => {
  const change = previousValue && currentValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : null;

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
    sm: { label: 'text-xs', value: 'text-lg' },
    md: { label: 'text-sm', value: 'text-2xl' },
    lg: { label: 'text-base', value: 'text-4xl' },
  };

  const TrendIcon = change === null
    ? null
    : change > 0
    ? TrendingUp
    : change < 0
    ? TrendingDown
    : Minus;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-1">
        <span className={cn('text-muted-foreground', sizeClasses[size].label)}>
          {label}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('font-bold', sizeClasses[size].value)}
        >
          {formatValue(value)}
        </motion.span>
        {showTrend && change !== null && TrendIcon && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              change > 0 && 'text-green-500',
              change < 0 && 'text-red-500',
              change === 0 && 'text-muted-foreground'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(change).toFixed(1)}%</span>
            {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// Comparison Metric
interface ComparisonMetricProps {
  label: string;
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percent';
  className?: string;
}

export const ComparisonMetric: FC<ComparisonMetricProps> = ({
  label,
  current,
  previous,
  format = 'number',
  className,
}) => {
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          notation: 'compact',
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(val);
    }
  };

  return (
    <div className={cn('p-4 rounded-lg border bg-card', className)}>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{formatValue(current)}</p>
          <p className="text-xs text-muted-foreground">
            vs {formatValue(previous)} anterior
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-sm font-medium',
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

// Mini Sparkline
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export const Sparkline: FC<SparklineProps> = ({
  data,
  color = 'hsl(var(--primary))',
  height = 40,
  className,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className={cn('w-full', className)}
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
