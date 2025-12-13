import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Medal, Award, Trophy, Flame } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";

interface DailyActivityRankingProps {
  data: ActivityGoalProgress[];
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-4 w-4 text-rank-gold" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-rank-silver" />;
  if (rank === 3) return <Award className="h-4 w-4 text-rank-bronze" />;
  return null;
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-rank-gold/20 to-rank-gold/10 border-rank-gold/40";
  if (rank === 2) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/10 border-rank-silver/40";
  if (rank === 3) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/10 border-rank-bronze/40";
  return "bg-card/50 border-border/30";
};

const getStatusBadge = (progress: number, hasGoals: boolean) => {
  if (!hasGoals) return null;
  if (progress >= 100) {
    return (
      <Badge className="bg-status-success/20 text-status-success text-[10px] gap-1">
        <Flame className="h-3 w-3" />
        Meta Batida!
      </Badge>
    );
  }
  if (progress >= 80) {
    return <Badge className="bg-status-info/20 text-status-info text-[10px]">Quase lá!</Badge>;
  }
  return null;
};

export function DailyActivityRanking({ data }: DailyActivityRankingProps) {
  const { data: xpData } = useAllSalespeopleXP();

  const getXPInfo = (salespersonId: string) => {
    const xp = xpData?.find(x => x.salesperson_id === salespersonId);
    return { level: xp?.current_level || 1, totalXP: xp?.total_xp || 0 };
  };

  // Filter only those with goals and sort by progress
  const rankedData = data
    .filter(d => d.hasGoals)
    .sort((a, b) => b.progress.overall - a.progress.overall);

  const completedCount = rankedData.filter(d => d.progress.overall >= 100).length;

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Ranking do Dia
          </CardTitle>
          {completedCount > 0 && (
            <Badge className="bg-status-success/20 text-status-success text-xs">
              {completedCount} bateram meta
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-2">
            {rankedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Nenhuma meta configurada</p>
                <p className="text-xs mt-1">Configure metas para ver o ranking</p>
              </div>
            ) : (
              rankedData.map((sp, index) => {
                const rank = index + 1;
                const xpInfo = getXPInfo(sp.salesperson_id);
                return (
                  <div
                    key={sp.salesperson_id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02] ${getRankStyle(rank)}`}
                  >
                    {/* Rank */}
                    <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0">
                      {getRankIcon(rank) || (
                        <span className="text-xs font-bold text-muted-foreground">{rank}º</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-9 w-9 border-2 border-border/40">
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {sp.salesperson_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm truncate">{sp.salesperson_name}</span>
                        <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                        {getStatusBadge(sp.progress.overall, sp.hasGoals)}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>📞 {sp.current.calls}/{sp.goals.calls}</span>
                        <span>📧 {sp.current.emails}/{sp.goals.emails}</span>
                        <span>📅 {sp.current.meetings}/{sp.goals.meetings}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-bold ${
                        sp.progress.overall >= 100 ? 'text-status-success' : 
                        sp.progress.overall >= 70 ? 'text-status-info' : 
                        sp.progress.overall >= 40 ? 'text-status-warning' : 
                        'text-status-error'
                      }`}>
                        {sp.progress.overall.toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground">progresso</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
