import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Crown, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { SalespersonPerformance } from "@/hooks/usePerformanceComparison";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function ComparisonIndicator({ value, avg }: { value: number; avg: number }) {
  const diff = avg > 0 ? ((value - avg) / avg) * 100 : 0;
  if (Math.abs(diff) < 5) return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (diff > 0) return <span className="flex items-center gap-1 text-status-success text-xs"><ArrowUp className="h-3 w-3" />+{diff.toFixed(0)}%</span>;
  return <span className="flex items-center gap-1 text-status-error text-xs"><ArrowDown className="h-3 w-3" />{diff.toFixed(0)}%</span>;
}

interface SalespersonCardProps {
  person: SalespersonPerformance;
  rank: number;
  avgRevenue: number;
  avgActivities: number;
  avgWinRate: number;
  index: number;
}

export const SalespersonCard = React.memo(function SalespersonCard({
  person, rank, avgRevenue, avgActivities, avgWinRate, index
}: SalespersonCardProps) {
  const isTop = rank === 1;
  const isTopThree = rank <= 3;

  return (
    <div
      className={`p-4 rounded-xl glass border border-border/40 dark:border-glow transition-all duration-300 animate-fade-in ${
        isTop ? "ring-1 ring-rank-gold/30 hover-glow-gold bg-gradient-to-br from-rank-gold/5 to-transparent"
          : isTopThree ? "hover-glow" : "hover-lift"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="relative group">
          <Avatar className={`h-12 w-12 transition-all duration-300 group-hover:scale-105 ${
            isTop ? "border-2 border-rank-gold shadow-lg shadow-rank-gold/20" :
            isTopThree ? "border-2 border-primary/30" : ""
          }`}>
            <AvatarImage src={person.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold font-display">
              {person.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {isTop && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-rank-gold to-rank-gold/80 rounded-full p-1 shadow-lg animate-pulse">
              <Crown className="h-3 w-3 text-background" />
            </div>
          )}
          {rank === 2 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full p-0.5 shadow">
              <span className="text-[8px] font-bold text-background">2º</span>
            </div>
          )}
          {rank === 3 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-rank-gold to-rank-gold/80 rounded-full p-0.5 shadow">
              <span className="text-[8px] font-bold text-background">3º</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold font-display truncate ${isTop ? "gradient-text" : ""}`}>
              {person.name}
            </span>
            {isTop && (
              <Badge variant="secondary" className="bg-rank-gold/20 text-rank-gold text-[10px] border border-rank-gold/30">
                <Trophy className="h-2.5 w-2.5 mr-1" />Top
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Receita</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs">{formatCurrency(person.totalRevenue)}</span>
                <ComparisonIndicator value={person.totalRevenue} avg={avgRevenue} />
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Win Rate</span>
              <div className="flex items-center gap-1.5">
                <span className={`font-medium text-xs ${person.winRate >= 50 ? "text-status-success" : ""}`}>
                  {person.winRate.toFixed(0)}%
                </span>
                <ComparisonIndicator value={person.winRate} avg={avgWinRate} />
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Atividades</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs">{person.totalActivities}</span>
                <ComparisonIndicator value={person.totalActivities} avg={avgActivities} />
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-background/30 dark:bg-background/10">
              <span className="text-muted-foreground text-xs">Vendas</span>
              <span className="font-medium text-xs">{person.totalSales}</span>
            </div>
          </div>

          {person.goalProgress > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-background/30 dark:bg-background/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" />Meta</span>
                <span className={`font-medium ${
                  person.goalProgress >= 100 ? "text-status-success" : person.goalProgress >= 75 ? "text-status-warning" : ""
                }`}>{person.goalProgress.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(person.goalProgress, 100)} className={`h-1.5 ${person.goalProgress >= 100 ? "[&>div]:bg-status-success" : ""}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
