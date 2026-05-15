import { memo } from "react";
import { motion } from "framer-motion";
import { MyGoalAlertCard } from "@/components/dashboard/MyGoalAlertCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { DailyMissionsPanel } from "@/components/dashboard/DailyMissionsPanel";
import { MiniLeaderboard } from "@/components/dashboard/MiniLeaderboard";
import { PredictiveRevenueForecast } from "@/components/dashboard/PredictiveRevenueForecast";
import { containerVariants, itemVariants } from "@/components/transitions/PageTransition";

interface OverviewModuleProps {
  goalsData: any;
  kpis: any;
}

export const OverviewModule = memo(({ goalsData, kpis }: OverviewModuleProps) => {
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <MyGoalAlertCard />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <DailyMissionsPanel />
      </motion.div>
      
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-8 min-h-[300px] sm:min-h-[400px] rounded-xl bg-gradient-to-br from-card via-card to-primary/[0.02] border border-border/40 shadow-md overflow-hidden hover:border-primary/30 transition-all duration-300">
          <SalesChart />
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl bg-gradient-to-br from-card via-card to-accent/[0.03] border border-border/40 shadow-md overflow-hidden hover:border-accent/30 transition-all duration-300 h-[220px]" data-tour="goals">
            <GoalProgress
              current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0}
              goal={goalsData?.totalGoal || 0}
            />
          </div>
          <PredictiveRevenueForecast />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <MiniLeaderboard />
        </div>
        {/* Espaço para outros widgets de monitoramento se necessário */}
      </motion.div>
    </motion.div>
  );
});

OverviewModule.displayName = "OverviewModule";
