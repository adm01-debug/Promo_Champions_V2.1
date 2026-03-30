import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Trophy, Flame, Crown, Medal, Award, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationCardProps {
  name: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  xpProgress: number;
  xpToNext: number;
  levelTitle: string;
  levelEmoji: string;
  levelColor: string;
  rank?: number;
  streak?: number;
  streakRecord?: number;
  achievements?: number;
  badges?: Array<{
    icon: ReactNode;
    label: string;
    color: string;
  }>;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-rank-gold" />;
    case 2:
      return <Medal className="h-5 w-5 text-rank-silver" />;
    case 3:
      return <Award className="h-5 w-5 text-rank-bronze" />;
    default:
      return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-rank-gold to-yellow-400 text-background shadow-glow-gold";
    case 2:
      return "bg-gradient-to-r from-rank-silver to-gray-300 text-background";
    case 3:
      return "bg-gradient-to-r from-rank-bronze to-orange-400 text-background";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function GamificationCard({
  name,
  avatarUrl,
  level,
  totalXP,
  xpProgress,
  xpToNext,
  levelTitle,
  levelEmoji,
  levelColor,
  rank,
  streak = 0,
  streakRecord = 0,
  achievements = 0,
  badges = [],
  showDetails = true,
  size = "md",
  onClick,
}: GamificationCardProps) {
  const progress = xpToNext > 0 ? (xpProgress / xpToNext) * 100 : 100;
  const isMaxLevel = level >= 20;

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  const avatarSizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "glass-card relative overflow-hidden cursor-pointer group",
        "border border-border/40 dark:border-glow rounded-xl",
        "hover:shadow-elevated transition-all duration-300",
        sizeClasses[size],
        rank === 1 && "ring-2 ring-rank-gold/30 hover-glow-gold",
        rank === 2 && "ring-1 ring-rank-silver/30",
        rank === 3 && "ring-1 ring-rank-bronze/30"
      )}
      onClick={onClick}
    >
      {/* Background glow effect for top ranks */}
      {rank && rank <= 3 && (
        <div className={cn(
          "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300",
          rank === 1 && "bg-gradient-to-br from-rank-gold via-transparent to-transparent",
          rank === 2 && "bg-gradient-to-br from-rank-silver via-transparent to-transparent",
          rank === 3 && "bg-gradient-to-br from-rank-bronze via-transparent to-transparent"
        )} />
      )}

      <div className="relative z-10">
        {/* Header with avatar and rank */}
        <div className="flex items-start gap-3">
          {/* Avatar with level ring */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "rounded-full p-0.5 bg-gradient-to-br",
              levelColor,
              "shadow-lg"
            )}>
              <div className={cn(
                "rounded-full overflow-hidden bg-background",
                avatarSizes[size]
              )}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={cn(
                    "h-full w-full flex items-center justify-center",
                    "bg-gradient-to-br from-primary/20 to-primary/10",
                    "text-primary font-display font-bold",
                    size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-xl"
                  )}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Level badge on avatar */}
            <div className={cn(
              "absolute -bottom-1 -right-1 rounded-full flex items-center justify-center",
              "bg-gradient-to-br shadow-md border-2 border-background",
              levelColor,
              size === "sm" ? "h-5 w-5 text-[8px]" : "h-6 w-6 text-[10px]"
            )}>
              <span className="font-bold text-white">{level}</span>
            </div>
          </div>

          {/* Name and title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-display font-bold truncate",
                size === "sm" ? "text-sm" : "text-base"
              )}>
                {name}
              </h3>
              {rank && (
                <div className={cn(
                  "flex items-center justify-center rounded-full",
                  size === "sm" ? "h-5 w-5" : "h-6 w-6",
                  getRankBadgeColor(rank)
                )}>
                  {getRankIcon(rank)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge 
                variant="secondary"
                className={cn(
                  "bg-gradient-to-r text-primary-foreground border-0 px-1.5 py-0",
                  "text-[9px] font-medium",
                  levelColor
                )}
              >
                {levelEmoji} {levelTitle}
              </Badge>
            </div>

            {/* XP Display */}
            <div className="flex items-center gap-1 mt-1.5">
              <Zap className="h-3 w-3 text-xp" />
              <span className="text-xs font-display font-bold text-xp">
                {totalXP.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        {showDetails && (
          <div className="mt-3 space-y-1.5">
            <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r relative overflow-hidden",
                  levelColor
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-xp-shimmer" />
              </motion.div>
            </div>
            
            {!isMaxLevel && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{xpProgress.toLocaleString()} / {xpToNext.toLocaleString()}</span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  <TrendingUp className="h-2.5 w-2.5" />
                  Nv.{level + 1}
                </span>
              </div>
            )}
            
            {isMaxLevel && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-rank-gold font-medium">
                <Trophy className="h-3 w-3" />
                <span>Nível Máximo!</span>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        {showDetails && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
            {/* Streak */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      streak >= 7 ? "bg-streak/20" : streak >= 3 ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Flame className={cn(
                        "h-3.5 w-3.5",
                        streak >= 7 ? "text-streak animate-fire-pulse" : 
                        streak >= 3 ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="text-xs">
                      <span className={cn(
                        "font-bold",
                        streak >= 7 ? "text-streak" : streak >= 3 ? "text-primary" : "text-foreground"
                      )}>
                        {streak}
                      </span>
                      <span className="text-muted-foreground ml-0.5">dias</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="glass border-border/40">
                  <p className="text-xs">
                    Sequência atual: <span className="font-bold">{streak} dias</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Recorde: {streakRecord} dias
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Achievements */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default">
                    <div className="p-1.5 rounded-lg bg-coins/20">
                      <Trophy className="h-3.5 w-3.5 text-coins" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-coins">{achievements}</span>
                      <span className="text-muted-foreground ml-0.5">conquistas</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="glass border-border/40">
                  <p className="text-xs">
                    Total de conquistas: <span className="font-bold">{achievements}</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Target/Goal indicator */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default ml-auto">
                    <div className="p-1.5 rounded-lg bg-success/20">
                      <Target className="h-3.5 w-3.5 text-success" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="glass border-border/40">
                  <p className="text-xs">Meta diária ativa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Custom badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={cn(
                  "text-[9px] px-1.5 py-0 flex items-center gap-1",
                  badge.color
                )}
              >
                {badge.icon}
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Compact version for lists/rankings
interface CompactGamificationCardProps {
  name: string;
  avatarUrl?: string;
  level: number;
  levelEmoji: string;
  levelColor: string;
  totalXP: number;
  rank?: number;
  streak?: number;
  onClick?: () => void;
}

export function CompactGamificationCard({
  name,
  avatarUrl,
  level,
  levelEmoji,
  levelColor,
  totalXP,
  rank,
  streak = 0,
  onClick,
}: CompactGamificationCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer group",
        "bg-card/50 hover:bg-card border border-border/30 hover:border-border/50",
        "transition-all duration-200",
        rank === 1 && "bg-rank-gold/5 border-rank-gold/30 hover:bg-rank-gold/10",
        rank === 2 && "bg-rank-silver/5 border-rank-silver/30",
        rank === 3 && "bg-rank-bronze/5 border-rank-bronze/30"
      )}
      onClick={onClick}
    >
      {/* Rank */}
      {rank && (
        <div className={cn(
          "flex items-center justify-center rounded-full w-7 h-7 flex-shrink-0",
          getRankBadgeColor(rank)
        )}>
          {rank <= 3 ? getRankIcon(rank) : <span className="text-xs font-bold">#{rank}</span>}
        </div>
      )}

      {/* Avatar with level */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          "h-10 w-10 rounded-full p-0.5 bg-gradient-to-br",
          levelColor
        )}>
          <div className="h-full w-full rounded-full overflow-hidden bg-background">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted text-sm font-bold">
                {name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full",
          "flex items-center justify-center text-[8px] font-bold text-white",
          "bg-gradient-to-br shadow-sm border border-background",
          levelColor
        )}>
          {level}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{name}</span>
          <span className="text-xs">{levelEmoji}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Zap className="h-2.5 w-2.5 text-xp" />
            <span className="font-bold text-xp">{totalXP.toLocaleString()}</span>
          </span>
          {streak > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame className={cn(
                "h-2.5 w-2.5",
                streak >= 7 ? "text-streak" : "text-primary"
              )} />
              <span className={streak >= 7 ? "text-streak font-bold" : ""}>
                {streak}d
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Arrow indicator */}
      <TrendingUp className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
