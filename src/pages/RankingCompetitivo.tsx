import { Helmet } from "react-helmet-async";
import { Trophy, TrendingUp, Star, Target, Calendar, Sparkles, Flame, Crown, Zap } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompetitiveRanking } from "@/hooks/useCompetitiveRanking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAllSalespeopleXP, getLevelInfo, calculateLevelFromXP } from "@/hooks/useSalespersonXP";
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
    <Helmet>
      <title>Elite Ranking | Promo Champions</title>
      <meta name="description" content="Rankings de ultra-performance e Hall da Fama" />
    </Helmet>
    <SkeletonTransition isLoading={isLoading} skeleton={<RankingLoadingSkeleton />} duration={400}>
      <PageTransition>
      <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
        {/* Header - Elite Style */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rank-gold/10 rounded-lg">
                <Trophy className="h-8 w-8 text-rank-gold animate-pulse" />
              </div>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                HALL DA <span className="bg-gradient-to-r from-rank-gold via-yellow-500 to-amber-600 bg-clip-text text-transparent">FAMA</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg font-medium flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Arena de Ultra-Performance em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-rank-gold/30 text-rank-gold px-4 py-2 text-sm font-bold shadow-lg shadow-rank-gold/10">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(), "MMMM yyyy", { locale: ptBR }).toUpperCase()}
            </Badge>
            <div className="h-10 w-[1px] bg-border/50 hidden lg:block mx-2" />
            <div className="flex -space-x-3">
              {(ranking?.slice(0, 3) || []).map((p, i) => (
                <Avatar key={p.id} className={`h-10 w-10 border-2 border-background ring-2 ${i === 0 ? 'ring-rank-gold' : i === 1 ? 'ring-rank-silver' : 'ring-rank-bronze'}`}>
                  <AvatarImage src={p.avatar_url || ""} />
                  <AvatarFallback>{p.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Overview - Premium Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {[
            { 
              label: "Líder Supremo", 
              value: leader?.name || "-", 
              sub: `${leader?.emoji} ${leader?.title}`, 
              subColor: "text-rank-gold font-bold", 
              icon: Crown, 
              iconColor: "text-rank-gold", 
              bg: "from-rank-gold/20 via-rank-gold/5 to-transparent",
              border: "border-rank-gold/30"
            },
            { 
              label: "Volume Total", 
              value: formatCurrency(totalTeamSales), 
              sub: `${totalDeals} contratos fechados`, 
              icon: Zap, 
              iconColor: "text-primary", 
              bg: "from-primary/20 via-primary/5 to-transparent",
              border: "border-primary/30"
            },
            { 
              label: "Elite Ativa", 
              value: String(ranking?.length || 0), 
              sub: "vendedores no ranking", 
              icon: Star, 
              iconColor: "text-accent", 
              bg: "from-accent/20 via-accent/5 to-transparent",
              border: "border-accent/30"
            },
            { 
              label: "Efficiency Score", 
              value: formatCurrency(totalDeals > 0 ? totalTeamSales / totalDeals : 0), 
              sub: "ticket médio global", 
              icon: Target, 
              iconColor: "text-status-success", 
              bg: "from-status-success/20 via-status-success/5 to-transparent",
              border: "border-status-success/30"
            },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className={`glass border-l-4 ${stat.border} overflow-hidden group hover:shadow-2xl transition-all duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />
                <CardContent className="pt-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{stat.label}</p>
                      <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
                      <p className={`text-sm ${stat.subColor || "text-muted-foreground/80"}`}>{stat.sub}</p>
                    </div>
                    <div className="p-3 bg-background/40 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Tabs defaultValue="ranking" className="space-y-8">
          <TabsList className="glass p-1 h-auto bg-background/20 backdrop-blur-xl border-border/40 inline-flex flex-wrap md:flex-nowrap">
            <TabsTrigger value="ranking" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-6 py-3 font-bold transition-all duration-300">
              <Trophy className="h-4 w-4 mr-2" />
              Ranking de Vendas
            </TabsTrigger>
            <TabsTrigger value="xp" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent px-6 py-3 font-bold transition-all duration-300">
              <Zap className="h-4 w-4 mr-2" />
              Progressão de Nível
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary px-6 py-3 font-bold transition-all duration-300">
              <Calendar className="h-4 w-4 mr-2" />
              Histórico Mensal
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-rank-gold/20 data-[state=active]:text-rank-gold px-6 py-3 font-bold transition-all duration-300">
              <Crown className="h-4 w-4 mr-2" />
              Conquistas
            </TabsTrigger>
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
