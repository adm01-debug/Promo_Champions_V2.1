import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface StatCardCompactProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export const StatCardCompact: FC<StatCardCompactProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  tooltip,
  className,
}) => {
  const getTrendIcon = () => {
    if (!change) return <Minus size={12} />;
    return change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={cn('p-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={12} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <motion.p 
            className="text-xl font-bold truncate"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {value}
          </motion.p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-muted shrink-0">
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-1 text-xs', getTrendColor())}>
          {getTrendIcon()}
          <span>{change > 0 ? '+' : ''}{change}%</span>
          {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </Card>
  );
};

interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
}

export const MiniStat: FC<MiniStatProps> = ({ label, value, trend }) => (
  <div className="text-center">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="flex items-center justify-center gap-1">
      <span className="font-semibold">{value}</span>
      {trend === 'up' && <TrendingUp size={12} className="text-green-600" />}
      {trend === 'down' && <TrendingDown size={12} className="text-red-600" />}
    </div>
  </div>
);
