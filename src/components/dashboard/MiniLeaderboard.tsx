import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, Medal, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RANK_CONFIG = [
  { icon: Crown, color: "text-rank-gold", bg: "bg-rank-gold/10", border: "border-rank-gold/20" },
  { icon: Medal, color: "text-rank-silver", bg: "bg-rank-silver/10", border: "border-rank-silver/20" },
  { icon: Trophy, color: "text-rank-bronze", bg: "bg-rank-bronze/10", border: "border-rank-bronze/20" },
];

function _MiniLeaderboard() {
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const { salesperson } = useAuth();

  const top3 = ranking?.slice(0, 3) || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  if (isLoading) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
      </Card>
    );
  }

  if (!top3.length) return null;

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="pb-6 pt-0 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white/30 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rank-gold/10 ring-1 ring-rank-gold/20">
              <Crown className="h-4 w-4 text-rank-gold" />
            </div>
            Elite Council
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-primary transition-all">
            <Link to="/ranking">Full Arena →</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {top3.map((person, index) => {
          const config = RANK_CONFIG[index];
          const RankIcon = config.icon;
          const isCurrentUser = salesperson?.id === person.id;

          return (
            <div
              key={person.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-3xl transition-all duration-500 hover:scale-[1.02] border border-white/[0.03] group",
                isCurrentUser ? "bg-primary/5 border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]" : "bg-white/[0.02] hover:bg-white/[0.05]"
              )}
            >
              <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-500 group-hover:rotate-12", config.bg, "ring-1", config.border)}>
                <RankIcon className={cn("h-5 w-5", config.color)} />
              </div>
              <Avatar className={cn("h-10 w-10 border-2", config.border)}>
                <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                <AvatarFallback className="text-[10px] font-black uppercase bg-white/5">
                  {person.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-xs font-black uppercase tracking-tight truncate block group-hover:text-white transition-colors",
                  isCurrentUser ? "text-primary" : "text-white/60"
                )}>
                  {person.name}
                </span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  Level {Math.floor(person.totalSales / 10000) + 1}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white tabular-nums tracking-tighter">
                  {formatCurrency(person.totalSales)}
                </p>
                <div className="flex gap-0.5 mt-1 justify-end">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={cn("h-1 w-2 rounded-full", i <= (3 - index) ? "bg-primary/40" : "bg-white/5")} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export const MiniLeaderboard = React.memo(_MiniLeaderboard);
