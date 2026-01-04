import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  className,
  variant = 'rectangular',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="p-6 border rounded-lg space-y-4">
    <Skeleton height="24px" width="60%" />
    <Skeleton height="16px" width="40%" />
    <Skeleton height="100px" />
    <div className="flex gap-2">
      <Skeleton height="32px" width="80px" />
      <Skeleton height="32px" width="80px" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex gap-4 p-3 border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="20px" className="flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-3">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} height="16px" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    {/* Charts */}
    <div className="grid grid-cols-2 gap-4">
      <Skeleton height="300px" />
      <Skeleton height="300px" />
    </div>
    {/* Table */}
    <TableSkeleton />
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton height="16px" width="120px" />
        <Skeleton height="40px" />
      </div>
    ))}
    <div className="flex gap-2">
      <Skeleton height="40px" width="100px" />
      <Skeleton height="40px" width="100px" />
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border rounded">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton height="16px" width="70%" />
          <Skeleton height="14px" width="50%" />
        </div>
        <Skeleton height="32px" width="80px" />
      </div>
    ))}
  </div>
);
