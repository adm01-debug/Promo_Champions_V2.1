import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'table' | 'profile' | 'chart' | 'text';
  count?: number;
  animate?: boolean;
  className?: string;
}

const SkeletonPulse: FC<{ className?: string }> = ({ className }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={cn("bg-muted rounded", className)}
  />
);

const CardSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonPulse className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-4 w-3/4" />
        <SkeletonPulse className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonPulse className="h-20 w-full" />
    <div className="flex gap-2">
      <SkeletonPulse className="h-8 w-20" />
      <SkeletonPulse className="h-8 w-20" />
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className="flex items-center gap-3 p-3 border-b">
    <SkeletonPulse className="w-8 h-8 rounded" />
    <div className="flex-1 space-y-2">
      <SkeletonPulse className="h-4 w-2/3" />
      <SkeletonPulse className="h-3 w-1/3" />
    </div>
    <SkeletonPulse className="h-6 w-16" />
  </div>
);

const TableSkeleton = () => (
  <div className="border rounded-lg overflow-hidden">
    <div className="flex gap-4 p-3 bg-muted/50 border-b">
      {[1, 2, 3, 4].map(i => (
        <SkeletonPulse key={i} className="h-4 flex-1" />
      ))}
    </div>
    {[1, 2, 3, 4, 5].map(row => (
      <div key={row} className="flex gap-4 p-3 border-b last:border-0">
        {[1, 2, 3, 4].map(col => (
          <SkeletonPulse key={col} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

const ProfileSkeleton = () => (
  <div className="flex flex-col items-center space-y-4">
    <SkeletonPulse className="w-24 h-24 rounded-full" />
    <div className="space-y-2 w-full max-w-xs">
      <SkeletonPulse className="h-6 w-3/4 mx-auto" />
      <SkeletonPulse className="h-4 w-1/2 mx-auto" />
    </div>
    <div className="flex gap-4">
      <SkeletonPulse className="h-10 w-24" />
      <SkeletonPulse className="h-10 w-24" />
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between mb-4">
      <SkeletonPulse className="h-6 w-32" />
      <SkeletonPulse className="h-6 w-20" />
    </div>
    <div className="flex items-end gap-2 h-40">
      {[40, 65, 45, 80, 55, 70, 35, 90, 60, 75, 50, 85].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="flex-1 bg-muted rounded-t"
        />
      ))}
    </div>
  </div>
);

const TextSkeleton = () => (
  <div className="space-y-3">
    <SkeletonPulse className="h-4 w-full" />
    <SkeletonPulse className="h-4 w-11/12" />
    <SkeletonPulse className="h-4 w-4/5" />
    <SkeletonPulse className="h-4 w-9/12" />
  </div>
);

const variantMap = {
  card: CardSkeleton,
  list: ListSkeleton,
  table: TableSkeleton,
  profile: ProfileSkeleton,
  chart: ChartSkeleton,
  text: TextSkeleton
};

export const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  animate = true,
  className
}) => {
  const SkeletonComponent = variantMap[variant];

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      className={cn("space-y-4", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={animate ? { opacity: 0, y: 10 } : undefined}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonComponent />
        </motion.div>
      ))}
    </motion.div>
  );
};
