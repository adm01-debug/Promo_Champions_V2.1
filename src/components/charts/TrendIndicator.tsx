import { FC } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  format?: 'percentage' | 'absolute' | 'currency';
  currency?: string;
  showIcon?: boolean;
  showBackground?: boolean;
  size?: 'sm' | 'md' | 'lg';
  invertColors?: boolean;
  animated?: boolean;
  className?: string;
}

export const TrendIndicator: FC<TrendIndicatorProps> = ({
  value,
  previousValue,
  format = 'percentage',
  currency = 'R$',
  showIcon = true,
  showBackground = true,
  size = 'md',
  invertColors = false,
  animated = true,
  className,
}) => {
  const change = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : value;

  const isPositive = change > 0;
  const isNeutral = change === 0;

  const sizeConfig = {
    sm: { text: 'text-xs', icon: 12, padding: 'px-1.5 py-0.5' },
    md: { text: 'text-sm', icon: 14, padding: 'px-2 py-1' },
    lg: { text: 'text-base', icon: 16, padding: 'px-3 py-1.5' },
  };

  const config = sizeConfig[size];

  const getColors = () => {
    if (isNeutral) return {
      text: 'text-muted-foreground',
      bg: 'bg-muted/50',
      icon: Minus,
    };

    const positive = invertColors ? !isPositive : isPositive;
    
    return positive ? {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: showIcon ? TrendingUp : ArrowUp,
    } : {
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: showIcon ? TrendingDown : ArrowDown,
    };
  };

  const colors = getColors();
  const Icon = colors.icon;

  const formatValue = () => {
    const absChange = Math.abs(change);
    const sign = isPositive ? '+' : isNeutral ? '' : '-';

    switch (format) {
      case 'percentage':
        return `${sign}${absChange.toFixed(1)}%`;
      case 'absolute':
        return `${sign}${absChange.toFixed(0)}`;
      case 'currency':
        return `${sign}${currency} ${absChange.toFixed(2)}`;
      default:
        return `${sign}${absChange.toFixed(1)}%`;
    }
  };

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        colors.text,
        showBackground && [colors.bg, config.padding],
        config.text,
        className
      )}
    >
      {showIcon && <Icon size={config.icon} />}
      <span>{formatValue()}</span>
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
