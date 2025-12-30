import { FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Stat Card Skeleton
export const StatCardSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn("glass rounded-xl p-5", className)}>
    <div className="flex items-start justify-between mb-4">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-3 w-24 mb-2" />
    <Skeleton className="h-8 w-32" />
  </div>
);

// Chart Skeleton
export const ChartSkeleton: FC<{ 
  className?: string;
  height?: number;
  showHeader?: boolean;
}> = ({ className, height = 200, showHeader = true }) => (
  <div className={cn("glass rounded-xl", className)}>
    {showHeader && (
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    )}
    <div className="p-4">
      <div style={{ height }} className="flex items-end justify-around gap-2">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton: FC<{ columns?: number }> = ({ columns = 5 }) => (
  <div className="flex items-center gap-4 p-4 border-b border-border/30">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === 0 ? "w-16" : i === columns - 1 ? "w-20" : "flex-1"
        )}
      />
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton: FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 5 
}) => (
  <div className="glass rounded-xl overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-4 p-4 border-b border-border/50 bg-muted/30">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} columns={columns} />
    ))}
  </div>
);

// Card Grid Skeleton
export const CardGridSkeleton: FC<{ 
  count?: number; 
  columns?: 2 | 3 | 4;
}> = ({ count = 6, columns = 3 }) => {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid grid-cols-1 gap-4", gridCols[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton: FC = () => (
  <div className="flex items-center gap-4 p-4">
    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" />
  </div>
);

// List Skeleton
export const ListSkeleton: FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="glass rounded-xl overflow-hidden divide-y divide-border/30">
    {Array.from({ length: count }).map((_, i) => (
      <ListItemSkeleton key={i} />
    ))}
  </div>
);

// KPI Grid Skeleton
export const KPIGridSkeleton: FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton: FC = () => (
  <div className="space-y-6">
    <KPIGridSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartSkeleton height={300} />
      </div>
      <div>
        <ChartSkeleton height={300} />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ChartSkeleton key={i} height={200} />
      ))}
    </div>
  </div>
);
