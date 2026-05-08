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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-1 border border-primary/10">
        <DashboardNLQWidget />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border/40 p-1 shadow-lg overflow-hidden">
          <KPIGrid />
        </div>
        <div className="rounded-2xl bg-card border border-border/40 p-1 shadow-lg overflow-hidden">
          <AlertsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <FunnelChart />
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <SalesForecast />
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <BenchmarkPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card p-4 shadow-md">
          <TeamActivityFeed />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-md">
            <ClientHealthPanel />
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-md bg-gradient-to-br from-card to-accent/5">
            <EngagementLeaderboardWidget limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
};
