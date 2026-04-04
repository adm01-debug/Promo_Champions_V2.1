import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Target, DollarSign, TrendingUp, Medal, Crown, Award, Users, Flame, Zap, Star, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalespeopleRanking, PeriodFilter } from "@/hooks/useSalespeople";
import { useGamificationData } from "@/hooks/useGamificationData";
import { SalespersonForm, SalespersonRole } from "@/components/vendedores/SalespersonForm";
import { GoalEditDialog } from "@/components/vendedores/GoalEditDialog";
import { SalesChart } from "@/components/vendedores/SalesChart";
import { PeriodFilterButtons } from "@/components/vendedores/PeriodFilter";
import { GamificationCard } from "@/components/gamification/GamificationCard";
import { CelebrationTestButtons } from "@/components/gamification/CelebrationTestButtons";
import { RankingPodium } from "@/components/vendedores/RankingPodium";
import { LeagueCard } from "@/components/gamification/LeagueCard";
import { RankingGridItem } from "@/components/vendedores/RankingGridItem";
import { VendedoresLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { Skeleton } from "@/components/ui/skeleton";

const _roleLabels: Record<SalespersonRole, { label: string; color: string }> = {
  sdr: { label: "SDR", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  closer: { label: "Closer", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  hybrid: { label: "Híbrido", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
};

  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
    case 2:
      return <Medal className="h-6 w-6 text-slate-300 drop-shadow-[0_0_6px_rgba(148,163,184,0.5)]" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />;
    default:
      return <span className="text-lg font-black text-muted-foreground/60">#{rank}</span>;
  }
};
const getRankStyles = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        card: "bg-gradient-to-r from-yellow-500/15 via-yellow-400/10 to-amber-500/15 border-2 border-yellow-500/40 shadow-[0_0_30px_rgba(250,204,21,0.15)]",
        avatar: "ring-4 ring-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.4)]",
        badge: "bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold",
      };
    case 2:
      return {
        card: "bg-gradient-to-r from-slate-400/10 via-slate-300/5 to-slate-400/10 border-2 border-slate-400/30",
        avatar: "ring-4 ring-slate-300/50",
        badge: "bg-gradient-to-r from-slate-400 to-slate-500 text-white font-bold",
      };
    case 3:
      return {
        card: "bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10 border-2 border-amber-500/30",
        avatar: "ring-4 ring-amber-500/50",
        badge: "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold",
      };
    default:
      return {
        card: "hover:bg-muted/30 border border-transparent hover:border-border/50",
        avatar: "ring-2 ring-border/50",
        badge: "bg-muted text-muted-foreground",
      };
  }
};

const getGoalBadge = (goalProgress: number) => {
  if (goalProgress >= 120) return { icon: Flame, label: "Em Chamas!", color: "text-orange-500", bg: "bg-orange-500/20" };
  if (goalProgress >= 100) return { icon: Star, label: "Meta Batida!", color: "text-success", bg: "bg-success/20" };
  if (goalProgress >= 80) return { icon: Zap, label: "Quase Lá!", color: "text-yellow-500", bg: "bg-yellow-500/20" };
  return null;
};

const periodLabels: Record<PeriodFilter, string> = {
  week: "Semana",
  month: "Mês",
  quarter: "Trimestre",
};

