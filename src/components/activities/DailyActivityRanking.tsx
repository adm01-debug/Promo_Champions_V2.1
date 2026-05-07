import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Medal, Award, Trophy, Flame, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { useAllSalespeopleXP } from "@/hooks/useSalespersonXP";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";

interface DailyActivityRankingProps {
  data: ActivityGoalProgress[];
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-4 w-4 text-rank-gold drop-shadow-glow" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-rank-silver" />;
  if (rank === 3) return <Award className="h-4 w-4 text-rank-bronze" />;
  return null;
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-rank-gold/20 to-rank-gold/5 border-rank-gold/40 shadow-sm shadow-rank-gold/10";
  if (rank === 2) return "bg-gradient-to-r from-rank-silver/20 to-rank-silver/5 border-rank-silver/40";
  if (rank === 3) return "bg-gradient-to-r from-rank-bronze/20 to-rank-bronze/5 border-rank-bronze/40";
  return "bg-muted/30 border-border/30 hover:bg-muted/50";
};

const getStatusBadge = (progress: number, hasGoals: boolean) => {
  if (!hasGoals) return null;
  if (progress >= 100) {
    return (
      <Badge className="bg-gradient-to-r from-status-success/30 to-status-success/20 text-status-success text-[10px] gap-1 border border-status-success/30 animate-bounce-in hover:animate-pop">
        <Flame className="h-3 w-3 animate-fire-pulse" />
        Meta Batida!
      </Badge>
    );
  }
  if (progress >= 80) {
    return <Badge className="bg-status-info/20 text-status-info text-[10px] border border-status-info/30 animate-bounce-in">Quase lá!</Badge>;
  }
  return null;
};

function _DailyActivityRanking({ data }: DailyActivityRankingProps) {
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
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">Ranking do Dia</span>
          </CardTitle>
          {completedCount > 0 && (
            <Badge className="bg-gradient-to-r from-status-success/30 to-status-success/20 text-status-success text-xs border border-status-success/40 shadow-sm shadow-status-success/20 animate-bounce-in hover:animate-pop font-medium">
              🎉 {completedCount} bateram meta
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-2">
            {rankedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-lg border border-dashed border-border/50">
                <div className="p-3 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-3 shadow-inner">
                  <Trophy className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-sm font-display font-medium gradient-text">Nenhuma meta configurada</p>
                <p className="text-xs mt-1 text-muted-foreground">Configure metas para ver o ranking</p>
              </div>
            ) : (
              rankedData.map((sp, index) => {
                const rank = index + 1;
                const xpInfo = getXPInfo(sp.salesperson_id);
                const isTopThree = rank <= 3;
                const hasCompletedGoal = sp.progress.overall >= 100;
                
                return (
                  <div
                    key={sp.salesperson_id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 group animate-fade-in ${getRankStyle(rank)} ${
                      hasCompletedGoal ? 'ring-1 ring-status-success/40 shadow-md shadow-status-success/10' : ''
                    } ${isTopThree ? 'hover-lift' : 'hover:bg-muted/50'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      isTopThree ? 'bg-background/80 shadow-md' : 'bg-muted/50'
                    }`}>
                      {getRankIcon(rank) || (
                        <span className="text-xs font-bold text-muted-foreground">{rank}º</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className={`h-9 w-9 border-2 transition-all duration-300 group-hover:scale-105 ${
                      isTopThree ? 'border-primary/50 shadow-sm' : 'border-border/40'
                    }`}>
                      <AvatarImage src={sp.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/20 text-primary text-xs font-medium">
                        {sp.salesperson_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-display font-semibold text-sm truncate transition-colors ${
                          rank === 1 ? 'gradient-text' : 'group-hover:text-primary'
                        }`}>
                          {sp.salesperson_name}
                        </span>
                        <SalespersonLevelBadge level={xpInfo.level} totalXP={xpInfo.totalXP} size="xs" />
                        {getStatusBadge(sp.progress.overall, sp.hasGoals)}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 font-medium">
                        <span className="flex items-center gap-0.5">📞 {sp.current.calls}/{sp.goals.calls}</span>
                        <span className="flex items-center gap-0.5">📧 {sp.current.emails}/{sp.goals.emails}</span>
                        <span className="flex items-center gap-0.5">📅 {sp.current.meetings}/{sp.goals.meetings}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-display font-bold transition-all duration-300 ${
                        sp.progress.overall >= 100 ? 'gradient-text scale-105' : 
                        sp.progress.overall >= 70 ? 'text-status-info' : 
                        sp.progress.overall >= 40 ? 'text-status-warning' : 
                        'text-status-error'
                      }`}>
                        {sp.progress.overall.toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">progresso</div>
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

export const DailyActivityRanking = React.memo(_DailyActivityRanking);
