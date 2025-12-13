import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trophy, PartyPopper, Medal, Calendar, Flame, Zap, Star, Crown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/hooks/useAchievements";

type AchievementConfig = { label: string; icon: React.ReactNode; color: string };

const getAchievementConfig = (type: string): AchievementConfig => {
  // Check for streak achievements
  if (type.startsWith("streak_")) {
    const streakNum = parseInt(type.replace("streak_", ""), 10);
    
    if (streakNum >= 30) {
      return {
        label: `${streakNum} Dias Seguidos!`,
        icon: <Crown className="h-4 w-4" />,
        color: "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-yellow-300 border-yellow-500/50 animate-pulse"
      };
    }
    if (streakNum >= 15) {
      return {
        label: `${streakNum} Dias Seguidos!`,
        icon: <Star className="h-4 w-4" />,
        color: "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-pink-300 border-pink-500/50"
      };
    }
    if (streakNum >= 7) {
      return {
        label: `${streakNum} Dias Seguidos!`,
        icon: <Flame className="h-4 w-4" />,
        color: "bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 border-orange-500/50"
      };
    }
    if (streakNum >= 5) {
      return {
        label: `${streakNum} Dias Seguidos!`,
        icon: <Zap className="h-4 w-4" />,
        color: "bg-blue-500/20 text-blue-300 border-blue-500/40"
      };
    }
    return {
      label: `${streakNum} Dias Seguidos!`,
      icon: <Target className="h-4 w-4" />,
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
    };
  }

  const configs: Record<string, AchievementConfig> = {
    daily_goal: { 
      label: "Meta Diária Batida", 
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    },
    weekly_goal: { 
      label: "Meta Semanal Batida", 
      icon: <Medal className="h-4 w-4" />,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    },
    monthly_goal: { 
      label: "Meta Mensal Batida", 
      icon: <PartyPopper className="h-4 w-4" />,
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    },
  };

  return configs[type] || configs.daily_goal;
};

const roleLabels: Record<string, string> = {
  sdr: "SDR",
  closer: "Closer",
  hybrid: "Híbrido",
};

export function AchievementsHistory() {
  const { data: achievements, isLoading } = useAchievements(100);

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Histórico de Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Histórico de Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma conquista registrada ainda.</p>
            <p className="text-sm">As conquistas aparecerão aqui quando vendedores baterem suas metas.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separate streak achievements for special display
  const streakAchievements = achievements.filter(a => a.achievement_type.startsWith("streak_"));
  const regularAchievements = achievements.filter(a => !a.achievement_type.startsWith("streak_"));

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Histórico de Conquistas
          <Badge variant="secondary" className="ml-2">
            {achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak Achievements Section */}
        {streakAchievements.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              Conquistas de Sequência
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {streakAchievements.map((achievement) => {
                const config = getAchievementConfig(achievement.achievement_type);
                const salesperson = achievement.salesperson;
                
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${config.color} transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8 border border-current/30">
                        <AvatarImage src={salesperson?.avatar_url || ""} />
                        <AvatarFallback className="bg-current/10 text-current text-xs">
                          {salesperson?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm truncate block">
                          {salesperson?.name || "Vendedor"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {config.icon}
                        <span className="font-bold text-sm">{config.label}</span>
                      </div>
                    </div>
                    <div className="text-[10px] opacity-70 mt-2">
                      {format(parseISO(achievement.achievement_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Achievements */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            Metas Diárias Batidas
          </h3>
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-3">
              {regularAchievements.map((achievement) => {
                const config = getAchievementConfig(achievement.achievement_type);
                const salesperson = achievement.salesperson;
                
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10 border-2 border-amber-500/30">
                      <AvatarImage src={salesperson?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {salesperson?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {salesperson?.name || "Vendedor"}
                        </span>
                        {salesperson?.role && (
                          <Badge variant="outline" className="text-xs">
                            {roleLabels[salesperson.role] || salesperson.role}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(achievement.achievement_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    
                    <Badge className={`${config.color} flex items-center gap-1`}>
                      {config.icon}
                      <span className="hidden sm:inline">{config.label}</span>
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
