import { FC } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Lock, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from './ProgressRing';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'sales' | 'activities' | 'streak' | 'milestone' | 'special';
  xpReward: number;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
  className?: string;
}

const categoryIcons = {
  sales: '💰',
  activities: '📞',
  streak: '🔥',
  milestone: '🎯',
  special: '⭐'
};

const rarityStyles = {
  common: {
    border: 'border-muted-foreground/30',
    bg: 'bg-muted/5',
    text: 'text-muted-foreground',
    glow: '',
    gradient: 'from-muted-foreground/40 to-muted-foreground/60'
  },
  rare: {
    border: 'border-info/30',
    bg: 'bg-info/5',
    text: 'text-info',
    glow: 'shadow-info/20',
    gradient: 'from-info/40 to-info/60'
  },
  epic: {
    border: 'border-primary/30',
    bg: 'bg-primary/5',
    text: 'text-primary',
    glow: 'shadow-primary/20',
    gradient: 'from-primary/40 to-primary/60'
  },
  legendary: {
    border: 'border-coins/30',
    bg: 'bg-coins/10',
    text: 'text-coins',
    glow: 'shadow-coins/30',
    gradient: 'from-coins/40 to-streak/60'
  }
};

export const AchievementCard: FC<AchievementCardProps> = ({
  achievement,
  compact = false,
  className
}) => {
  const progress = Math.min((achievement.progress / achievement.target) * 100, 100);
  const style = rarityStyles[achievement.rarity];

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          achievement.unlocked ? style.bg : 'bg-muted/50',
          achievement.unlocked ? style.border : 'border-muted',
          className
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-lg",
          achievement.unlocked 
            ? `bg-gradient-to-br ${style.gradient}`
            : 'bg-muted'
        )}>
          {achievement.unlocked ? achievement.emoji : <Lock size={16} className="text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm truncate",
            !achievement.unlocked && "text-muted-foreground"
          )}>
            {achievement.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {achievement.progress}/{achievement.target}
          </p>
        </div>
        {achievement.unlocked ? (
          <CheckCircle2 size={18} className="text-success" />
        ) : (
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        "relative overflow-hidden p-4",
        achievement.unlocked && `shadow-lg ${style.glow}`,
        style.border,
        style.bg,
        className
      )}>
        {/* Rarity indicator */}
        <div className={cn(
          "absolute top-0 right-0 px-2 py-0.5 text-xs font-medium rounded-bl capitalize",
          style.text,
          'bg-background/80'
        )}>
          {achievement.rarity}
        </div>

        <div className="flex gap-4">
          {/* Achievement icon/progress */}
          <div className="relative">
            <ProgressRing
              progress={progress}
              size={64}
              strokeWidth={4}
              color={achievement.unlocked ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
              showPercent={false}
            >
              <span className={cn(
                "text-2xl",
                !achievement.unlocked && "grayscale opacity-50"
              )}>
                {achievement.emoji}
              </span>
            </ProgressRing>
            {achievement.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center"
              >
                <CheckCircle2 size={14} className="text-success-foreground" />
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={cn(
                  "font-semibold",
                  !achievement.unlocked && "text-muted-foreground"
                )}>
                  {achievement.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {achievement.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{categoryIcons[achievement.category]}</span>
                <span>{achievement.progress} / {achievement.target}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-coins">
                <Star size={12} className="fill-current" />
                +{achievement.xpReward} XP
              </div>
            </div>

            {/* Progress bar */}
            {!achievement.unlocked && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary rounded-full"
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}

            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-success mt-2">
                ✓ Conquistado em {achievement.unlockedAt.toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {/* Legendary shimmer effect */}
        {achievement.unlocked && achievement.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          />
        )}
      </Card>
    </motion.div>
  );
};

interface AchievementListProps {
  achievements: Achievement[];
  showLocked?: boolean;
  compact?: boolean;
  className?: string;
}

export const AchievementList: FC<AchievementListProps> = ({
  achievements,
  showLocked = true,
  compact = false,
  className
}) => {
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const filtered = showLocked 
    ? sortedAchievements 
    : sortedAchievements.filter(a => a.unlocked);

  return (
    <div className={cn(
      compact ? "space-y-2" : "grid gap-4 md:grid-cols-2",
      className
    )}>
      {filtered.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <AchievementCard achievement={achievement} compact={compact} />
        </motion.div>
      ))}
    </div>
  );
};
