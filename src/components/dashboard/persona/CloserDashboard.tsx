import { FC } from "react";
import { motion } from "framer-motion";
import { StatCard } from "../StatCard";
import { SalesChart } from "../SalesChart";
import { GoalProgress } from "../GoalProgress";
import { FunnelChart } from "../FunnelChart";
import { RecentDeals } from "../RecentDeals";
import { SalesForecast } from "../SalesForecast";
import { AlertsPanel } from "../AlertsPanel";
import { CompetitiveStatusBar } from "@/components/gamification/CompetitiveStatusBar";
import { CompetitiveLeaderboard } from "@/components/gamification/CompetitiveLeaderboard";
import { DailyChallengesCard } from "@/components/gamification/DailyChallengesCard";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { itemVariants, containerVariants } from "@/components/transitions/PageTransition";
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  Percent,
  ShoppingBag,
  Clock
} from "lucide-react";

interface CloserDashboardProps {
  className?: string;
  showSDRMetrics?: boolean;
}

export const CloserDashboard: FC<CloserDashboardProps> = ({ 
  className,
  showSDRMetrics = false 
}) => {
  const { salesperson } = useAuth();
  const { data: kpis } = useDashboardKPIs();
  const { data: goalsData } = useGoalsDashboard();

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  return (
    <div className={className}>
      {/* Closer Focus: Revenue & Win Rate */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Competitive Status */}
        <motion.div variants={itemVariants} className="hidden sm:block">
          <CompetitiveStatusBar />
        </motion.div>

        {/* Primary Metrics - Revenue Focused */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Faturamento"
              value={formatCurrency(kpis?.current.totalRevenue ?? 0)}
              change={kpis?.changes.revenue ?? 0}
              previousValue={kpis ? formatCurrency(kpis.previous.totalRevenue) : undefined}
              icon={DollarSign}
              variant="primary"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Win Rate"
              value={`${(kpis?.current.conversionRate ?? 0).toFixed(1)}%`}
              change={kpis?.changes.conversion ?? 0}
              icon={Percent}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Deals Fechados"
              value={String(kpis?.current.totalSales ?? 0)}
              change={kpis?.changes.sales ?? 0}
              icon={ShoppingBag}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Ticket Médio"
              value={formatCurrency(
                kpis?.current.totalSales 
                  ? kpis.current.totalRevenue / kpis.current.totalSales 
                  : 0
              )}
              change={0}
              icon={TrendingUp}
            />
          </motion.div>
        </motion.div>

        {/* Main Content - Chart & Goal */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="lg:col-span-2 min-h-[280px]">
            <SalesChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GoalProgress 
              current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0} 
              goal={goalsData?.totalGoal || 0} 
            />
          </motion.div>
        </motion.div>

        {/* Pipeline & Forecast */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <FunnelChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SalesForecast />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RecentDeals />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AlertsPanel />
          </motion.div>
        </motion.div>

        {/* Gamification Row */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <CompetitiveLeaderboard />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StreakWidget salespersonId={salesperson?.id} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <DailyChallengesCard salespersonId={salesperson?.id} compact showTestButton />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="glass rounded-xl p-4 border border-border/40 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-warning" />
                <h3 className="font-semibold text-sm">Deals a Fechar</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Esta semana</span>
                  <span className="font-bold text-success">3</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Este mês</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Em risco</span>
                  <span className="font-bold text-destructive">2</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
