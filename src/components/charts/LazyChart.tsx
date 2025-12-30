import { FC, ReactNode, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyChartProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
  fallback?: ReactNode;
  delay?: number;
}

export const LazyChart: FC<LazyChartProps> = ({
  children,
  height = 300,
  className,
  fallback,
  delay = 0
}) => {
  const [ref, isInView] = useIntersectionObserver({ 
    threshold: 0.1,
    freezeOnceVisible: true 
  });
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  return (
    <div 
      ref={ref} 
      className={cn("relative", className)}
      style={{ minHeight: height }}
    >
      {shouldRender ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || <ChartSkeleton height={height} />
      )}
    </div>
  );
};

// Chart-specific skeleton
interface ChartSkeletonProps {
  height?: number | string;
  type?: 'bar' | 'line' | 'pie' | 'area';
  className?: string;
}

export const ChartSkeleton: FC<ChartSkeletonProps> = ({
  height = 300,
  type = 'bar',
  className
}) => {
  const heightValue = typeof height === 'number' ? height : 300;

  return (
    <div 
      className={cn("w-full rounded-lg bg-muted/30 p-4 animate-pulse", className)}
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Chart area */}
      <div className="flex-1 flex items-end justify-between gap-2" style={{ height: heightValue - 80 }}>
        {type === 'bar' && (
          <>
            {[0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.3].map((h, i) => (
              <Skeleton 
                key={i} 
                className="flex-1 rounded-t"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </>
        )}

        {type === 'line' && (
          <div className="w-full h-full relative">
            <Skeleton className="absolute bottom-0 left-0 right-0 h-1" />
            <Skeleton className="absolute bottom-[30%] left-0 right-0 h-0.5 opacity-50" />
            <Skeleton className="absolute bottom-[60%] left-0 right-0 h-0.5 opacity-30" />
          </div>
        )}

        {type === 'pie' && (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="rounded-full" style={{ width: heightValue * 0.6, height: heightValue * 0.6 }} />
          </div>
        )}

        {type === 'area' && (
          <div className="w-full h-full relative overflow-hidden">
            <Skeleton className="absolute inset-x-0 bottom-0 h-[60%] rounded-t-3xl" />
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
};

// Stat card skeleton
export const StatCardSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn("glass rounded-xl p-6 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

// Table row skeleton
export const TableRowSkeleton: FC<{ columns?: number; className?: string }> = ({ 
  columns = 5,
  className 
}) => (
  <div className={cn("flex items-center gap-4 p-4 border-b border-border/30", className)}>
    {[...Array(columns)].map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === 0 ? "w-40" : i === columns - 1 ? "w-20" : "w-24"
        )} 
      />
    ))}
  </div>
);

// Card grid skeleton
export const CardGridSkeleton: FC<{ count?: number; className?: string }> = ({ 
  count = 6,
  className 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="glass rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ))}
  </div>
);
