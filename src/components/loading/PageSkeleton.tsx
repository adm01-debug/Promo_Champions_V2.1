import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PageSkeletonProps {
  variant?: 'dashboard' | 'list' | 'detail' | 'form' | 'kanban';
  className?: string;
}

export function PageSkeleton({ variant = 'dashboard', className }: PageSkeletonProps) {
  return (
    <div className={cn("animate-fade-in", className)}>
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'kanban' && <KanbanSkeleton />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border-b p-4 last:border-0">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Skeleton className="h-8 w-24" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border p-6 space-y-3">
            <Skeleton className="h-6 w-24" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(5)].map((_, col) => (
          <div key={col} className="flex-shrink-0 w-72 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8" />
            </div>
            {[...Array(3)].map((_, card) => (
              <div key={card} className="rounded-lg border bg-card p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { DashboardSkeleton, ListSkeleton, DetailSkeleton, FormSkeleton, KanbanSkeleton };
