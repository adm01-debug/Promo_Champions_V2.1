import React from "react";
import { Flame, Trophy, Zap, Crown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStreakRanking } from "@/hooks/gamification/useAchievements";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";

const roleLabels: Record<string, string> = {
  sdr: "SDR",
  closer: "Closer",
  hybrid: "Híbrido",
};

const getStreakIcon = (streak: number) => {
  if (streak >= 30) return <Crown className="h-4 w-4 text-rank-gold" />;
  if (streak >= 15) return <Trophy className="h-4 w-4 text-status-purple" />;
  if (streak >= 7) return <Flame className="h-4 w-4 text-status-warning" />;
  if (streak >= 3) return <Zap className="h-4 w-4 text-status-info" />;
  return <Target className="h-4 w-4 text-muted-foreground" />;
};

const getStreakBadgeColor = (streak: number) => {
  if (streak >= 30) return "bg-gradient-to-r from-rank-gold/30 to-rank-gold/20 text-rank-gold border-rank-gold/50 animate-tada";
  if (streak >= 15) return "bg-gradient-to-r from-status-purple/30 to-accent/30 text-accent border-accent/50";
  if (streak >= 7) return "bg-gradient-to-r from-status-warning/30 to-status-error/30 text-status-warning border-status-warning/50";
  if (streak >= 3) return "bg-status-info/20 text-status-info border-status-info/40";
  return "bg-muted text-muted-foreground border-border";
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-rank-gold/20 to-rank-gold/10 border-rank-gold/40";
  if (rank === 2) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/10 border-rank-silver/40";
  if (rank === 3) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/10 border-rank-bronze/40";
  return "bg-muted/30 border-border/40";
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm text-muted-foreground font-medium">#{rank}</span>;
};

const StreakRankingComponent = () => {
  const { data: ranking, isLoading } = useStreakRanking();
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-status-warning" />
            Ranking de Sequências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAnyStreak = ranking?.some(r => r.bestStreak ?? 0 > 0);

  return (
    <Card variant="glass" className="bg-background/20 backdrop-blur-xl border-white/10 shadow-2xl transition-all duration-500 hover:bg-background/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-status-warning" />
          Ranking de Sequências
          <Badge variant="secondary" className="ml-2">
            Top Performers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyStreak ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma sequência registrada ainda.</p>
            <p className="text-sm">Bata metas em dias consecutivos para aparecer aqui!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking?.filter(r => r.bestStreak ?? 0 > 0).map((person, index) => {
              const rank = index + 1;
              const xpInfo = getXPInfo(person.salesperson_id);
              
              return (
                <div
                  key={person.salesperson_id}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:shadow-xl glass-morphism ${getRankStyle(rank)}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankBadge(rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className={`h-10 w-10 border-2 ${rank <= 3 ? 'border-current/30' : 'border-border/40'}`}>
                    <AvatarImage src={person.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {person.name ?? "".charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium truncate">{person.name ?? ""}</span>
                      <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                      <Badge variant="outline" className="text-[10px]">
                        {(person.role ? roleLabels[person.role] : undefined) || person.role}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {person.totalGoalsAchieved} metas batidas no total
                    </div>
                  </div>

                  {/* Streaks */}
                  <div className="flex items-center gap-3">
                    {/* Current Streak */}
                    {(person.currentStreak ?? 0) > 0 && (
                      <div className="text-center">
                        <Badge className={`${getStreakBadgeColor(person.currentStreak ?? 0)} flex items-center gap-1 animate-bounce-in hover:animate-pop`}>
                          {getStreakIcon(person.currentStreak ?? 0)}
                          <span>{person.currentStreak ?? 0}</span>
                        </Badge>
                        <div className="text-[9px] text-muted-foreground mt-1">Atual</div>
                      </div>
                    )}

                    {/* Best Streak */}
                    <div className="text-center">
                      <div className={`px-3 py-1.5 rounded-lg border ${getStreakBadgeColor(person.bestStreak ?? 0)} flex items-center gap-1.5 animate-bounce-in hover:animate-pop`}>
                        <Trophy className="h-4 w-4 group-hover:animate-wiggle" />
                        <span className="font-bold">{person.bestStreak}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-1">Recorde</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const StreakRanking = React.memo(StreakRankingComponent);