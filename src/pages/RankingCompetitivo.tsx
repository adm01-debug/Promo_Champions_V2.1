import { Helmet } from "react-helmet-async";
import { Trophy, TrendingUp, Star, Target, Calendar, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAllSalespeopleXP, getLevelInfo, calculateLevelFromXP } from "@/hooks/gamification/useSalespersonXP";
import { XPProgressBar } from "@/components/gamification/XPProgressBar";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { RankingLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { RankingTab } from "@/components/ranking/RankingTab";
import { HistoryTab } from "@/components/ranking/HistoryTab";
import { AchievementsTab } from "@/components/ranking/AchievementsTab";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

const RankingCompetitivo = () => {
  const { data: ranking, isLoading } = useCompetitiveRanking();
  const { data: xpData } = useAllSalespeopleXP();

  const { data: monthlyHistory } = useQuery({
    queryKey: ["ranking-monthly-history"],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const { data: sales } = await supabase
          .from("sales").select("salesperson_id, amount")
          .eq("status", "completed")
          .gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
        const totalSales = (sales || []).reduce((sum, s) => sum + Number(s.amount), 0);
        months.push({
          month: format(date, "MMM", { locale: ptBR }),
          fullMonth: format(date, "MMMM yyyy", { locale: ptBR }),
          totalSales,
          dealsCount: (sales || []).length,
        });
      }
      return months;
    },
  });

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
        .select(`*, salespeople:salesperson_id (name, avatar_url)`)
        .order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data as AchievementWithSalesperson[];
    },
  });

  const totalTeamSales = ranking?.reduce((sum, r) => sum + r.totalSales, 0) || 0;
  const totalDeals = ranking?.reduce((sum, r) => sum + r.dealsCount, 0) || 0;
  const leader = ranking?.[0];

  return (
    <>
    <Helmet>
      <title>Circuito de Vencedores | Promo Champions</title>
      <meta name="description" content="Rankings e competições entre vendedores" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<RankingLoadingSkeleton />} duration={400}>
      <PageTransition>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-page-title flex items-center gap-3">
              <Trophy className="h-8 w-8 text-rank-gold" />
              Circuito <span className="gradient-text">de Vencedores</span>
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe a competição entre vendedores em tempo real</p>
          </div>
          <Badge variant="outline" className="self-start md:self-auto text-sm px-4 py-2">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(), "MMMM yyyy", { locale: ptBR })}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Líder do Mês", value: leader?.name || "-", sub: `${leader?.emoji} ${leader?.title}`, subColor: "text-rank-gold", icon: Trophy, iconColor: "text-rank-gold", bg: "from-rank-gold/20 to-rank-gold/20" },
            { label: "Total Equipe", value: formatCurrency(totalTeamSales), sub: `${totalDeals} vendas`, icon: TrendingUp, iconColor: "text-primary", bg: "from-primary/20 to-secondary/20" },
            { label: "Participantes", value: String(ranking?.length || 0), sub: "vendedores ativos", icon: Star, iconColor: "text-accent", bg: "from-accent/20 to-accent/20" },
            { label: "Ticket Médio", value: formatCurrency(totalDeals > 0 ? totalTeamSales / totalDeals : 0), sub: "por venda", icon: Target, iconColor: "text-status-success", bg: "from-status-success/20 to-status-success/20" },
          ].map((stat) => (
            <Card key={stat.label} className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-metric">{stat.value}</p>
                    <p className={`text-sm ${stat.subColor || "text-muted-foreground"}`}>{stat.sub}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="ranking" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="ranking">Ranking Atual</TabsTrigger>
            <TabsTrigger value="xp">Níveis & XP</TabsTrigger>
            <TabsTrigger value="history">Histórico Mensal</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking">
            <RankingTab ranking={(ranking || []) as never[]} leader={leader as never} formatCurrency={formatCurrency} />
          </TabsContent>

          <TabsContent value="xp" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total XP do Time", value: (xpData || []).reduce((s, x) => s + (x.total_xp || 0), 0).toLocaleString(), sub: "pontos de experiência", icon: Sparkles, color: "text-accent", bg: "from-accent/20 to-accent/20" },
                { label: "Nível Médio", value: String(xpData?.length ? Math.round(xpData.reduce((s, x) => s + (x.current_level || 1), 0) / xpData.length) : 1), sub: "do time", icon: Star, color: "text-rank-gold", bg: "from-rank-gold/20 to-primary/20" },
                { label: "Maior Nível", value: String(xpData?.length ? Math.max(...xpData.map(x => x.current_level || 1)) : 1), sub: xpData?.length ? getLevelInfo(Math.max(...xpData.map(x => x.current_level || 1))).title : "Iniciante", icon: Trophy, color: "text-rank-gold", bg: "from-rank-gold/20 to-rank-gold/20" },
              ].map((stat) => (
                <Card key={stat.label} className="glass border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-metric">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.sub}</p>
                      </div>
                      <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(xpData || []).map((xpRecord, index) => {
              const salesperson = xpRecord.salespeople as { id: string; name: string; avatar_url: string | null; role: string } | null;
              const levelInfo = getLevelInfo(xpRecord.current_level || 1);
              const { xpInLevel, xpToNext } = calculateLevelFromXP(xpRecord.total_xp || 0);
              return (
                <Card key={xpRecord.id} className="glass border-border/50 overflow-hidden transition-all hover:scale-[1.005]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-border/50">
                        <AvatarImage src={salesperson?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                          {(salesperson?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
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

          <TabsContent value="history">
            <HistoryTab monthlyHistory={monthlyHistory || []} formatCurrency={formatCurrency} />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsTab achievements={achievements || []} />
          </TabsContent>
        </Tabs>
      </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
};

export default RankingCompetitivo;
