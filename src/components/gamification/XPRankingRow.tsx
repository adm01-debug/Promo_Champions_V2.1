import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Award, TrendingUp, TrendingDown, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getLevelInfo } from "@/hooks/gamification/useSalespersonXP";

interface RankPosition {
  current: number;
  previous: number;
  change: "up" | "down" | "same";
  positionsChanged: number;
}

interface XPRankingRowProps {
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  totalXP: number;
  xpInLevel: number;
  xpToNext: number;
  currentStreak: number;
  dailyGoalsAchieved: number;
  rank: RankPosition;
  isHighlighted: boolean;
  index: number;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-rank-gold" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-rank-silver" />;
  if (rank === 3) return <Award className="h-5 w-5 text-rank-bronze" />;
  return <span className="text-sm font-mono text-muted-foreground">#{rank}</span>;
};

const getRankBadgeClass = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-rank-gold/20 to-rank-gold/5 border-rank-gold/30";
  if (rank === 2) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/5 border-rank-silver/30";
  if (rank === 3) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/5 border-rank-bronze/30";
  return "bg-muted/30 border-border/30";
};

export const XPRankingRow = React.memo(function XPRankingRow(props: XPRankingRowProps) {
  const { name, avatar_url, level, totalXP, xpInLevel, xpToNext, currentStreak, dailyGoalsAchieved, rank, isHighlighted, index, salesperson_id } = props;
  const levelInfo = getLevelInfo(level);

  return (
    <motion.div
      key={salesperson_id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: isHighlighted ? [1, 1.02, 1] : 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ layout: { type: "spring", stiffness: 300, damping: 30 }, duration: 0.3 }}
      className={cn("relative p-3 rounded-lg border transition-all duration-300", getRankBadgeClass(rank.current), isHighlighted && "ring-2 ring-xp/50 shadow-glow-xp")}
    >
      {isHighlighted && (
        <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 bg-xp/10 rounded-lg" />
      )}
      <div className="flex items-center gap-3 relative">
        <div className="flex flex-col items-center w-8">
          {getRankIcon(rank.current)}
          {rank.change !== "same" && (
            <motion.div initial={{ opacity: 0, y: rank.change === "up" ? 5 : -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-0.5 mt-0.5">
              {rank.change === "up" ? (<><TrendingUp className="h-3 w-3 text-status-success" /><span className="text-[10px] text-status-success">+{rank.positionsChanged}</span></>) : (<><TrendingDown className="h-3 w-3 text-destructive" /><span className="text-[10px] text-destructive">-{rank.positionsChanged}</span></>)}
            </motion.div>
          )}
        </div>
        <Avatar className="h-10 w-10 border-2 border-background">
          <AvatarImage src={avatar_url || undefined} />
          <AvatarFallback className="text-xs font-medium bg-muted">{name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2"><span className="font-medium text-sm truncate">{name}</span><span className="text-xs">{levelInfo.emoji}</span></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Nv.{level}</span><span>•</span><span>{levelInfo.title}</span>
            {currentStreak > 0 && (<><span>•</span><span className="flex items-center gap-0.5 text-streak"><Flame className="h-3 w-3" />{currentStreak}</span></>)}
          </div>
        </div>
        <div className="text-right">
          <motion.div className="flex items-center gap-1 text-xp font-mono font-bold" animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}>
            <Zap className="h-3.5 w-3.5" />{totalXP.toLocaleString()}
          </motion.div>
          <div className="text-[10px] text-muted-foreground">{dailyGoalsAchieved} metas</div>
        </div>
      </div>
      <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((xpInLevel / xpToNext) * 100, 100)}%` }} transition={{ duration: 0.5, delay: index * 0.05 }} className="h-full bg-gradient-xp rounded-full" />
      </div>
    </motion.div>
  );
});
