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
    if (index === 0) return "bg-gradient-to-r from-rank-gold/20 to-primary/20 border-rank-gold/50 hover-glow-gold";
    if (index === 1) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/20 border-rank-silver/50";
    if (index === 2) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/20 border-rank-bronze/50";
    return "";
  };

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rank-gold/20">
            <Trophy className="h-4 w-4 text-rank-gold" />
          </div>
          <span className="gradient-text">Top Closers - Faturamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {closers?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Trophy className="h-8 w-8 opacity-30 mb-2" />
            <p className="text-xs">Nenhum dado de Closer disponível</p>
          </div>
        )}
        {closers?.map((closer, index) => {
          const xpInfo = getXPInfo(closer.id);
          return (
            <div 
              key={closer.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all duration-200 cursor-pointer hover:shadow-sm ${getRankStyle(index)}`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                index === 0 ? "gradient-primary text-white" : 
                index === 1 ? "bg-rank-silver/30 text-rank-silver" : 
                index === 2 ? "bg-rank-bronze/30 text-rank-bronze" : "bg-muted"
              }`}>
                {index === 0 ? <Crown className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <Avatar className="h-8 w-8 shadow-sm">
                <AvatarImage src={closer.avatar_url || undefined} />
                <AvatarFallback className="text-xs gradient-primary text-white">
                  {closer.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-medium truncate ${index === 0 ? "gradient-text" : ""}`}>{closer.name}</p>
                  <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {closer.closedDeals} vendas fechadas
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-status-success" />
                  <span className={`text-sm font-bold ${index === 0 ? "gradient-text" : "text-status-success"}`}>
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
