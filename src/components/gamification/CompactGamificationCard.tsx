import { motion } from "framer-motion";
import { Zap, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1: return "bg-gradient-to-r from-rank-gold to-coins text-background shadow-glow-gold";
    case 2: return "bg-gradient-to-r from-rank-silver to-gray-300 text-background";
    case 3: return "bg-gradient-to-r from-rank-bronze to-streak text-background";
    default: return "bg-muted text-muted-foreground";
  }
};

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
  name, avatarUrl, level, levelEmoji, levelColor, totalXP, rank, streak = 0, onClick,
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
      {rank && (
        <div className={cn("flex items-center justify-center rounded-full w-7 h-7 flex-shrink-0", getRankBadgeColor(rank))}>
          {rank <= 3 ? (
            rank === 1 ? <span className="text-xs font-bold">👑</span> :
            rank === 2 ? <span className="text-xs font-bold">🥈</span> :
            <span className="text-xs font-bold">🥉</span>
          ) : <span className="text-xs font-bold">#{rank}</span>}
        </div>
      )}

      <div className="relative flex-shrink-0">
        <div className={cn("h-10 w-10 rounded-full p-0.5 bg-gradient-to-br", levelColor)}>
          <div className="h-full w-full rounded-full overflow-hidden bg-background">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted text-sm font-bold">{name.charAt(0)}</div>
            )}
          </div>
        </div>
        <div className={cn("absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold text-primary-foreground bg-gradient-to-br shadow-sm border border-background", levelColor)}>{level}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{name}</span>
          <span className="text-xs">{levelEmoji}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Zap className="h-2.5 w-2.5 text-xp" /><span className="font-bold text-xp">{totalXP.toLocaleString()}</span></span>
          {streak > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame className={cn("h-2.5 w-2.5", streak >= 7 ? "text-streak" : "text-primary")} />
              <span className={streak >= 7 ? "text-streak font-bold" : ""}>{streak}d</span>
            </span>
          )}
        </div>
      </div>

      <TrendingUp className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
