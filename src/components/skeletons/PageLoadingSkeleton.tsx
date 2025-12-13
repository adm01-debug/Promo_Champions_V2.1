import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <HeaderSkeleton />
        
        {/* Top Seller Spotlight Skeleton */}
        <div className="glass rounded-2xl p-6 border-2 border-border/30">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <Skeleton className="h-3 w-24 mx-auto md:mx-0" />
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
            </div>
            <div className="flex gap-8">
              <div className="text-center space-y-1">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
              <div className="text-center space-y-1">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        <QuickStatsSkeleton />
        <ChartSkeleton height="h-[250px]" />
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}

export function AnalyticsPageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      
      {/* Tabs Skeleton */}
      <div className="flex flex-wrap gap-2 p-1 bg-card/50 rounded-lg border border-border/50">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-[350px]" />
        <ChartSkeleton height="h-[350px]" />
      </div>
    </div>
  );
}

export function AtividadesLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        <HeaderSkeleton />
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Skeleton */}
          <div className="glass rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          {/* Activity List Skeleton */}
          <div className="lg:col-span-2 glass rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border/30">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CadenciasLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        <HeaderSkeleton />
        
        {/* Stats */}
        <QuickStatsSkeleton />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks Skeleton */}
          <div className="glass rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/30">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Cadences List Skeleton */}
          <div className="lg:col-span-2 glass rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-6 w-16 rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
