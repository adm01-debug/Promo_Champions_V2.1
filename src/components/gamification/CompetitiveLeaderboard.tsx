import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useAuth } from "@/contexts/AuthContext";
import { useAllSalespeopleXP } from "@/hooks/gamification/useSalespersonXP";
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

interface CompetitiveLeaderboardProps {
  showAll?: boolean;
}

function _CompetitiveLeaderboard({ showAll: _showAll = false }: CompetitiveLeaderboardProps) {
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
      <Card variant="elevated" className="glass border border-border/40 dark:border-glow card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary shadow-md">
              <Crown className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">Circuito de Vendas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="glass border border-border/40 dark:border-glow card-elevated overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary shadow-md">
              <Crown className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">Circuito de Vendas</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-sm">
            {ranking?.length || 0} competidores
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-2.5">
            {ranking?.map((person, _index) => {
              const RankIcon = RANK_ICONS[person.rank] || TrendingUp;
              const isCurrentUser = salesperson?.id === person.id;
              const isTopThree = person.rank <= 3;
              const roleInfo = roleLabels[person.role] || roleLabels.hybrid;
              const xpInfo = getXPInfo(person.id);

              return (
                <div
                  key={person.id}
                  className={`relative p-3 rounded-xl transition-all duration-300 cursor-pointer hover-lift ${
                    isCurrentUser 
                      ? "glass bg-primary/10 border-2 border-primary/40 ring-2 ring-primary/20 shadow-md" 
                      : isTopThree 
                        ? `glass bg-gradient-to-r ${person.color}/10 border border-border/30 hover:border-primary/30 ${person.rank === 1 ? 'hover-glow-gold shadow-md animate-subtle-pulse' : 'shadow-sm'}`
                        : "glass bg-muted/20 border border-border/20 hover:bg-muted/40 hover:border-border/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div 
                      className={`flex items-center justify-center w-11 h-11 rounded-xl font-display font-bold transition-transform hover:scale-105 ${
                        isTopThree
                          ? `bg-gradient-to-br ${person.color} text-primary-foreground shadow-lg`
                          : "bg-muted/50 text-muted-foreground border border-border/30"
                      }`}
                    >
                      {isTopThree ? (
                        <RankIcon className={`h-5 w-5 ${person.rank === 1 ? 'animate-float' : ''}`} />
                      ) : (
                        <span className="text-sm">#{person.rank}</span>
                      )}
                    </div>

                    {/* Avatar e info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar className={`h-9 w-9 border-2 shadow-md ${isTopThree ? 'border-primary/30' : 'border-background'}`}>
                          <AvatarImage src={person.avatar_url || undefined} alt={person.name} />
                          <AvatarFallback className="text-xs font-display font-medium gradient-primary text-primary-foreground">
                            {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-display font-medium text-sm truncate ${isCurrentUser ? "text-primary" : isTopThree ? "gradient-text" : ""}`}>
                              {person.name}
                            </span>
                            <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                            {person.title && (
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] px-1.5 py-0 bg-gradient-to-r ${person.color} text-primary-foreground border-0 shadow-sm animate-bounce-in hover:animate-pop`}
                              >
                                {person.emoji} {person.title}
                              </Badge>
                            )}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30 shadow-sm animate-bounce-in">
                                Você
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${roleInfo.color} border border-current/20`}>
                              {roleInfo.label}
                            </Badge>
                            {person.dealsCount >= 5 && (
                              <span className="flex items-center gap-0.5 text-[10px] text-status-warning font-medium">
                                <Flame className="h-3 w-3 animate-fire-pulse" />
                                {person.dealsCount} deals
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className={`font-display font-bold ${isTopThree ? "text-lg" : "text-sm"} ${person.rank === 1 ? "gradient-text" : ""}`}>
                        {formatCurrency(person.totalSales)}
                      </p>
                      {person.rank > 1 && (
                        <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5">
                          <TrendingUp className="h-2.5 w-2.5" />
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

export const CompetitiveLeaderboard = React.memo(_CompetitiveLeaderboard);