const Vendedores = () => {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [viewMode, setViewMode] = useState<"classic" | "gamified">("gamified");
  const { data: salespeople, isLoading, error } = useSalespeopleRanking(period);
  const { data: gamificationData } = useGamificationData();
  const [editingSalesperson, setEditingSalesperson] = useState<{
    id: string;
    name: string;
    commission_rate: number;
    goalAmount: number;
  } | null>(null);

  const totalCommissions = salespeople?.reduce((sum, sp) => sum + sp.commission, 0) || 0;
  const totalSales = salespeople?.reduce((sum, sp) => sum + sp.totalSales, 0) || 0;
  const avgGoalProgress = salespeople && salespeople.length > 0 
    ? salespeople.reduce((sum, sp) => sum + sp.goalProgress, 0) / salespeople.length 
    : 0;


  // Get gamification data for a salesperson
  const getGamificationForSalesperson = (salespersonId: string) => {
    return gamificationData?.find(g => g.salesperson_id === salespersonId);
  };

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<VendedoresLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Ranking de Vendedores</h1>
              <p className="text-sm text-muted-foreground">Competição acirrada - {periodLabels[period]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PeriodFilterButtons value={period} onChange={setPeriod} />
            <SalespersonForm />
          </div>
        </div>

        {/* Podium - replaces old leader spotlight */}
        {salespeople && salespeople.length >= 3 && (
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <RankingPodium top3={salespeople.slice(0, 3)} />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-5" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Vendido</span>
            </div>
            <p className="text-2xl font-bold">R$ {totalSales.toLocaleString("pt-BR")}</p>
          </div>

          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-5" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Target className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Média de Metas</span>
            </div>
            <p className="text-2xl font-bold">{avgGoalProgress.toFixed(1)}%</p>
          </div>

          <div className="opacity-0 animate-fade-in-up glass rounded-xl p-5" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/20">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Comissões Totais</span>
            </div>
            <p className="text-2xl font-bold">R$ {totalCommissions.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Sales Chart */}
        {salespeople && salespeople.length > 0 && (
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <SalesChart salespeople={salespeople} />
          </div>
        )}

        {/* League System */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "280ms" }}>
          <LeagueCard />
        </div>




        {/* Ranking List */}
        <div className="opacity-0 animate-fade-in-up glass rounded-xl" style={{ animationDelay: "300ms" }}>
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Ranking Completo</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Quem será o próximo a subir? 🔥</p>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "classic" | "gamified")}>
                <TabsList className="h-8">
                  <TabsTrigger value="gamified" className="text-xs px-3 h-7">
                    <Zap className="h-3 w-3 mr-1" />
                    Gamificado
                  </TabsTrigger>
                  <TabsTrigger value="classic" className="text-xs px-3 h-7">
                    <LayoutGrid className="h-3 w-3 mr-1" />
                    Clássico
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-5 text-center text-muted-foreground">
              Erro ao carregar vendedores
            </div>
          ) : viewMode === "gamified" ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {salespeople?.map((sp) => {
                const gamification = getGamificationForSalesperson(sp.id);
                return (
                  <Link key={sp.id} to={`/vendedor/${sp.id}`}>
                    <GamificationCard
                      name={sp.name}
                      avatarUrl={sp.avatar_url || undefined}
                      level={gamification?.level || 1}
                      totalXP={gamification?.totalXP || 0}
                      xpProgress={gamification?.xpInLevel || 0}
                      xpToNext={gamification?.xpToNext || 100}
                      levelTitle={gamification?.levelTitle || "Iniciante"}
                      levelEmoji={gamification?.levelEmoji || "🌱"}
                      levelColor={gamification?.levelColor || "from-gray-400 to-gray-500"}
                      rank={sp.rank}
                      streak={gamification?.currentStreak || 0}
                      streakRecord={gamification?.bestStreak || 0}
                      achievements={gamification?.totalAchievements || 0}
                      showDetails={true}
                      size="md"
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Classic Grid View - inspired by Ranking de Vendas */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {salespeople?.map((sp, index) => (
                <RankingGridItem
                  key={sp.id}
                  id={sp.id}
                  name={sp.name}
                  avatar_url={sp.avatar_url}
                  rank={sp.rank}
                  totalSales={sp.totalSales}
                  goalAmount={sp.goalAmount}
                  goalProgress={sp.goalProgress}
                  completedSales={sp.completedSales}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Celebration Test Buttons */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          <CelebrationTestButtons />
        </div>

        <GoalEditDialog
          open={!!editingSalesperson}
          onOpenChange={(open) => !open && setEditingSalesperson(null)}
          salesperson={editingSalesperson}
        />
      </div>
    </div>
    </SkeletonTransition>
  );
};

export default Vendedores;
