import { Trophy, Flame, Target, Users, Calendar, Crown, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamAchievementStats } from "@/hooks/useTeamAchievementStats";

export function TeamAchievementStats() {
  const { data: stats, isLoading } = useTeamAchievementStats();

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Estatísticas da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Metas Batidas",
      value: stats.totalGoalsAchieved,
      sublabel: "Total histórico",
      icon: <Trophy className="h-5 w-5" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
    {
      label: "Esta Semana",
      value: stats.goalsThisWeek,
      sublabel: "Metas batidas",
      icon: <Calendar className="h-5 w-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Este Mês",
      value: stats.goalsThisMonth,
      sublabel: "Metas batidas",
      icon: <Target className="h-5 w-5" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      label: "Marcos de Sequência",
      value: stats.totalStreakMilestones,
      sublabel: "Conquistas especiais",
      icon: <Flame className="h-5 w-5" />,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      label: "Sequências Ativas",
      value: stats.currentActiveStreaks,
      sublabel: "Vendedores em sequência",
      icon: <Zap className="h-5 w-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
    {
      label: "Média por Vendedor",
      value: stats.avgGoalsPerSalesperson,
      sublabel: "Metas batidas",
      icon: <Users className="h-5 w-5" />,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    },
    {
      label: "Vendedores Ativos",
      value: stats.uniqueSalespeopleWithGoals,
      sublabel: "Com metas batidas",
      icon: <Users className="h-5 w-5" />,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
    },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Estatísticas de Conquistas da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Record Holder Highlight */}
        {stats.teamBestStreak > 0 && stats.teamBestStreakHolder && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-amber-500/30">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-amber-400 shadow-lg shadow-amber-500/30">
                  <AvatarImage src={stats.teamBestStreakHolder.avatar_url || ""} />
                  <AvatarFallback className="bg-amber-500/30 text-amber-300 text-lg font-bold">
                    {stats.teamBestStreakHolder.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1">
                  <Crown className="h-3 w-3 text-amber-900" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-300/80 uppercase tracking-wider font-medium">
                  Recorde da Equipe
                </p>
                <p className="text-lg font-bold text-amber-100">
                  {stats.teamBestStreakHolder.name}
                </p>
                <p className="text-sm text-amber-200/70">
                  Maior sequência: <span className="font-bold text-amber-300">{stats.teamBestStreak} dias</span>
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-400">
                  <Flame className="h-6 w-6" />
                  <span className="text-3xl font-bold">{stats.teamBestStreak}</span>
                </div>
                <p className="text-xs text-amber-300/60">dias seguidos</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${stat.bgColor} border ${stat.borderColor} transition-all hover:scale-[1.02]`}
            >
              <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
                {stat.icon}
                <span className="text-xs font-medium truncate">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
