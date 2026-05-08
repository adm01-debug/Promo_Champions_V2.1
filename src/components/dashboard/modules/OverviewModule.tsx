import { motion } from "framer-motion";
import { MyGoalAlertCard } from "@/components/dashboard/MyGoalAlertCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { containerVariants, itemVariants } from "@/components/transitions/PageTransition";

interface OverviewModuleProps {
  goalsData: any;
  kpis: any;
}

export const OverviewModule = ({ goalsData, kpis }: OverviewModuleProps) => {
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
      
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        <div className="lg:col-span-2 min-h-[300px] sm:min-h-[350px] rounded-xl bg-gradient-to-br from-card via-card to-primary/[0.02] border border-border/40 shadow-md overflow-hidden hover:border-primary/30 transition-all duration-300">
          <SalesChart />
        </div>
        <div className="min-h-[220px] rounded-xl bg-gradient-to-br from-card via-card to-accent/[0.03] border border-border/40 shadow-md overflow-hidden hover:border-accent/30 transition-all duration-300" data-tour="goals">
          <GoalProgress
            current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0}
            goal={goalsData?.totalGoal || 0}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
