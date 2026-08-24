import { FuturisticSpeedometerDashboard } from "@/components/dashboard/FuturisticSpeedometerDashboard";
import { PeriodTrendChart } from "@/components/dashboard/PeriodTrendChart";
import { TrendsChartsPanel } from "@/components/dashboard/TrendsChartsPanel";

export const PerformanceModule = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl bg-black/20 border border-white/5 p-6 backdrop-blur-sm shadow-xl">
        <FuturisticSpeedometerDashboard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-card/40 border border-border/40 p-6 shadow-lg hover:border-primary/20 transition-all">
          <PeriodTrendChart />
        </div>
        <div className="rounded-2xl bg-card/40 border border-border/40 p-6 shadow-lg hover:border-primary/20 transition-all">
          <TrendsChartsPanel />
        </div>
      </div>
    </div>
  );
};
