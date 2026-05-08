import { motion } from "framer-motion";
import { MyGoalAlertCard } from "@/components/dashboard/MyGoalAlertCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";

interface OverviewModuleProps {
  goalsData: any;
  kpis: any;
}

export const OverviewModule = ({ goalsData, kpis }: OverviewModuleProps) => {
  return (
    <div className="space-y-6">
      <MyGoalAlertCard />
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="lg:col-span-2 min-h-[280px] sm:min-h-[320px] rounded-xl bg-gradient-to-br from-card via-card to-primary/[0.02] border border-border/40 shadow-sm overflow-hidden">
          <SalesChart />
        </div>
        <div className="min-h-[200px] rounded-xl bg-gradient-to-br from-card via-card to-accent/[0.03] border border-border/40 shadow-sm overflow-hidden" data-tour="goals">
          <GoalProgress
            current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0}
            goal={goalsData?.totalGoal || 0}
          />
        </div>
      </motion.div>
    </div>
  );
};
