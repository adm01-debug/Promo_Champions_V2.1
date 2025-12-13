import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, DollarSign } from "lucide-react";
import { useTopClosers } from "@/hooks/useCloserMetrics";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";

export function TopClosersRanking() {
  const { data: closers } = useTopClosers();
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-rank-gold/20 to-rank-gold/5 border-rank-gold/50 shadow-md shadow-rank-gold/10 hover-glow-gold";
    if (index === 1) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/5 border-rank-silver/50 shadow-sm";
    if (index === 2) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/5 border-rank-bronze/50 shadow-sm";
    return "hover:bg-muted/30";
  };

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-rank-gold to-streak shadow-lg shadow-rank-gold/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-rank-gold/40">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Top Closers - Faturamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {closers?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground glass rounded-lg border border-dashed border-border/50 animate-fade-in">
            <div className="p-3 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-2 shadow-inner animate-pulse">
              <Trophy className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-xs font-display font-medium gradient-text">Nenhum dado de Closer disponível</p>
          </div>
        )}
        {closers?.map((closer, index) => {
          const xpInfo = getXPInfo(closer.id);
          const isTopThree = index < 3;
          return (
            <div 
              key={closer.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer group animate-fade-in ${getRankStyle(index)} ${isTopThree ? 'hover-lift' : 'hover:scale-[1.01]'}`}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                index === 0 ? "bg-gradient-to-br from-rank-gold to-streak text-white shadow-rank-gold/40" : 
                index === 1 ? "bg-gradient-to-br from-rank-silver to-rank-silver/70 text-white shadow-rank-silver/30" : 
                index === 2 ? "bg-gradient-to-br from-rank-bronze to-rank-bronze/70 text-white shadow-rank-bronze/30" : 
                "bg-muted text-muted-foreground"
              }`}>
                {index === 0 ? <Crown className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <Avatar className={`h-8 w-8 shadow-md transition-all duration-300 group-hover:scale-110 ${isTopThree ? 'ring-2 ring-primary/30 group-hover:ring-primary/50' : ''}`}>
                <AvatarImage src={closer.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white font-display font-bold">
                  {closer.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-display font-medium truncate transition-colors duration-300 ${index === 0 ? "gradient-text" : "group-hover:text-primary"}`}>{closer.name}</p>
                  <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium transition-colors group-hover:text-foreground/70">
                  {closer.closedDeals} vendas fechadas
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-status-success transition-all duration-300 group-hover:scale-110" />
                  <span className={`text-sm font-display font-bold transition-all duration-300 ${index === 0 ? "gradient-text" : "text-status-success"} group-hover:scale-110`}>
                    R$ {closer.closedValue.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
