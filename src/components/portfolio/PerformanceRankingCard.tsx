import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
interface SalespersonPerformance {
  id: string;
  name: string;
  totalSales: number;
  activeClientsCount: number;
  rank?: number;
  conversionRate?: number;
  dealsCount?: number;
}
import { Crown, Medal, Trophy, TrendingUp, Users, Percent } from "lucide-react";

interface PerformanceRankingCardProps {
  data: SalespersonPerformance[] | undefined;
  isLoading: boolean;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-warning" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Trophy className="h-5 w-5 text-rank-gold" />;
    default:
      return (
        <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
          {rank}
        </span>
      );
  }
};

const getRankBadgeStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-rank-gold/20 border-warning/30 text-warning dark:text-coins";
    case 2:
      return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-400/30 text-gray-600 dark:text-gray-300";
    case 3:
      return "bg-gradient-to-r from-rank-gold/20 to-orange-500/20 border-rank-gold/30 text-rank-gold dark:text-rank-gold";
    default:
      return "bg-muted";
  }
};

export function PerformanceRankingCard({ data, isLoading }: PerformanceRankingCardProps) {
  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ranking de Performance
          <Badge variant="outline" className="ml-auto text-xs">
            Mês Atual
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Leads são priorizados para os top performers
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {data?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nenhum Closer cadastrado</p>
          </div>
        ) : (
          data?.map((sp, idx) => (
            <div
              key={sp.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                (sp.rank ?? idx + 1) <= 3 ? getRankBadgeStyle(sp.rank ?? idx + 1) : "bg-muted/50 border-border/50"
              }`}
            >
              <div className="flex-shrink-0">{getRankIcon(sp.rank ?? idx + 1)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{sp.name}</p>
                  {(sp.rank ?? idx + 1) === 1 && (
                    <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30 text-xs">
                      Top Performer
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(sp.totalSales)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {(sp.conversionRate ?? 0).toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {sp.activeClientsCount} ativos
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold gradient-text">
                  {sp.dealsCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">vendas</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
