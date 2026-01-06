import { FC } from "react";
import { motion } from "framer-motion";
import { SalesChart } from "../SalesChart";
import { GoalProgress } from "../GoalProgress";
import { FunnelChart } from "../FunnelChart";
import { TopProducts } from "../TopProducts";
import { SalesForecast } from "../SalesForecast";
import { KPIGrid } from "../KPIGrid";
import { CompetitiveLeaderboard } from "@/components/gamification/CompetitiveLeaderboard";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { itemVariants, containerVariants } from "@/components/transitions/PageTransition";
import { TeamPerformanceDrilldown } from "../gestor/TeamPerformanceDrilldown";
import { AlertsDrilldown } from "../gestor/AlertsDrilldown";
import { MetricsDrilldown } from "../gestor/MetricsDrilldown";

interface GestorDashboardProps {
  className?: string;
}

export const GestorDashboard: FC<GestorDashboardProps> = ({ className }) => {
  const { data: goalsData } = useGoalsDashboard();
  const { data: kpis } = useDashboardKPIs();

  return (
    <div className={className}>
      {/* Gestor Focus: Team Overview & Forecast */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Interactive KPI Cards with Drill-down */}
        <MetricsDrilldown />

        {/* Main Charts Row */}
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
              label="Meta da Equipe"
            />
          </motion.div>
        </motion.div>

        {/* Team Performance with Drill-down */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <TeamPerformanceDrilldown />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AlertsDrilldown />
          </motion.div>
        </motion.div>

        {/* Analytics Row */}
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
            <TopProducts />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPIGrid />
          </motion.div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <CompetitiveLeaderboard showAll />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
