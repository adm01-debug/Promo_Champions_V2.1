import { DashboardNLQWidget } from "@/components/nlq/DashboardNLQWidget";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { SalesForecast } from "@/components/dashboard/SalesForecast";
import { BenchmarkPanel } from "@/components/analytics/BenchmarkPanel";
import { TeamActivityFeed } from "@/components/collaboration/TeamActivityFeed";
import { ClientHealthPanel } from "@/components/analytics/ClientHealthPanel";
import { EngagementLeaderboardWidget } from "@/components/engagement/EngagementLeaderboardWidget";

export const AnalyticsModule = () => {
  return (
    <div className="space-y-6">
      <DashboardNLQWidget />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KPIGrid />
        </div>
        <AlertsPanel />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FunnelChart />
        <SalesForecast />
        <BenchmarkPanel />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamActivityFeed />
        </div>
        <div className="space-y-6">
          <ClientHealthPanel />
          <EngagementLeaderboardWidget limit={5} />
        </div>
      </div>
    </div>
  );
};
