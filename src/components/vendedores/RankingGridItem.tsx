import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Crown, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
        border: "border-rank-gold/40",
        bg: "from-rank-gold/15 to-transparent",
        rankBg: "bg-gradient-to-br from-rank-gold to-coins text-foreground",
      };
    case 2:
      return {
        icon: <Medal className="h-4 w-4 text-slate-300" />,
        border: "border-slate-400/40",
        bg: "from-slate-400/10 to-transparent",
        rankBg: "bg-gradient-to-br from-slate-400 to-slate-500 text-primary-foreground",
      };
    case 3:
      return {
        icon: <Award className="h-4 w-4 text-rank-gold" />,
        border: "border-rank-gold/40",
        bg: "from-rank-gold/10 to-transparent",
        rankBg: "bg-gradient-to-br from-rank-gold to-rank-gold/80 text-primary-foreground",
      };
    default:
      return {
        icon: null,
        border: "border-border/30",
        bg: "from-muted/5 to-transparent",
        rankBg: "bg-muted/60 text-muted-foreground",
      };
  }
};

export function RankingGridItem({
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Link
        to={`/vendedor/${id}`}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r transition-all duration-200 hover:shadow-md hover:scale-[1.01] group",
          decor.border,
          decor.bg
        )}
      >
        {/* Rank badge */}
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm",
            decor.rankBg
          )}
        >
          {decor.icon || rank}
        </div>

        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border/30 shadow">
          <AvatarImage src={avatar_url || undefined} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold text-xs">
            {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {name}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
            <span>Metas: {goalAmount > 0 ? (goalAmount / 1000).toFixed(0) + "k" : "0"}</span>
            <span>Vendas: {completedSales}</span>
          </div>

          {/* Mini progress */}
          <div className="mt-1.5 flex items-center gap-2">
            <Progress
              value={Math.min(goalProgress, 100)}
              className="h-1.5 flex-1"
            />
            <span className={cn(
              "text-[11px] font-bold shrink-0",
              goalProgress >= 100 ? "text-success" : goalProgress >= 70 ? "text-rank-gold" : "text-muted-foreground"
            )}>
              {goalProgress.toFixed(0)}%
            </span>
          </div>

          {remaining > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Faltam: R$ {remaining.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
