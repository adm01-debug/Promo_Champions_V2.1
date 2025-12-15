import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Target, DollarSign, TrendingUp, Medal, Crown, Award, Users, Edit2, Flame, Zap, Star, ExternalLink, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalespeopleRanking, PeriodFilter } from "@/hooks/useSalespeople";
import { useGamificationData } from "@/hooks/useGamificationData";
import { SalespersonForm, SalespersonRole } from "@/components/vendedores/SalespersonForm";
import { GoalEditDialog } from "@/components/vendedores/GoalEditDialog";
import { SalesChart } from "@/components/vendedores/SalesChart";
import { PeriodFilterButtons } from "@/components/vendedores/PeriodFilter";
import { GamificationCard } from "@/components/gamification/GamificationCard";
import { CelebrationTestButtons } from "@/components/gamification/CelebrationTestButtons";
import { cn } from "@/lib/utils";
import { VendedoresLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { Skeleton } from "@/components/ui/skeleton";

const roleLabels: Record<SalespersonRole, { label: string; color: string }> = {
  sdr: { label: "SDR", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  closer: { label: "Closer", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  hybrid: { label: "Híbrido", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
};

const getRankIcon = (rank: number) => {
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

const getStreakInfo = (goalProgress: number) => {
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

  const topSeller = salespeople?.[0];

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

        {/* Top Seller Spotlight */}
        {topSeller && (
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <div className="glass rounded-2xl p-6 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-md opacity-50 animate-pulse" />
                  <Avatar className="h-24 w-24 relative ring-4 ring-yellow-400/60 shadow-2xl">
                    <AvatarImage src={topSeller.avatar_url || undefined} alt={topSeller.name} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white text-2xl font-bold">
                      {topSeller.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg">
                    <Crown className="h-5 w-5 text-black" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">Líder do Ranking</span>
                    <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black">{topSeller.name}</h2>
                  <p className="text-muted-foreground">{topSeller.completedSales} vendas realizadas</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-black gradient-text">
                      R$ {topSeller.totalSales.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Faturamento</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-success">
                      {topSeller.goalProgress.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">da Meta</p>
                  </div>
                </div>
              </div>
            </div>
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
                    <Users className="h-3 w-3 mr-1" />
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
            /* Gamified View */
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
            /* Classic View */
            <div className="divide-y divide-border/20 p-3">
              {salespeople?.map((sp) => {
                const styles = getRankStyles(sp.rank);
                const streak = getStreakInfo(sp.goalProgress);
                
                return (
                  <div 
                    key={sp.id}
                    className={cn(
                      "p-4 rounded-xl my-2 transition-all duration-300",
                      styles.card
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        sp.rank <= 3 ? styles.badge : "bg-muted/50"
                      )}>
                        {getRankIcon(sp.rank)}
                      </div>
                      
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className={cn("h-14 w-14", styles.avatar)}>
                          <AvatarImage src={sp.avatar_url || undefined} alt={sp.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-secondary/30 text-foreground font-bold text-lg">
                            {sp.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {streak && (
                          <div className={cn("absolute -bottom-1 -right-1 p-1 rounded-full", streak.bg)}>
                            <streak.icon className={cn("h-3 w-3", streak.color)} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <Link to={`/vendedor/${sp.id}`} className="flex-1 min-w-0 group cursor-pointer">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{sp.name}</h3>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Badge variant="outline" className={cn("text-[10px]", roleLabels[sp.role || 'hybrid'].color)}>
                            {roleLabels[sp.role || 'hybrid'].label}
                          </Badge>
                          {streak && (
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", streak.bg, streak.color)}>
                              {streak.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sp.completedSales} vendas • {sp.commission_rate}% comissão
                        </p>
                      </Link>
                        
                      {/* Progress Bar */}
                      <div className="flex-1 hidden lg:block">
                        <div className="relative h-2.5 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                              sp.goalProgress >= 100 
                                ? "bg-gradient-to-r from-success to-emerald-400" 
                                : "gradient-primary"
                            )}
                            style={{ width: `${Math.min(sp.goalProgress, 100)}%` }}
                          />
                          {sp.goalProgress > 100 && (
                            <div 
                              className="absolute inset-y-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"
                              style={{ 
                                left: "100%", 
                                width: `${Math.min(sp.goalProgress - 100, 50)}%`,
                                marginLeft: "-2px"
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xl font-black">R$ {sp.totalSales.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-muted-foreground">
                            de R$ {sp.goalAmount.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        
                        <div className="text-center min-w-[60px]">
                          <p className={cn(
                            "text-xl font-black",
                            sp.goalProgress >= 100 ? "text-success" : sp.goalProgress >= 80 ? "text-yellow-500" : "text-muted-foreground"
                          )}>
                            {sp.goalProgress.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">meta</p>
                        </div>
                        
                        <div className="text-right min-w-[90px]">
                          <p className="text-lg font-bold text-success">
                            R$ {sp.commission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-muted-foreground">comissão</p>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-primary"
                        onClick={() => setEditingSalesperson({
                          id: sp.id,
                          name: sp.name,
                          commission_rate: sp.commission_rate,
                          goalAmount: sp.goalAmount,
                        })}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Mobile Stats */}
                    <div className="sm:hidden mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-sm font-bold">R$ {sp.totalSales.toLocaleString("pt-BR")}</p>
                        <p className="text-xs text-muted-foreground">vendas</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className={cn("text-sm font-bold", sp.goalProgress >= 100 ? "text-success" : "")}>
                          {sp.goalProgress.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">meta</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-sm font-bold text-success">
                          R$ {sp.commission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-muted-foreground">comissão</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
