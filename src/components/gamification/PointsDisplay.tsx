import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Zap } from 'lucide-react';
import { formatXP } from '@/lib/gamification';
import { cn } from '@/lib/utils';

interface PointsDisplayProps {
  points: number;
  label?: string;
  icon?: 'star' | 'trending' | 'zap';
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  delta?: number;
  className?: string;
}

export const PointsDisplay: FC<PointsDisplayProps> = ({
  points,
  label = 'pontos',
  icon = 'star',
  size = 'md',
  showAnimation = true,
  delta,
  className
}) => {
  const icons = {
    star: Star,
    trending: TrendingUp,
    zap: Zap
  };
  const Icon = icons[icon];

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-xl gap-2'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24
  };

  return (
    <div className={cn("inline-flex items-center", sizeClasses[size], className)}>
      <Icon 
        size={iconSizes[size]} 
        className="text-coins fill-coins" 
      />
      <motion.span 
        key={points}
        initial={showAnimation ? { scale: 1.2, color: 'hsl(var(--primary))' } : undefined}
        animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
        className="font-bold"
      >
        {formatXP(points)}
      </motion.span>
      <span className="text-muted-foreground">{label}</span>
      
      <AnimatePresence>
        {delta !== undefined && delta !== 0 && (
          <motion.span
            initial={{ opacity: 0, y: 10, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "ml-1 text-xs font-medium",
              delta > 0 ? "text-success" : "text-destructive"
            )}
          >
            {delta > 0 ? '+' : ''}{delta}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
