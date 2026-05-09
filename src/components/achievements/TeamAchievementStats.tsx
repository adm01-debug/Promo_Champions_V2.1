import { Trophy, Flame, Target, Users, Calendar, Crown, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamAchievementStats } from "@/hooks/useTeamAchievementStats";
import { AchievementTrendChart } from "./AchievementTrendChart";
import { AchievementComparisonChart } from "./AchievementComparisonChart";

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
      color: "text-rank-gold",
      bgColor: "bg-rank-gold/10",
      borderColor: "border-rank-gold/30",
    },
    {
      label: "Esta Semana",
      value: stats.goalsThisWeek,
      sublabel: "Metas batidas",
      icon: <Calendar className="h-5 w-5" />,
      color: "text-status-info",
      bgColor: "bg-status-info/10",
      borderColor: "border-status-info/30",
    },
    {
      label: "Este Mês",
      value: stats.goalsThisMonth,
      sublabel: "Metas batidas",
      icon: <Target className="h-5 w-5" />,
      color: "text-status-success",
      bgColor: "bg-status-success/10",
      borderColor: "border-status-success/30",
    },
    {
      label: "Marcos de Sequência",
      value: stats.totalStreakMilestones,
      sublabel: "Conquistas especiais",
      icon: <Flame className="h-5 w-5" />,
      color: "text-streak",
      bgColor: "bg-streak/10",
      borderColor: "border-streak/30",
    },
    {
      label: "Sequências Ativas",
      value: stats.currentActiveStreaks,
      sublabel: "Vendedores em sequência",
      icon: <Zap className="h-5 w-5" />,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
    },
    {
      label: "Média por Vendedor",
      value: stats.avgGoalsPerSalesperson,
      sublabel: "Metas batidas",
      icon: <Users className="h-5 w-5" />,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/30",
    },
    {
      label: "Vendedores Ativos",
      value: stats.uniqueSalespeopleWithGoals,
      sublabel: "Com metas batidas",
      icon: <Users className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
  ];

  return (
    <div className="space-y-6">
      <Card variant="glass" className="bg-background/20 backdrop-blur-xl border-white/10 shadow-2xl transition-all duration-500 hover:bg-background/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Estatísticas de Conquistas da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Record Holder Highlight */}
          {stats.teamBestStreak > 0 && stats.teamBestStreakHolder && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-rank-gold/30 via-rank-gold/10 to-primary/20 border border-rank-gold/30 shadow-glow-gold/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rank-gold/10 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-rank-gold shadow-2xl shadow-rank-gold/30 transition-transform duration-500 group-hover:scale-110">
                    <AvatarImage src={stats.teamBestStreakHolder.avatar_url || ""} />
                    <AvatarFallback className="bg-rank-gold/30 text-rank-gold text-2xl font-black">
                      {stats.teamBestStreakHolder.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 bg-rank-gold rounded-full p-2 shadow-lg animate-bounce">
                    <Crown className="h-4 w-4 text-background" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-rank-gold font-black uppercase tracking-[0.2em] mb-1">
                    Hall da Fama: Recorde Histórico
                  </p>
                  <p className="text-3xl font-display font-black text-foreground tracking-tighter italic">
                    {stats.teamBestStreakHolder.name}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    Domínio absoluto por <span className="font-black text-rank-gold italic">{stats.teamBestStreak} dias seguidos</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-rank-gold justify-end">
                    <Flame className="h-8 w-8 animate-fire-pulse" />
                    <span className="text-5xl font-display font-black tracking-tighter drop-shadow-glow">
                      {stats.teamBestStreak}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">STREAK ATUAL</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl ${stat.bgColor} border ${stat.borderColor} transition-all duration-500 hover:scale-[1.05] hover:shadow-lg glass-morphism group cursor-help`}
              >
                <div className={`flex items-center gap-2 mb-3 ${stat.color} transition-transform group-hover:translate-x-1`}>
                  {stat.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{stat.label}</span>
                </div>
                <p className={`text-3xl font-display font-black tracking-tighter ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-[9px] text-muted-foreground/70 font-black uppercase tracking-tighter mt-1 italic">
                  {stat.sublabel}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AchievementTrendChart />
        <AchievementComparisonChart />
      </div>
    </div>
  );
}