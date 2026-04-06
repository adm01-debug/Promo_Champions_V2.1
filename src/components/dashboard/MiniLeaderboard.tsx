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
  { icon: Crown, color: "text-rank-gold", bg: "bg-rank-gold/15", border: "border-rank-gold/30" },
  { icon: Medal, color: "text-rank-silver", bg: "bg-rank-silver/15", border: "border-rank-silver/30" },
  { icon: Trophy, color: "text-rank-bronze", bg: "bg-rank-bronze/15", border: "border-rank-bronze/30" },
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
      <Card className="glass border border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Crown className="h-4 w-4 text-rank-gold" />
            Top Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!top3.length) return null;

  return (
    <Card className="glass border border-border/40 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rank-gold/15">
              <Crown className="h-3.5 w-3.5 text-rank-gold" />
            </div>
            Top Vendedores
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground">
            <Link to="/ranking">Ver todos</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 pb-3">
        {top3.map((person, index) => {
          const config = RANK_CONFIG[index];
          const RankIcon = config.icon;
          const isCurrentUser = salesperson?.id === person.id;

          return (
            <div
              key={person.id}
              className={cn(
                "flex items-center gap-2.5 p-2 rounded-lg transition-all duration-200 hover:bg-muted/40 hover:shadow-sm hover:scale-[1.01]",
                isCurrentUser && "bg-primary/10 border border-primary/20"
              )}
            >
              <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg", config.bg)}>
                <RankIcon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <Avatar className={cn("h-7 w-7 border", config.border)}>
                <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                <AvatarFallback className="text-[10px] font-display font-medium">
                  {person.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-xs font-medium truncate block",
                  isCurrentUser && "text-primary"
                )}>
                  {person.name}
                  {isCurrentUser && " (Você)"}
                </span>
              </div>
              <span className="text-xs font-display font-bold tabular-nums">
                {formatCurrency(person.totalSales)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export const MiniLeaderboard = React.memo(_MiniLeaderboard);
