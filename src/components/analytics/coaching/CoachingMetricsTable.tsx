import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, BarChart3, Crown, Trophy } from "lucide-react";
import type { CoachingData } from "@/hooks/sales/useSalespersonCoaching";

const getRankBadge = (index: number) => {
  const colors = [
    'bg-rank-gold/20 text-rank-gold border-rank-gold/30',
    'bg-rank-silver/20 text-rank-silver border-rank-silver/30',
    'bg-rank-bronze/20 text-rank-bronze border-rank-bronze/30',
    'bg-muted text-muted-foreground border-border'
  ];
  return colors[index] || colors[3];
};

const getRankIcon = (index: number) => {
  if (index === 0) return <Crown className="h-3 w-3" />;
  if (index === 1) return <Trophy className="h-3 w-3" />;
  return null;
};

const getComparisonColor = (value: number) => {
  if (value > 5) return 'text-status-success';
  if (value < -5) return 'text-status-error';
  return 'text-status-warning';
};

interface CoachingMetricsTableProps {
  rankedData: CoachingData[];
}

export const CoachingMetricsTable = React.memo(function CoachingMetricsTable({ rankedData }: CoachingMetricsTableProps) {
  return (
    <Card className="glass dark:border-glow card-elevated animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-display">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10">
            <BarChart3 className="h-5 w-5 text-secondary" />
          </div>
          <span className="gradient-text">Comparativo de Métricas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">Vendedor</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Ranking</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Vitórias</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Derrotas</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Win Rate</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">vs Equipe</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {rankedData.map((coaching, index) => (
                  <tr
                    key={coaching.salesperson.id}
                    className={`border-b border-border/30 transition-colors animate-fade-in ${index === 0 ? 'bg-rank-gold/5' : 'hover:bg-background/50'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar className={`h-8 w-8 ${index === 0 ? 'border-2 border-rank-gold shadow-sm shadow-rank-gold/20' : ''}`}>
                          <AvatarImage src={coaching.salesperson.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 font-display">{coaching.salesperson.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className={`font-medium ${index === 0 ? 'gradient-text font-display' : ''}`}>{coaching.salesperson.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge variant="outline" className={`${getRankBadge(index)} border`}>{getRankIcon(index)}#{index + 1}</Badge>
                    </td>
                    <td className="text-center py-3 px-2 font-mono text-sm">{coaching.metrics.totalDeals}</td>
                    <td className="text-center py-3 px-2 font-mono text-sm text-status-success">{coaching.metrics.wins}</td>
                    <td className="text-center py-3 px-2 font-mono text-sm text-status-error">{coaching.metrics.losses}</td>
                    <td className="text-center py-3 px-2">
                      <span className={`font-bold text-lg font-display ${coaching.metrics.winRate >= 60 ? 'text-status-success' : coaching.metrics.winRate >= 40 ? 'text-status-warning' : 'text-status-error'}`}>
                        {coaching.metrics.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className={`flex items-center justify-center gap-1 ${getComparisonColor(coaching.metrics.comparisonToTeam)}`}>
                        {coaching.metrics.comparisonToTeam >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-medium text-sm">{coaching.metrics.comparisonToTeam >= 0 ? '+' : ''}{coaching.metrics.comparisonToTeam.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 font-mono text-sm">R$ {coaching.metrics.avgDealValue.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
