import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollaborativeMissions } from '@/hooks/useCollaborativeMissions';
import { Users, Target, Trophy, Clock, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const missionTypeLabels = {
  revenue: '💰 Receita',
  deals: '🎯 Deals',
  activities: '📞 Atividades',
  clients: '👥 Clientes',
};

export const CollaborativeMissionsCard: FC = () => {
  const { data, isLoading, error } = useCollaborativeMissions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Missões Colaborativas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Missões Colaborativas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Erro ao carregar missões</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Missões Colaborativas
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {data.activeMissions.length} ativas
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            {data.completedMissions.length} completas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Progress */}
        <div className="p-3 rounded-lg bg-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do Time</span>
            <span className="text-sm font-bold">{data.teamProgress.toFixed(0)}%</span>
          </div>
          <Progress value={data.teamProgress} className="h-2" />
        </div>

        {/* Active Missions */}
        {data.activeMissions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma missão ativa no momento
          </p>
        ) : (
          <div className="space-y-3">
            {data.activeMissions.slice(0, 3).map((mission) => {
              const progress = (mission.currentValue / mission.targetValue) * 100;
              const deadline = new Date(mission.deadline);
              const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <div key={mission.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{mission.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {missionTypeLabels[mission.missionType]}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Zap className="h-3 w-3" />
                      {mission.xpReward} XP
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>{mission.currentValue} / {mission.targetValue}</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {daysLeft}d restantes
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  {/* Top Contributors */}
                  {mission.participants.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {mission.participants.slice(0, 4).map((p, i) => (
                        <Avatar key={p.id} className="h-6 w-6 border-2 border-background" style={{ marginLeft: i > 0 ? -8 : 0 }}>
                          <AvatarFallback className="text-[10px]">
                            {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {mission.participants.length > 4 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{mission.participants.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
