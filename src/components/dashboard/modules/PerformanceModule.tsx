import { FuturisticSpeedometerDashboard } from "@/components/dashboard/FuturisticSpeedometerDashboard";
import { PeriodTrendChart } from "@/components/dashboard/PeriodTrendChart";
import { TrendsChartsPanel } from "@/components/dashboard/TrendsChartsPanel";

export const PerformanceModule = () => {
  return (
    <div className="space-y-8">
      <FuturisticSpeedometerDashboard />
      <PeriodTrendChart />
      <TrendsChartsPanel />
    </div>
  );
};
