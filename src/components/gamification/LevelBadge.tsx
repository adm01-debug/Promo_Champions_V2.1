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
  1: 'from-slate-400/20 to-slate-500/20 border-slate-400/30 text-slate-600',
  2: 'from-green-400/20 to-green-500/20 border-green-400/30 text-green-600',
  3: 'from-blue-400/20 to-blue-500/20 border-blue-400/30 text-blue-600',
  4: 'from-purple-400/20 to-purple-500/20 border-purple-400/30 text-purple-600',
  5: 'from-orange-400/20 to-red-500/20 border-orange-400/30 text-orange-600',
  6: 'from-cyan-400/20 to-blue-500/20 border-cyan-400/30 text-cyan-600',
  7: 'from-pink-400/20 to-rose-500/20 border-pink-400/30 text-pink-600',
  8: 'from-amber-400/20 to-yellow-500/20 border-amber-400/30 text-amber-600',
  9: 'from-emerald-400/20 to-teal-500/20 border-emerald-400/30 text-emerald-600',
  10: 'from-violet-400/20 to-purple-500/20 border-violet-400/30 text-violet-600',
};

const getGradientForLevel = (level: number): string => {
  if (level >= 15) {
    return 'from-amber-400/30 to-orange-500/30 border-amber-500/50 text-amber-500';
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
  const newLevelInfo = getLevelFromXP(newLevel * 100); // Approximate XP for level

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
