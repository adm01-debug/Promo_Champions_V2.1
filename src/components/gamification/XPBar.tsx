import { FC } from 'react';
import { motion } from 'framer-motion';
import { getLevelFromXP, formatXP } from '@/lib/gamification';
import { cn } from '@/lib/utils';

interface XPBarProps {
  currentXP: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const XPBar: FC<XPBarProps> = ({ 
  currentXP, 
  showLabel = true,
  size = 'md',
  animated = true,
  className 
}) => {
  const levelInfo = getLevelFromXP(currentXP);
  const xpInLevel = currentXP - levelInfo.minXP;
  const xpNeeded = levelInfo.maxXP - levelInfo.minXP;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const BarComponent = animated ? motion.div : 'div';
  const barProps = animated ? {
    initial: { width: 0 },
    animate: { width: `${levelInfo.progressPercent}%` },
    transition: { duration: 1, ease: 'easeOut' as const }
  } : {
    style: { width: `${levelInfo.progressPercent}%` }
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-muted-foreground">
            {formatXP(xpInLevel)} / {formatXP(xpNeeded)} XP
          </span>
          <span className="text-muted-foreground">
            Nível {levelInfo.level + 1}
          </span>
        </div>
      )}
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <BarComponent
          className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full relative"
          {...barProps}
        >
          {size === 'lg' && (
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
          )}
        </BarComponent>
      </div>
    </div>
  );
};
