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
          <StatCardSkeleton highlighted />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton height="h-[350px]" highlighted />
          </div>
          <GoalProgressSkeleton highlighted />
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
        <Skeleton className="p-3 h-12 w-12 rounded-xl" variant="primary" shimmer="glow" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="intense" shimmer="intense" />
          <Skeleton className="h-4 w-64" />
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
          <GoalProgressSkeleton highlighted />
          <LeaderboardSkeleton rows={4} highlighted />
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
          <StatCardSkeleton highlighted />
          <StatCardSkeleton highlighted />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GaugeSkeleton />
          <FunnelSkeleton />
          <ChartSkeleton height="h-[200px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LeaderboardSkeleton rows={4} highlighted />
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
          <StatCardSkeleton highlighted />
          <StatCardSkeleton highlighted />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-[300px]" highlighted />
          <LeaderboardSkeleton rows={4} highlighted />
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

export function RelatorioAtividadesLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        <HeaderSkeleton />
        
        {/* Stats Grid - 6 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl border border-border/40 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" variant="primary" shimmer="glow" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-12" shimmer="intense" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Chart Skeleton */}
          <div className="glass rounded-xl border border-border/40 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" shimmer="intense" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <div className="h-[280px] flex items-end gap-3 pt-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <Skeleton 
                      className="w-full rounded-t-md" 
                      style={{ height: `${20 + Math.random() * 70}%` }}
                      variant="primary"
                      shimmer="glow"
                    />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outcomes Chart Skeleton */}
          <div className="glass rounded-xl border border-border/40 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" shimmer="intense" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center justify-center h-[280px]">
                <div className="relative">
                  <Skeleton className="h-48 w-48 rounded-full" variant="primary" shimmer="glow" />
                  <div className="absolute inset-8">
                    <Skeleton className="h-full w-full rounded-full bg-background" />
                  </div>
                </div>
                <div className="ml-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart Skeleton */}
        <div className="glass rounded-xl border border-border/40 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" shimmer="intense" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
            <div className="h-[220px] flex items-end gap-1 pt-4">
              {[...Array(30)].map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="flex-1 rounded-t-sm" 
                  style={{ height: `${15 + Math.sin(i * 0.5) * 30 + Math.random() * 40}%` }}
                  shimmer="glow"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="glass rounded-xl border border-border/40 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-52" shimmer="intense" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-4 p-3 bg-muted/20 rounded-lg">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4 p-4 rounded-lg border border-border/30 items-center">
                  <div className="flex items-center gap-3 col-span-2">
                    <Skeleton className="h-10 w-10 rounded-full" shimmer={i === 0 ? "glow" : "default"} />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  {[...Array(6)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TarefasLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" variant="intense" shimmer="intense" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>

      {/* Next Best Action Skeleton */}
      <div className="glass rounded-xl border border-primary/30 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" variant="primary" shimmer="glow" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" shimmer="intense" />
              <Skeleton className="h-5 w-16 rounded-full" variant="primary" shimmer="glow" />
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-9 w-28 rounded-md" variant="primary" shimmer="glow" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[200px] rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" variant="primary" shimmer="glow" />
        </div>
      </div>

      {/* Priority Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" variant="intense" shimmer="intense" />
            <div className="space-y-1">
              <Skeleton className="h-7 w-8" shimmer="intense" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-7 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-7 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Priority Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Priority Column */}
        <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" variant="intense" shimmer="intense" />
              <Skeleton className="h-5 w-20" shimmer="intense" />
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" shimmer={i === 0 ? "intense" : "default"} />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-1">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medium Priority Column */}
        <div className="rounded-xl border-2 border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-1">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Priority Column */}
        <div className="rounded-xl border-2 border-success/30 bg-success/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-card border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-2/3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-1">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FonteLeadsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl border-border/40 p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton height="h-[400px]" highlighted />
          </div>
          <ChartSkeleton height="h-[400px]" />
        </div>

        {/* Trend Chart */}
        <ChartSkeleton height="h-[300px]" />

        {/* Insights */}
        <div className="glass rounded-xl border-border/40 p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/20">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProdutosLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div>
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4" />
              
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>

              <div className="pt-4 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
