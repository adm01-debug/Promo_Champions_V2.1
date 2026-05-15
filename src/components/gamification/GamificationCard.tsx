import React from "react";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Crown, Medal, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { GamificationStatsRow } from "./GamificationStatsRow";

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
  badges?: Array<{ icon: ReactNode; label: string; color: string }>;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="h-5 w-5 text-rank-gold" />;
    case 2: return <Medal className="h-5 w-5 text-rank-silver" />;
    case 3: return <Award className="h-5 w-5 text-rank-bronze" />;
    default: return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1: return "bg-gradient-to-r from-rank-gold to-coins text-background shadow-glow-gold";
    case 2: return "bg-gradient-to-r from-rank-silver to-gray-300 text-background";
    case 3: return "bg-gradient-to-r from-rank-bronze to-streak text-background";
    default: return "bg-muted text-muted-foreground";
  }
};

const avatarSizes = { sm: "h-10 w-10", md: "h-14 w-14", lg: "h-16 w-16" };
const sizeClasses = { sm: "p-3", md: "p-4", lg: "p-5" };

function _GamificationCard({
  name, avatarUrl, level, totalXP, xpProgress, xpToNext,
  levelTitle, levelEmoji, levelColor, rank,
  streak = 0, streakRecord = 0, achievements = 0,
  badges = [], showDetails = true, size = "md", onClick,
}: GamificationCardProps) {
  const progress = xpToNext > 0 ? (xpProgress / xpToNext) * 100 : 100;
  const isMaxLevel = level >= 20;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "glass-card relative overflow-hidden cursor-pointer group",
        "border border-border/40 dark:border-glow rounded-xl",
        "hover:shadow-elevated hover:border-primary/20 transition-all duration-300",
        sizeClasses[size],
        rank === 1 && "ring-2 ring-rank-gold/30 hover-glow-gold shadow-[0_0_20px_hsl(var(--coins)/0.08)]",
        rank === 2 && "ring-1 ring-rank-silver/30 shadow-[0_0_15px_rgba(148,163,184,0.06)]",
        rank === 3 && "ring-1 ring-rank-bronze/30 shadow-[0_0_15px_hsl(var(--streak)/0.06)]"
      )}
      onClick={onClick}
    >
      {rank && rank <= 3 && (
        <div className={cn(
          "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300",
          rank === 1 && "bg-gradient-to-br from-rank-gold via-transparent to-transparent",
          rank === 2 && "bg-gradient-to-br from-rank-silver via-transparent to-transparent",
          rank === 3 && "bg-gradient-to-br from-rank-bronze via-transparent to-transparent"
        )} />
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <div className={cn("rounded-full p-0.5 bg-gradient-to-br", levelColor, "shadow-lg")}>
              <div className={cn("rounded-full overflow-hidden bg-background", avatarSizes[size])}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className={cn("h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-display font-bold", size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-xl")}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className={cn("absolute -bottom-1 -right-1 rounded-full flex items-center justify-center bg-gradient-to-br shadow-md border-2 border-background", levelColor, size === "sm" ? "h-5 w-5 text-[8px]" : "h-6 w-6 text-[10px]")}>
              <span className="font-bold text-primary-foreground">{level}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn("font-display font-bold truncate", size === "sm" ? "text-sm" : "text-base")}>{name}</h3>
              {rank && (
                <div className={cn("flex items-center justify-center rounded-full", size === "sm" ? "h-5 w-5" : "h-6 w-6", getRankBadgeColor(rank))}>
                  {getRankIcon(rank)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="secondary" className={cn("bg-gradient-to-r text-primary-foreground border-0 px-1.5 py-0 text-[9px] font-medium", levelColor)}>
                {levelEmoji} {levelTitle}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <Zap className="h-3 w-3 text-xp" />
              <span className="text-xs font-display font-bold text-xp">{totalXP.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 space-y-1.5">
            <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} className={cn("h-full rounded-full bg-gradient-to-r relative overflow-hidden", levelColor)}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-xp-shimmer" />
              </motion.div>
            </div>
            {!isMaxLevel && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{xpProgress.toLocaleString()} / {xpToNext.toLocaleString()}</span>
                <span className="flex items-center gap-1 text-primary font-medium"><TrendingUp className="h-2.5 w-2.5" />Nv.{level + 1}</span>
              </div>
            )}
            {isMaxLevel && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-rank-gold font-medium">
                <Trophy className="h-3 w-3" /><span>Nível Máximo!</span>
              </div>
            )}
          </div>
        )}

        {showDetails && <GamificationStatsRow streak={streak} streakRecord={streakRecord} achievements={achievements} />}

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className={cn("text-[9px] px-1.5 py-0 flex items-center gap-1", badge.color)}>
                {badge.icon}{badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { CompactGamificationCard } from "./CompactGamificationCard";

export const GamificationCard = React.memo(_GamificationCard);
