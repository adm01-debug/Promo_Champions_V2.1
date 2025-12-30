import { FC } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  format?: 'number' | 'currency' | 'percentage';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  sparklineData?: number[];
}

export const EnhancedStatCard: FC<EnhancedStatCardProps> = ({
  title,
  value,
  previousValue,
  change,
  changeType = 'percentage',
  icon: Icon,
  trend,
  trendLabel,
  format = 'number',
  loading,
  className,
  onClick,
  sparklineData
}) => {
  // Determine trend from change if not provided
  const effectiveTrend = trend ?? (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');
  
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const TrendIcon = trendIcons[effectiveTrend];

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(val);
    }
  };

  const formatChange = (val: number) => {
    const sign = val > 0 ? '+' : '';
    if (changeType === 'percentage') {
      return `${sign}${val.toFixed(1)}%`;
    }
    return `${sign}${new Intl.NumberFormat('pt-BR').format(val)}`;
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="pb-2">
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <Card 
        className={cn(
          'transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-md hover:border-primary/30',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formatValue(value)}
              </motion.div>
              
              {(change !== undefined || trendLabel) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn('flex items-center gap-1 mt-1 text-sm', trendColors[effectiveTrend])}>
                        <TrendIcon className="w-4 h-4" />
                        {change !== undefined && (
                          <span className="font-medium">{formatChange(change)}</span>
                        )}
                        {trendLabel && (
                          <span className="text-muted-foreground text-xs">{trendLabel}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    {previousValue !== undefined && (
                      <TooltipContent>
                        <p>Valor anterior: {formatValue(previousValue)}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Mini sparkline */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="flex items-end gap-0.5 h-8">
                {sparklineData.slice(-7).map((val, idx, arr) => {
                  const max = Math.max(...arr);
                  const height = max > 0 ? (val / max) * 100 : 0;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'w-1.5 rounded-full',
                        idx === arr.length - 1 ? 'bg-primary' : 'bg-primary/30'
                      )}
                      style={{ minHeight: '2px' }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
