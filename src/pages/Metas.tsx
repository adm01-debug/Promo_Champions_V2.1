import { Helmet } from "react-helmet-async";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { TeamGoalProgress } from "@/components/goals/TeamGoalProgress";
import { GoalsLeaderboard } from "@/components/goals/GoalsLeaderboard";
import { CommissionCalculator } from "@/components/goals/CommissionCalculator";
import { GoalComparisonChart } from "@/components/goals/GoalComparisonChart";
import { GoalDistributionChart } from "@/components/goals/GoalDistributionChart";
import { Card, CardContent } from "@/components/ui/card";

import { Target, TrendingUp, Users, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MetasLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { motion } from "framer-motion";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";

export default function Metas() {
  const { data, isLoading, dataUpdatedAt } = useGoalsDashboard();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] });
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
  const lastUpdate = dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss") : "--:--:--";

  const onTrackCount = data?.salespeople.filter(sp => sp.onTrack && sp.goalAmount > 0).length || 0;
  const totalWithGoals = data?.salespeople.filter(sp => sp.goalAmount > 0).length || 0;
  const exceededCount = data?.salespeople.filter(sp => sp.progress >= 100).length || 0;

  return (
    <>
    <Helmet>
      <title>Metas | Promo Champions</title>
      <meta name="description" content="Acompanhamento de metas de vendas" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<MetasLoadingSkeleton />}
      duration={400}
    >
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-page-title gradient-text">Dashboard de Metas</h1>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {currentMonth} • Atualizado às {lastUpdate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                  </Button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">Tempo Real</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats - Enhanced Pro Metrics */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card className="glass border-border/40 hover-lift-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                  <CardContent className="p-6 flex items-center gap-5 relative z-10">
                    <div className="p-4 rounded-2xl bg-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-black tracking-tighter gradient-text">{formatCurrency(data?.totalGoal || 0)}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Budget da Operação</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="glass border-border/40 hover-lift-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-success/10" />
                  <CardContent className="p-6 flex items-center gap-5 relative z-10">
                    <div className="p-4 rounded-2xl bg-success/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-black tracking-tighter text-success">{formatCurrency(data?.totalSales || 0)}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Volume Faturado</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass border-border/40 hover-lift-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-info/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-info/10" />
                  <CardContent className="p-6 flex items-center gap-5 relative z-10">
                    <div className="p-4 rounded-2xl bg-info/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Users className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-black tracking-tighter text-info">{onTrackCount}/{totalWithGoals}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Taxa de Atingimento</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="glass border-border/40 hover-lift-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-warning/10" />
                  <CardContent className="p-6 flex items-center gap-5 relative z-10">
                    <div className="p-4 rounded-2xl bg-warning/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Zap className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-black tracking-tighter text-warning">{exceededCount}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Over-Achievement</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Team Progress */}
              <TeamGoalProgress
                totalGoal={data?.totalGoal || 0}
                totalSales={data?.totalSales || 0}
                progress={data?.progress || 0}
                projection={data?.projection || 0}
                onTrack={data?.onTrack || false}
                daysElapsed={data?.daysElapsed || 0}
                daysRemaining={data?.daysRemaining || 0}
                dailyAverage={data?.dailyAverage || 0}
                requiredDailyAverage={data?.requiredDailyAverage || 0}
              />

              {/* Commission Calculator */}
              <CommissionCalculator
                salespeople={data?.salespeople || []}
                totalCurrentCommission={data?.totalCurrentCommission || 0}
                totalProjectedCommission={data?.totalProjectedCommission || 0}
                isLoading={isLoading}
              />

              {/* Leaderboard */}
              <GoalsLeaderboard
                salespeople={data?.salespeople || []}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Charts Row */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="lg:col-span-2">
                <GoalComparisonChart salespeople={data?.salespeople || []} />
              </div>
              <GoalDistributionChart salespeople={data?.salespeople || []} />
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </SkeletonTransition>
  </>
  );
}
