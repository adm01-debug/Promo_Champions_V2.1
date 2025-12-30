import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showPercent?: boolean;
  children?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export const ProgressRing: FC<ProgressRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color = 'hsl(var(--primary))',
  bgColor = 'hsl(var(--muted))',
  showPercent = true,
  children,
  className,
  animated = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const offset = circumference - (clampedProgress / 100) * circumference;

  const CircleComponent = animated ? motion.circle : 'circle';
  const circleProps = animated ? {
    initial: { strokeDashoffset: circumference },
    animate: { strokeDashoffset: offset },
    transition: { duration: 1, ease: 'easeOut' as const }
  } : {};

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <CircleComponent
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? undefined : offset}
          {...circleProps}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercent && (
          <span className="text-sm font-semibold text-foreground">
            {Math.round(clampedProgress)}%
          </span>
        ))}
      </div>
    </div>
  );
};
