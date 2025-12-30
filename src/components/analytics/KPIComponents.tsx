import { FC } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  sparkline?: number[];
  className?: string;
}

const formatValue = (value: number, format: 'number' | 'currency' | 'percent') => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
  }
};

export const KPICard: FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  trend,
  trendValue,
  sparkline,
  className
}) => {
  const calculatedTrend = trend || (
    previousValue !== undefined && typeof value === 'number'
      ? value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral'
      : undefined
  );

  const TrendIcon = calculatedTrend === 'up' ? TrendingUp 
    : calculatedTrend === 'down' ? TrendingDown 
    : Minus;

  const trendColor = calculatedTrend === 'up' ? 'text-green-500' 
    : calculatedTrend === 'down' ? 'text-red-500' 
    : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className={cn(
        "p-4 relative overflow-hidden group",
        "hover:shadow-md transition-shadow duration-300",
        className
      )}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold"
            >
              {typeof value === 'number' ? formatValue(value, format) : value}
            </motion.p>
          </div>
          
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Trend indicator */}
        {calculatedTrend && (
          <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            {trendValue !== undefined && (
              <span className="text-xs font-medium">
                {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
              </span>
            )}
            <span className="text-xs text-muted-foreground">vs anterior</span>
          </div>
        )}

        {/* Mini sparkline */}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {sparkline.map((val, i) => {
              const max = Math.max(...sparkline);
              const height = (val / max) * 100;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-1 bg-primary/30 rounded-t-sm min-h-[2px]"
                />
              );
            })}
          </div>
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </motion.div>
  );
};

interface InsightCardProps {
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const typeStyles = {
  success: {
    bg: 'bg-green-500/10 border-green-500/30',
    icon: 'text-green-500',
    arrow: ArrowUpRight
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    icon: 'text-amber-500',
    arrow: ArrowDownRight
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: 'text-blue-500',
    arrow: ArrowUpRight
  },
  danger: {
    bg: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-500',
    arrow: ArrowDownRight
  }
};

export const InsightCard: FC<InsightCardProps> = ({
  type,
  title,
  description,
  action,
  className
}) => {
  const style = typeStyles[type];
  const ArrowIcon = style.arrow;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className={cn(
        "p-4 border",
        style.bg,
        className
      )}>
        <div className="flex items-start gap-3">
          <div className={cn("p-1.5 rounded-full bg-background/50", style.icon)}>
            <ArrowIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            {action && (
              <button
                onClick={action.onClick}
                className={cn(
                  "text-xs font-medium mt-2 hover:underline",
                  style.icon
                )}
              >
                {action.label} →
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface MetricComparisonProps {
  label: string;
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percent';
  className?: string;
}

export const MetricComparison: FC<MetricComparisonProps> = ({
  label,
  current,
  previous,
  format = 'number',
  className
}) => {
  const diff = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = diff >= 0;

  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{formatValue(current, format)}</span>
        <span className={cn(
          "text-xs flex items-center gap-0.5",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(diff).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

interface ProgressMetricProps {
  label: string;
  current: number;
  target: number;
  format?: 'number' | 'currency' | 'percent';
  showRemaining?: boolean;
  className?: string;
}

export const ProgressMetric: FC<ProgressMetricProps> = ({
  label,
  current,
  target,
  format = 'number',
  showRemaining = false,
  className
}) => {
  const progress = Math.min((current / target) * 100, 100);
  const remaining = target - current;
  const isComplete = current >= target;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn(
          "text-sm",
          isComplete ? "text-green-500 font-medium" : "text-muted-foreground"
        )}>
          {formatValue(current, format)} / {formatValue(target, format)}
        </span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={cn(
            "h-full rounded-full",
            isComplete 
              ? "bg-green-500" 
              : progress >= 75 
                ? "bg-primary" 
                : progress >= 50 
                  ? "bg-amber-500" 
                  : "bg-red-500"
          )}
        />
      </div>

      {showRemaining && !isComplete && (
        <p className="text-xs text-muted-foreground">
          Faltam {formatValue(remaining, format)} para atingir a meta
        </p>
      )}
    </div>
  );
};
