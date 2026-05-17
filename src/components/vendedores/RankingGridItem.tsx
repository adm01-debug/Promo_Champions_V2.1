import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award, Flame, Star, Zap, Swords, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HexFrame } from "./podium/HexFrame";

interface RankingGridItemProps {
  id: string;
  name: string;
  avatar_url: string | null;
  rank: number;
  totalSales: number;
  goalAmount: number;
  goalProgress: number;
  completedSales: number;
  index: number;
}

const getRankDecor = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        icon: <Crown className="h-4 w-4 text-rank-gold" />,
        border: "border-rank-gold/50",
        bg: "from-rank-gold/20 via-background to-background shadow-[0_0_20px_rgba(251,191,36,0.1)]",
        rankBg: "bg-gradient-to-br from-rank-gold to-coins text-foreground",
        glow: "#f59e0b",
      };
    case 2:
      return {
        icon: <Medal className="h-4 w-4 text-slate-300" />,
        border: "border-slate-400/40",
        bg: "from-slate-400/15 via-background to-background",
        rankBg: "bg-gradient-to-br from-slate-400 to-slate-500 text-primary-foreground",
        glow: "#94a3b8",
      };
    case 3:
      return {
        icon: <Award className="h-4 w-4 text-amber-600" />,
        border: "border-amber-700/40",
        bg: "from-amber-700/15 via-background to-background",
        rankBg: "bg-gradient-to-br from-amber-700 to-amber-900 text-primary-foreground",
        glow: "#b45309",
      };
    default:
      return {
        icon: null,
        border: "border-white/5",
        bg: "bg-white/5 backdrop-blur-sm",
        rankBg: "bg-white/10 text-muted-foreground",
        glow: "#3b82f6",
      };
  }
};

export const RankingGridItem = React.memo(function RankingGridItem({
  id,
  name,
  avatar_url,
  rank,
  totalSales,
  goalAmount,
  goalProgress,
  completedSales,
  index,
}: RankingGridItemProps) {
  const decor = getRankDecor(rank);
  const remaining = Math.max(goalAmount - totalSales, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
    >
      <Link
        to={`/vendedor/${id}`}
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 group relative overflow-hidden",
          decor.border,
          decor.bg
        )}
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)` }} />
        
        {/* Rank badge */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg relative z-10",
            decor.rankBg
          )}
        >
          {decor.icon || rank}
        </div>

        {/* Avatar with HexFrame (subtle for list) */}
        <div className="relative z-10 shrink-0">
          <HexFrame glowColor={decor.glow} size="h-12 w-12" isChampion={rank === 1}>
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage src={avatar_url || undefined} alt={name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-black text-xs rounded-none">
                {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </HexFrame>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center justify-between mb-1">
            <p className="font-black text-sm truncate group-hover:text-primary transition-colors tracking-tight uppercase italic flex items-center gap-2">
              {name}
              {goalProgress >= 100 && <Flame className="h-3 w-3 text-streak animate-pulse" />}
            </p>
            <div className="flex items-center gap-1">
               <Zap className="h-3 w-3 text-primary animate-pulse" />
               <span className="text-[10px] font-black text-primary">XP {Math.floor(totalSales / 100)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1"><Trophy className="h-2.5 w-2.5" /> {completedSales} sales</span>
            <span className="flex items-center gap-1"><Swords className="h-2.5 w-2.5" /> 14 duels</span>
          </div>

          {/* Mini progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={cn(
                  "h-full rounded-full relative",
                  goalProgress >= 100 ? "bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-primary"
                )}
              >
                 <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
              </motion.div>
            </div>
            <span className={cn(
              "text-[10px] font-black italic tracking-tighter shrink-0 min-w-[30px] text-right",
              goalProgress >= 100 ? "text-success" : goalProgress >= 70 ? "text-rank-gold" : "text-muted-foreground"
            )}>
              {goalProgress.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Multiplier / Status Indicator */}
        <div className="flex flex-col items-end gap-1 shrink-0 ml-2 relative z-10">
          {goalProgress >= 100 ? (
             <Badge className="bg-success/20 text-success border-success/30 text-[9px] font-black uppercase py-0 h-5">MET BATI</Badge>
          ) : (
             <span className="text-[10px] font-black text-muted-foreground/60 tracking-tighter uppercase italic">
               -{(remaining/1000).toFixed(1)}k
             </span>
          )}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
            <Zap className="h-2.5 w-2.5 text-primary" />
            <span className="text-[9px] font-black text-primary">2.5x</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
