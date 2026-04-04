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
  lg: 'text-base px-3 py-1'
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
  className 
}) => {
  const levelInfo = getLevelFromXP(totalXP);
  const gradient = getGradientForLevel(levelInfo.level);

  const BadgeContent = (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Badge 
        variant="outline" 
        className={cn(
          "font-medium",
          "bg-gradient-to-r",
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
        <TooltipTrigger asChild>
          {BadgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{levelInfo.emoji} {levelInfo.title}</p>
            <p className="text-xs text-muted-foreground">
              Nível {levelInfo.level} • {Math.round(levelInfo.progressPercent)}% para o próximo
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface LevelUpNotificationProps {
  previousLevel: number;
  newLevel: number;
  onClose?: () => void;
}

export const LevelUpNotification: FC<LevelUpNotificationProps> = ({
  previousLevel,
  newLevel,
  onClose
}) => {
  const newLevelInfo = getLevelFromXP(newLevel * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        className="bg-card border rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ repeat: 3, duration: 0.5 }}
          className="text-6xl mb-4"
        >
          {newLevelInfo.emoji}
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-2xl text-muted-foreground">{previousLevel}</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-xl"
          >
            →
          </motion.span>
          <span className="text-4xl font-bold text-primary">{newLevel}</span>
        </div>
        
        <p className="text-lg font-medium text-primary mb-2">
          {newLevelInfo.title}
        </p>
        
        <p className="text-muted-foreground text-sm">
          Parabéns! Você alcançou um novo nível!
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Continuar
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
