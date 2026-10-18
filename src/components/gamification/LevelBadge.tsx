import { FC } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { getLevelFromXP } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LevelBadgeProps {
  totalXP: number;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
  lg: 'text-base px-3 py-1',
};

const levelGradients: Record<number, string> = {
  1: 'from-muted-foreground/20 to-muted-foreground/20 border-muted-foreground/30 text-muted-foreground',
  2: 'from-success/20 to-success/20 border-success/30 text-success',
  3: 'from-info/20 to-info/20 border-info/30 text-info',
  4: 'from-primary/20 to-primary/20 border-primary/30 text-primary',
  5: 'from-streak/20 to-destructive/20 border-streak/30 text-streak',
  6: 'from-accent/20 to-info/20 border-accent/30 text-accent',
  7: 'from-live-pulse/20 to-destructive/20 border-live-pulse/30 text-live-pulse',
  8: 'from-coins/20 to-warning/20 border-coins/30 text-coins',
  9: 'from-success/20 to-accent/20 border-success/30 text-success',
  10: 'from-xp/20 to-primary/20 border-xp/30 text-xp',
};

const getGradientForLevel = (level: number): string => {
  if (level >= 15) {
    return 'from-coins/30 to-streak/30 border-coins/50 text-coins';
  }
  return levelGradients[level] || levelGradients[Math.min(level, 10)];
};

export const LevelBadge: FC<LevelBadgeProps> = ({
  totalXP,
  showTitle = false,
  size = 'md',
  showTooltip = true,
  className,
}) => {
  const levelInfo = getLevelFromXP(totalXP);
  const gradient = getGradientForLevel(levelInfo.level);

  const BadgeContent = (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Badge
        variant="outline"
        className={cn(
          'font-medium',
          'bg-gradient-to-r',
          gradient,
          sizeStyles[size],
          className
        )}
      >
        {levelInfo.emoji} {showTitle ? levelInfo.title : `Nv. ${levelInfo.level}`}
      </Badge>
    </motion.div>
  );

  if (!showTooltip) return BadgeContent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{BadgeContent}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">
              {levelInfo.emoji} {levelInfo.title}
            </p>
            <p className="text-xs text-muted-foreground">
              Nível {levelInfo.level} • {Math.round(levelInfo.progressPercent)}% para o
              próximo
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
