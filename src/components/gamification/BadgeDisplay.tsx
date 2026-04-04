import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const rarityColors = {
  common: 'from-slate-400 to-slate-600',
  rare: 'from-info to-info/80',
  epic: 'from-primary to-primary-glow',
  legendary: 'from-rank-gold to-streak'
};

const rarityGlow = {
  common: '',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/30',
  legendary: 'shadow-amber-500/50'
};

export const BadgeDisplay: FC<BadgeDisplayProps> = ({
  badge,
  size = 'md',
  showTooltip = true,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  const BadgeContent = (
    <motion.div
      whileHover={badge.unlocked ? { scale: 1.1, rotate: 5 } : undefined}
      whileTap={badge.unlocked ? { scale: 0.95 } : undefined}
      className={cn(
        "relative rounded-full flex items-center justify-center",
        sizeClasses[size],
        badge.unlocked 
          ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg ${rarityGlow[badge.rarity]}`
          : "bg-muted border-2 border-dashed border-muted-foreground/30",
        className
      )}
    >
      <span className={cn(
        "select-none",
        !badge.unlocked && "opacity-30 grayscale"
      )}>
        {badge.emoji}
      </span>
      
      {badge.unlocked && badge.rarity === 'legendary' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.div>
  );

  if (!showTooltip) return BadgeContent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-1">
              {badge.emoji} {badge.name}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded capitalize",
                badge.rarity === 'legendary' && "bg-rank-gold/20 text-rank-gold",
                badge.rarity === 'epic' && "bg-primary/20 text-primary",
                badge.rarity === 'rare' && "bg-info/20 text-info",
                badge.rarity === 'common' && "bg-slate-500/20 text-slate-500"
              )}>
                {badge.rarity}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            {badge.unlocked && badge.unlockedAt && (
              <p className="text-xs text-success">
                ✓ Desbloqueado em {badge.unlockedAt.toLocaleDateString('pt-BR')}
              </p>
            )}
            {!badge.unlocked && (
              <p className="text-xs text-muted-foreground italic">
                🔒 Ainda não desbloqueado
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface BadgeGridProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
}

export const BadgeGrid: FC<BadgeGridProps> = ({
  badges,
  size = 'md',
  maxDisplay,
  className
}) => {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remaining = maxDisplay ? badges.length - maxDisplay : 0;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayBadges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <BadgeDisplay badge={badge} size={size} />
        </motion.div>
      ))}
      {remaining > 0 && (
        <div className={cn(
          "rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium",
          size === 'sm' && 'w-8 h-8 text-xs',
          size === 'md' && 'w-12 h-12 text-sm',
          size === 'lg' && 'w-16 h-16 text-base'
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
};
