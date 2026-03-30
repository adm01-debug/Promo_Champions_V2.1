import { Trophy, Medal, TrendingUp, Star, Flame, Target, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useAllSalespeopleXP, getLevelInfo, calculateLevelFromXP } from "@/hooks/useSalespersonXP";
import { XPProgressBar } from "@/components/gamification/XPProgressBar";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { RankingLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";

const RankingCompetitivo = () => {
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const { data: xpData } = useAllSalespeopleXP();

  // Fetch monthly history
  const { data: monthlyHistory } = useQuery({
    queryKey: ["ranking-monthly-history"],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const { data: sales } = await supabase
          .from("sales")
          .select("salesperson_id, amount")
          .eq("status", "completed")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());

        const totalSales = (sales || []).reduce((sum, s) => sum + Number(s.amount), 0);
        const dealsCount = (sales || []).length;

        months.push({
          month: format(date, "MMM", { locale: ptBR }),
          fullMonth: format(date, "MMMM yyyy", { locale: ptBR }),
          totalSales,
          dealsCount,
        });
      }
      return months;
    },
  });

  // Fetch achievements
  interface AchievementWithSalesperson {
    id: string;
    salesperson_id: string;
    achievement_type: string;
    achievement_date: string;
    details: { name?: string; streak?: number } | null;
    created_at: string;
    salespeople: { name: string; avatar_url: string | null } | null;
  }
  
  const { data: achievements } = useQuery<AchievementWithSalesperson[]>({
    queryKey: ["all-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select(`
          *,
          salespeople:salesperson_id (name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as AchievementWithSalesperson[];
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-rank-gold" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-rank-silver" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-rank-bronze" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankGradient = (rank: number) => {
    if (rank === 1) return "from-rank-gold/20 via-rank-gold/10 to-transparent border-rank-gold/30";
    if (rank === 2) return "from-rank-silver/20 via-rank-silver/10 to-transparent border-rank-silver/30";
    if (rank === 3) return "from-rank-bronze/20 via-rank-bronze/10 to-transparent border-rank-bronze/30";
    return "from-muted/20 to-transparent border-border/50";
  };

  const totalTeamSales = ranking?.reduce((sum, r) => sum + r.totalSales, 0) || 0;
  const totalDeals = ranking?.reduce((sum, r) => sum + r.dealsCount, 0) || 0;
  const leader = ranking?.[0];

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<RankingLoadingSkeleton />}
      duration={400}
    >
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-rank-gold" />
            Ranking <span className="gradient-text">Competitivo</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe a competição entre vendedores em tempo real
          </p>
        </div>
        <Badge variant="outline" className="self-start md:self-auto text-sm px-4 py-2">
          <Calendar className="h-4 w-4 mr-2" />
          {format(new Date(), "MMMM yyyy", { locale: ptBR })}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Líder do Mês</p>
                <p className="text-2xl font-bold">{leader?.name || "-"}</p>
                <p className="text-sm text-rank-gold">{leader?.emoji} {leader?.title}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rank-gold/20 to-rank-gold/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-rank-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Equipe</p>
                <p className="text-2xl font-bold">{formatCurrency(totalTeamSales)}</p>
                <p className="text-sm text-muted-foreground">{totalDeals} vendas</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold">{ranking?.length || 0}</p>
                <p className="text-sm text-muted-foreground">vendedores ativos</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalDeals > 0 ? totalTeamSales / totalDeals : 0)}
                </p>
                <p className="text-sm text-muted-foreground">por venda</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-status-success/20 to-status-success/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ranking" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="ranking">Ranking Atual</TabsTrigger>
          <TabsTrigger value="xp">Níveis & XP</TabsTrigger>
          <TabsTrigger value="history">Histórico Mensal</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="space-y-4">
          {ranking?.map((person, index) => (
            <Card
              key={person.id}
              className={`glass border overflow-hidden transition-all hover:scale-[1.01] bg-gradient-to-r ${getRankGradient(person.rank)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                    {getRankIcon(person.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-14 w-14 border-2 border-border/50">
                    <AvatarImage src={person.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                      {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg truncate">{person.name}</h3>
                      {person.title && (
                        <Badge className={`bg-gradient-to-r ${person.color} text-white border-0`}>
                          {person.emoji} {person.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {person.dealsCount} vendas
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {person.leadsCount} leads
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {person.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Sales Amount */}
                  <div className="text-right">
                    <p className="text-2xl font-bold gradient-text">
                      {formatCurrency(person.totalSales)}
                    </p>
                    {person.gapToFirst > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(person.gapToFirst)} para o 1º
                      </p>
                    )}
                    {person.gapToNext > 0 && person.rank > 1 && (
                      <p className="text-xs text-primary">
                        {formatCurrency(person.gapToNext)} para subir
                      </p>
                    )}
                  </div>

                  {/* Progress to leader */}
                  {person.rank > 1 && leader && (
                    <div className="w-24 hidden lg:block">
                      <Progress
                        value={(person.totalSales / leader.totalSales) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        {Math.round((person.totalSales / leader.totalSales) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* XP & Levels Tab */}
        <TabsContent value="xp" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total XP do Time</p>
                    <p className="text-2xl font-bold">
                      {(xpData || []).reduce((sum, xp) => sum + (xp.total_xp || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">pontos de experiência</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nível Médio</p>
                    <p className="text-2xl font-bold">
                      {xpData && xpData.length > 0
                        ? Math.round(xpData.reduce((sum, xp) => sum + (xp.current_level || 1), 0) / xpData.length)
                        : 1}
                    </p>
                    <p className="text-sm text-muted-foreground">do time</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rank-gold/20 to-primary/20 flex items-center justify-center">
                    <Star className="h-6 w-6 text-rank-gold" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maior Nível</p>
                    <p className="text-2xl font-bold">
                      {xpData && xpData.length > 0
                        ? Math.max(...xpData.map(xp => xp.current_level || 1))
                        : 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {xpData && xpData.length > 0 
                        ? getLevelInfo(Math.max(...xpData.map(xp => xp.current_level || 1))).title
                        : "Iniciante"}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rank-gold/20 to-rank-gold/20 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-rank-gold" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(xpData || []).map((xpRecord, index) => {
            const salesperson = xpRecord.salespeople as { id: string; name: string; avatar_url: string | null; role: string } | null;
            const levelInfo = getLevelInfo(xpRecord.current_level || 1);
            const { _progress, xpInLevel, xpToNext } = calculateLevelFromXP(xpRecord.total_xp || 0);

            return (
              <Card
                key={xpRecord.id}
                className="glass border-border/50 overflow-hidden transition-all hover:scale-[1.005]"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-border/50">
                      <AvatarImage src={salesperson?.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {(salesperson?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">{salesperson?.name || "Vendedor"}</h3>
                        <LevelBadge totalXP={xpRecord.total_xp || 0} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{levelInfo.emoji} {levelInfo.title}</span>
                        <span>•</span>
                        <span>{(xpRecord.total_xp || 0).toLocaleString()} XP</span>
                      </div>
                      <XPProgressBar totalXP={xpRecord.total_xp || 0} showDetails={false} size="sm" />
                    </div>

                    {/* XP Details */}
                    <div className="text-right hidden md:block">
                      <p className="text-lg font-bold gradient-text">Nv. {xpRecord.current_level || 1}</p>
                      {(xpRecord.current_level || 1) < 20 && (
                        <p className="text-xs text-muted-foreground">
                          {(xpToNext - xpInLevel).toLocaleString()} XP para Nv.{(xpRecord.current_level || 1) + 1}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!xpData || xpData.length === 0) && (
            <Card className="glass border-border/50">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum vendedor com XP registrado ainda</p>
                <p className="text-sm text-muted-foreground mt-1">XP é ganho através de vendas e conquistas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Evolução de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Total"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quantidade de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="dealsCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                        {(monthlyHistory || []).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(var(--primary) / ${0.5 + (index / 10)})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Summary Table */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Mês</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">Total Vendas</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">Qtd Vendas</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(monthlyHistory || []).map((month, index) => (
                      <tr key={index} className="border-b border-border/30 hover:bg-muted/30">
                        <td className="py-3 px-4 capitalize">{month.fullMonth}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(month.totalSales)}</td>
                        <td className="py-3 px-4 text-right">{month.dealsCount}</td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(month.dealsCount > 0 ? month.totalSales / month.dealsCount : 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(achievements || []).map((achievement) => {
              const details = achievement.details as { name?: string; streak?: number } | null;
              const isStreak = achievement.achievement_type.includes("streak");

              return (
                <Card key={achievement.id} className="glass border-border/50 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isStreak
                            ? "bg-gradient-to-br from-streak/20 to-primary/20"
                            : "bg-gradient-to-br from-status-success/20 to-status-success/20"
                        }`}
                      >
                        {isStreak ? (
                          <Flame className="h-6 w-6 text-streak" />
                        ) : (
                          <Trophy className="h-6 w-6 text-status-success" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={achievement.salespeople?.avatar_url || ""} />
                            <AvatarFallback className="text-xs">
                              {(achievement.salespeople?.name || "?")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate">
                            {achievement.salespeople?.name || "Vendedor"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isStreak
                            ? `🔥 ${details?.streak || 0} dias consecutivos`
                            : "🎯 Meta do dia batida!"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(achievement.achievement_date), "dd MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {(!achievements || achievements.length === 0) && (
              <Card className="glass border-border/50 col-span-full">
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma conquista registrada ainda</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </SkeletonTransition>
  );
};

export default RankingCompetitivo;
