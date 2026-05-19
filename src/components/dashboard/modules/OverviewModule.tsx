import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MyGoalAlertCard } from "@/components/dashboard/MyGoalAlertCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { DailyMissionsPanel } from "@/components/dashboard/DailyMissionsPanel";
import { MiniLeaderboard } from "@/components/dashboard/MiniLeaderboard";
import { PredictiveRevenueForecast } from "@/components/dashboard/PredictiveRevenueForecast";
import { containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import type { KPIPeriodResult } from "@/hooks/dashboard/useDashboardKPIsPeriod";

interface OverviewModuleProps {
  goalsData: {
    totalSales: number;
    totalGoal: number;
  } | undefined;
  kpis: KPIPeriodResult | undefined;
}

export const OverviewModule = memo(({ goalsData, kpis }: OverviewModuleProps) => {
  // Simulating a long list for virtualization demo or actual usage
  const activityItems = useMemo(() => Array.from({ length: 1000 }).map((_, i) => ({
    id: i,
    title: `Atividade Crítica #${i + 1}`,
    time: "2m atrás",
    status: i % 3 === 0 ? "high" : "normal"
  })), []);
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
        <div className="lg:col-span-3">
          <div className="p-4 rounded-xl border border-border/40 bg-card/30 backdrop-blur-md">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Monitoramento de Fluxo Realtime (Virtualizado)
            </h3>
            <VirtualizedList 
              items={activityItems}
              height={300}
              itemHeight={50}
              renderItem={(item) => (
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", item.status === "high" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-emerald-500")} />
                    <span className="text-xs font-mono text-foreground/80">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{item.time}</span>
                </div>
              )}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

OverviewModule.displayName = "OverviewModule";
