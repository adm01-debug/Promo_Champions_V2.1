import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text' | 'card' | 'avatar' | 'button';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

export const SkeletonShimmer: React.FC<SkeletonShimmerProps> = ({
  className,
  variant = 'default',
  width,
  height,
  lines = 1,
  animated = true,
  ...props
}) => {
  const baseClasses = cn(
    'bg-muted/50 rounded-md',
    animated &&
      'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent'
  );

  const variantStyles: Record<string, string> = {
    default: 'w-full h-4',
    circle: 'rounded-full',
    text: 'h-4 rounded',
    card: 'w-full h-32 rounded-xl',
    avatar: 'w-10 h-10 rounded-full',
    button: 'w-24 h-10 rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width ?? undefined,
    height: height ?? undefined,
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantStyles.text)}
            style={{
              width: i === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantStyles[variant], className)}
      style={style}
      {...props}
    />
  );
};

// Preset skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 rounded-xl border border-border bg-card space-y-4', className)}>
    <div className="flex items-center gap-3">
      <SkeletonShimmer variant="avatar" />
      <div className="flex-1 space-y-2">
        <SkeletonShimmer width="60%" height={14} />
        <SkeletonShimmer width="40%" height={10} />
      </div>
    </div>
    <SkeletonShimmer variant="text" lines={3} />
    <div className="flex gap-2">
      <SkeletonShimmer variant="button" />
      <SkeletonShimmer variant="button" width={80} />
    </div>
  </div>
);

export const SkeletonStatCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-5 rounded-xl border border-border bg-card space-y-3', className)}>
    <div className="flex items-center justify-between">
      <SkeletonShimmer width={100} height={12} />
      <SkeletonShimmer variant="circle" width={32} height={32} />
    </div>
    <SkeletonShimmer width="70%" height={28} />
    <SkeletonShimmer width="40%" height={10} />
  </div>
);
