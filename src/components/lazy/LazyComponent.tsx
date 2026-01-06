import React, { Suspense, ComponentType, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string;
}

// Default loading skeleton
export function LazyLoader({ 
  children, 
  fallback,
  minHeight = '200px' 
}: LazyLoaderProps) {
  const defaultFallback = (
    <div 
      className="flex items-center justify-center w-full bg-muted/20 rounded-lg animate-pulse"
      style={{ minHeight }}
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      {children}
    </Suspense>
  );
}

// Card skeleton for dashboards
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 p-4 border-b">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-end gap-2 h-[200px]">
          {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyComponent = React.lazy(importFn);

  return function LazyWrappedComponent(props: P) {
    return (
      <LazyLoader fallback={fallback}>
        <LazyComponent {...props} />
      </LazyLoader>
    );
  };
}

// Preload utility for route prefetching
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<unknown> }>
) {
  return importFn();
}
