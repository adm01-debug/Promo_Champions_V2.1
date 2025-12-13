import { Flame, Trophy, Zap, Crown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStreakRanking } from "@/hooks/useAchievements";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";

const roleLabels: Record<string, string> = {
  sdr: "SDR",
  closer: "Closer",
  hybrid: "Híbrido",
};

const getStreakIcon = (streak: number) => {
  if (streak >= 30) return <Crown className="h-4 w-4 text-yellow-400" />;
  if (streak >= 15) return <Trophy className="h-4 w-4 text-purple-400" />;
  if (streak >= 7) return <Flame className="h-4 w-4 text-orange-400" />;
  if (streak >= 3) return <Zap className="h-4 w-4 text-blue-400" />;
  return <Target className="h-4 w-4 text-muted-foreground" />;
};

const getStreakBadgeColor = (streak: number) => {
  if (streak >= 30) return "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-yellow-300 border-yellow-500/50";
  if (streak >= 15) return "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-300 border-pink-500/50";
  if (streak >= 7) return "bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 border-orange-500/50";
  if (streak >= 3) return "bg-blue-500/20 text-blue-300 border-blue-500/40";
  return "bg-muted text-muted-foreground border-border";
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-yellow-500/40";
  if (rank === 2) return "bg-gradient-to-r from-slate-400/20 to-slate-300/20 border-slate-400/40";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/20 to-orange-600/20 border-amber-600/40";
  return "bg-muted/30 border-border/40";
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm text-muted-foreground font-medium">#{rank}</span>;
};

export function StreakRanking() {
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
            <Flame className="h-5 w-5 text-orange-400" />
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

  const hasAnyStreak = ranking?.some(r => r.bestStreak > 0);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
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
            {ranking?.filter(r => r.bestStreak > 0).map((person, index) => {
              const rank = index + 1;
              const xpInfo = getXPInfo(person.salesperson_id);
              
              return (
                <div
                  key={person.salesperson_id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.01] ${getRankStyle(rank)}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankBadge(rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className={`h-10 w-10 border-2 ${rank <= 3 ? 'border-current/30' : 'border-border/40'}`}>
                    <AvatarImage src={person.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {person.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium truncate">{person.name}</span>
                      <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                      <Badge variant="outline" className="text-[10px]">
                        {roleLabels[person.role] || person.role}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {person.totalGoalsAchieved} metas batidas no total
                    </div>
                  </div>

                  {/* Streaks */}
                  <div className="flex items-center gap-3">
                    {/* Current Streak */}
                    {person.currentStreak > 0 && (
                      <div className="text-center">
                        <Badge className={`${getStreakBadgeColor(person.currentStreak)} flex items-center gap-1`}>
                          {getStreakIcon(person.currentStreak)}
                          <span>{person.currentStreak}</span>
                        </Badge>
                        <div className="text-[9px] text-muted-foreground mt-1">Atual</div>
                      </div>
                    )}

                    {/* Best Streak */}
                    <div className="text-center">
                      <div className={`px-3 py-1.5 rounded-lg border ${getStreakBadgeColor(person.bestStreak)} flex items-center gap-1.5`}>
                        <Trophy className="h-4 w-4" />
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
