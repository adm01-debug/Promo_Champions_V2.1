import { FC } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak?: number;
  type?: 'daily' | 'weekly' | 'sales';
  size?: 'sm' | 'md' | 'lg';
  showBest?: boolean;
  className?: string;
}

const streakMilestones = [3, 7, 14, 30, 60, 90, 180, 365];

export const StreakCounter: FC<StreakCounterProps> = ({
  currentStreak,
  bestStreak = 0,
  type = 'daily',
  size = 'md',
  showBest = true,
  className
}) => {
  const isOnFire = currentStreak >= 3;
  const nextMilestone = streakMilestones.find(m => m > currentStreak) || currentStreak + 10;
  const milestoneProgress = (currentStreak / nextMilestone) * 100;

  const typeLabels = {
    daily: 'dias consecutivos',
    weekly: 'semanas consecutivas',
    sales: 'vendas seguidas'
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40
  };

  const numberSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden",
      sizeClasses[size],
      isOnFire && "bg-gradient-to-br from-streak/10 to-destructive/10 border-streak/30",
      className
    )}>
      <div className="flex items-center gap-4">
        <motion.div
          animate={isOnFire ? {
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          } : undefined}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={cn(
            "flex items-center justify-center rounded-full",
            isOnFire ? "text-streak" : "text-muted-foreground"
          )}
        >
          <Flame size={iconSizes[size]} className={isOnFire ? "fill-streak" : ""} />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <motion.span
              key={currentStreak}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("font-bold", numberSizes[size])}
            >
              {currentStreak}
            </motion.span>
            <span className="text-muted-foreground text-sm">
              {typeLabels[type]}
            </span>
          </div>

          {/* Milestone progress */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Próximo marco: {nextMilestone} dias</span>
              <span>{Math.round(milestoneProgress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress}%` }}
                className="h-full bg-gradient-to-r from-streak to-destructive rounded-full"
              />
            </div>
          </div>
        </div>

        {showBest && bestStreak > 0 && (
          <div className="text-center">
            <Trophy size={16} className="text-rank-gold mx-auto mb-1" />
            <div className="text-xs text-muted-foreground">Recorde</div>
            <div className="font-bold text-rank-gold">{bestStreak}</div>
          </div>
        )}
      </div>

      {/* Fire particles for active streak */}
      {isOnFire && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-streak/50 rounded-full"
              initial={{ 
                x: Math.random() * 100, 
                y: 100,
                opacity: 0 
              }}
              animate={{ 
                y: -20,
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2 + Math.random() * 2,
                delay: i * 0.3 
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

interface MiniStreakProps {
  streak: number;
  className?: string;
}

export const MiniStreak: FC<MiniStreakProps> = ({ streak, className }) => {
  const isOnFire = streak >= 3;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      isOnFire 
        ? "bg-streak/20 text-streak" 
        : "bg-muted text-muted-foreground",
      className
    )}>
      <Flame size={12} className={isOnFire ? "fill-current" : ""} />
      {streak}
    </div>
  );
};
