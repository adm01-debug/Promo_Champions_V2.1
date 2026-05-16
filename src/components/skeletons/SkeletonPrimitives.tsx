import { FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Shimmer skeleton with gradient animation for premium loading feel */
export const Shimmer: FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div
    className={cn(
      "rounded-md bg-muted/60 relative overflow-hidden",
      className
    )}
    style={style}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent" />
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse" />
  </div>
);

export const SkeletonCard: FC<{ className?: string }> = ({ className }) => (
  <Card className={className}>
    <CardHeader className="pb-2"><Skeleton className="h-5 w-1/3" /></CardHeader>
    <CardContent><Skeleton className="h-8 w-1/2 mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent>
  </Card>
);

export const StatsGridSkeleton: FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export const ChartSkeleton: FC = () => (
  <Card><CardHeader><Skeleton className="h-5 w-1/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
);

export const TableSkeleton: FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Card><CardContent className="pt-6"><div className="space-y-3"><Skeleton className="h-10 w-full" />{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card>
);

export const PageHeaderSkeleton: FC = () => (
  <div className="flex items-center justify-between mb-6">
    <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></div>
    <div className="flex gap-2"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-24" /></div>
  </div>
);

export const KPICardSkeleton: FC<{ hero?: boolean }> = ({ hero }) => (
  <Card className={cn("overflow-hidden", hero && "relative")}>
    <CardContent className={cn("p-4 sm:p-6", hero && "sm:p-8")}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Shimmer className={cn("h-3 rounded-md", hero ? "w-24" : "w-16")} />
          <Shimmer className={cn("rounded-md", hero ? "h-10 w-44" : "h-7 w-24")} />
          <div className="flex items-center gap-2"><Shimmer className="h-5 w-14 rounded-md" /><Shimmer className="h-3 w-16 rounded-md" /></div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Shimmer className={cn("rounded-xl", hero ? "h-14 w-14" : "h-10 w-10")} />
          {!hero && <Shimmer className="h-5 w-14 rounded-md" />}
        </div>
      </div>
      {hero && <Shimmer className="h-8 w-full mt-3 rounded-md" />}
    </CardContent>
  </Card>
);

export const ChartCardSkeleton: FC<{ className?: string }> = ({ className }) => (
  <Card className={className}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-32" />
        <div className="flex gap-1.5"><Shimmer className="h-7 w-10 rounded-md" /><Shimmer className="h-7 w-10 rounded-md" /><Shimmer className="h-7 w-10 rounded-md" /></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end gap-1.5 h-48 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Shimmer key={i} className="flex-1 rounded-t-md" style={{ height: `${30 + Math.sin(i * 0.8) * 40 + 30}%` }} />
        ))}
      </div>
    </CardContent>
  </Card>
);

export const GoalCardSkeleton: FC = () => (
  <Card>
    <CardHeader className="pb-2"><Shimmer className="h-5 w-28" /></CardHeader>
    <CardContent className="flex flex-col items-center gap-4 py-6">
      <div className="relative h-28 w-28">
        <Shimmer className="absolute inset-0 rounded-full" />
        <div className="absolute inset-3 rounded-full bg-card" />
        <div className="absolute inset-0 flex items-center justify-center"><Shimmer className="h-6 w-12 rounded-md" /></div>
      </div>
      <Shimmer className="h-3 w-36" />
      <Shimmer className="h-2 w-full rounded-full" />
    </CardContent>
  </Card>
);
