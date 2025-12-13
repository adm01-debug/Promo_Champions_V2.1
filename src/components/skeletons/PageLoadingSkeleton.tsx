import {
  StatCardSkeleton,
  ChartSkeleton,
  GoalProgressSkeleton,
  TableSkeleton,
  LeaderboardSkeleton,
  PipelineBoardSkeleton,
  FunnelSkeleton,
  GaugeSkeleton,
  AlertsPanelSkeleton,
  QuickStatsSkeleton,
  HeaderSkeleton,
} from "./DashboardSkeletons";

export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        <HeaderSkeleton />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton height="h-[350px]" />
          </div>
          <GoalProgressSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FunnelSkeleton />
          <ChartSkeleton height="h-[200px]" />
          <ChartSkeleton height="h-[200px]" />
          <AlertsPanelSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSkeleton rows={5} />
          <TableSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}

export function PipelineLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-muted/20">
          <div className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <HeaderSkeleton />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <PipelineBoardSkeleton />
        </div>
        <div className="xl:col-span-1">
          <AlertsPanelSkeleton />
        </div>
      </div>
    </div>
  );
}

export function MetasLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        <HeaderSkeleton />
        <QuickStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GoalProgressSkeleton />
          <LeaderboardSkeleton rows={4} />
          <LeaderboardSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}

export function SDRDashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        <HeaderSkeleton />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {[...Array(3)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GaugeSkeleton />
          <FunnelSkeleton />
          <ChartSkeleton height="h-[200px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LeaderboardSkeleton rows={4} />
          <TableSkeleton rows={4} />
          <AlertsPanelSkeleton />
        </div>
      </div>
    </div>
  );
}

export function CloserDashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        <HeaderSkeleton />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {[...Array(2)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-[300px]" />
          <LeaderboardSkeleton rows={4} />
        </div>

        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}

export function AnalyticsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        <HeaderSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-[350px]" />
          <ChartSkeleton height="h-[350px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FunnelSkeleton />
          <ChartSkeleton height="h-[250px]" />
          <TableSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}

export function VendedoresLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
        <HeaderSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TableSkeleton rows={6} />
          </div>
          <LeaderboardSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}
