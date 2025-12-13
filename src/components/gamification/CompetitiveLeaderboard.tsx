import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useAuth } from "@/contexts/AuthContext";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { Crown, Swords, Trophy, TrendingUp, Flame } from "lucide-react";
import { SalespersonLevelBadge } from "./SalespersonLevelBadge";

const RANK_ICONS: Record<number, React.ElementType> = {
  1: Crown,
  2: Swords,
  3: Trophy,
};

const roleLabels: Record<string, { label: string; color: string }> = {
  sdr: { label: "SDR", color: "bg-status-info/20 text-status-info" },
  closer: { label: "Closer", color: "bg-accent/20 text-accent" },
  hybrid: { label: "Híbrido", color: "bg-rank-gold/20 text-rank-gold" },
};

export function CompetitiveLeaderboard() {
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const { salesperson } = useAuth();
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Arena de Vendas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Arena de Vendas</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
            {ranking?.length || 0} competidores
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-2.5">
            {ranking?.map((person, index) => {
              const RankIcon = RANK_ICONS[person.rank] || TrendingUp;
              const isCurrentUser = salesperson?.id === person.id;
              const isTopThree = person.rank <= 3;
              const roleInfo = roleLabels[person.role] || roleLabels.hybrid;
              const xpInfo = getXPInfo(person.id);

              return (
                <div
                  key={person.id}
                  className={`relative p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isCurrentUser 
                      ? "glass bg-primary/10 border border-primary/40 ring-2 ring-primary/20 shadow-sm" 
                      : isTopThree 
                        ? `glass bg-gradient-to-r ${person.color}/10 border border-border/30 hover:border-primary/30 ${person.rank === 1 ? 'hover-glow-gold shadow-sm' : ''}`
                        : "glass bg-muted/20 border border-border/20 hover:bg-muted/40 hover:border-border/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div 
                      className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold ${
                        isTopThree
                          ? `bg-gradient-to-br ${person.color} text-primary-foreground shadow-lg`
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isTopThree ? (
                        <RankIcon className="h-5 w-5" />
                      ) : (
                        <span className="text-sm">#{person.rank}</span>
                      )}
                    </div>

                    {/* Avatar e info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                          <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                          <AvatarFallback className="text-xs font-medium gradient-primary text-white">
                            {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-medium text-sm truncate ${isCurrentUser ? "text-primary" : isTopThree ? "gradient-text" : ""}`}>
                              {person.name}
                            </span>
                            <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                            {person.title && (
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] px-1.5 py-0 bg-gradient-to-r ${person.color} text-primary-foreground border-0`}
                              >
                                {person.emoji} {person.title}
                              </Badge>
                            )}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">
                                Você
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${roleInfo.color}`}>
                              {roleInfo.label}
                            </Badge>
                            {person.dealsCount >= 5 && (
                              <span className="flex items-center gap-0.5 text-[10px] text-status-warning">
                                <Flame className="h-3 w-3" />
                                {person.dealsCount} deals
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className={`font-bold ${isTopThree ? "text-lg" : "text-sm"} ${person.rank === 1 ? "gradient-text" : ""}`}>
                        {formatCurrency(person.totalSales)}
                      </p>
                      {person.rank > 1 && (
                        <p className="text-[10px] text-muted-foreground">
                          -{formatCurrency(person.gapToFirst)} do líder
                        </p>
                      )}
                    </div>
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
