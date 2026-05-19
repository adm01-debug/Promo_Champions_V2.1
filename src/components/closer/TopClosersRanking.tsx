import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Crown, DollarSign, Medal, TrendingUp, Sparkles } from "lucide-react";
import { useTopClosers } from "@/hooks/useCloserMetrics";
import { useAllSalespeopleXP } from "@/hooks/gamification/useSalespersonXP";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";
import { cn } from "@/lib/utils";

function _TopClosersRanking() {
  const { data: closers } = useTopClosers();
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-rank-gold/20 to-rank-gold/5 border-rank-gold/50 ring-1 ring-rank-gold/30 shadow-lg shadow-rank-gold/10 hover-glow-gold";
    if (index === 1) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/5 border-rank-silver/50 ring-1 ring-rank-silver/20 shadow-md";
    if (index === 2) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/5 border-rank-bronze/50 ring-1 ring-rank-bronze/20 shadow-md";
    return "border-border/40 hover:bg-muted/30 hover:border-primary/30";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-3.5 w-3.5" />;
    if (index === 1) return <Medal className="h-3.5 w-3.5" />;
    if (index === 2) return <Medal className="h-3.5 w-3.5" />;
    return index + 1;
  };

  const totalRevenue = closers?.reduce((sum, c) => sum + c.closedValue, 0) || 0;

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-rank-gold/20 to-rank-gold/5 shadow-lg group-hover:scale-110 transition-transform">
              <Trophy className="h-4 w-4 text-rank-gold" />
            </div>
            <span className="gradient-text">Top Closers</span>
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] bg-status-success/10 text-status-success shadow-sm">
            Faturamento
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2.5">
            {closers?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
                <div className="p-4 rounded-full bg-gradient-to-br from-rank-gold/10 to-rank-gold/5 mb-3 shadow-lg">
                  <Trophy className="h-10 w-10 text-rank-gold/50 animate-pulse" />
                </div>
                <p className="text-sm font-display font-medium gradient-text">Nenhum Closer disponível</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Adicione Closers para ver o ranking</p>
              </div>
            )}
            {closers?.map((closer, index) => {
              const xpInfo = getXPInfo(closer.id);
              const isTopThree = index < 3;
              const isTopPerformer = closer.closedValue > 0 && closer.closedValue === closers[0]?.closedValue;
              
              return (
                <div 
                  key={closer.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group animate-fade-in",
                    getRankStyle(index),
                    isTopThree ? "hover-lift" : "hover:scale-[1.01]"
                  )}
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg",
                    index === 0 && "bg-gradient-to-br from-rank-gold to-streak text-primary-foreground shadow-rank-gold/40 animate-float",
                    index === 1 && "bg-gradient-to-br from-rank-silver to-rank-silver/70 text-primary-foreground shadow-rank-silver/30",
                    index === 2 && "bg-gradient-to-br from-rank-bronze to-rank-bronze/70 text-primary-foreground shadow-rank-bronze/30",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {getRankIcon(index)}
                  </div>
                  <Avatar className={cn(
                    "h-9 w-9 shadow-md transition-all group-hover:scale-110",
                    isTopThree && "ring-2 ring-primary/30 group-hover:ring-primary/50"
                  )}>
                    <AvatarImage src={closer.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-display font-bold">
                      {closer.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn(
                        "text-sm font-display font-medium truncate transition-colors",
                        index === 0 ? "gradient-text" : "group-hover:text-primary"
                      )}>
                        {closer.name}
                      </p>
                      <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                      {isTopPerformer && index === 0 && (
                        <Sparkles className="h-3.5 w-3.5 text-rank-gold animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium mt-0.5">
                      <TrendingUp className="h-3 w-3 text-status-success" />
                      <span className="transition-colors group-hover:text-foreground/70">
                        {closer.closedDeals} vendas fechadas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-status-success transition-all group-hover:scale-110" />
                      <span className={cn(
                        "text-base font-display font-bold transition-all group-hover:scale-110",
                        index === 0 ? "gradient-text" : "text-status-success"
                      )}>
                        {closer.closedValue.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {totalRevenue > 0 && (
                      <span className="text-[9px] text-muted-foreground">
                        {((closer.closedValue / totalRevenue) * 100).toFixed(0)}% do total
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export const TopClosersRanking = React.memo(_TopClosersRanking);
