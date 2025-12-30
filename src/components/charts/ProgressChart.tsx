import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressChartProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  color?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressChart: FC<ProgressChartProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  variant = 'linear',
  color = 'hsl(var(--primary))',
  animated = true,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  if (variant === 'circular') {
    const sizes = {
      sm: { size: 48, stroke: 4 },
      md: { size: 80, stroke: 6 },
      lg: { size: 120, stroke: 8 }
    };

    const { size: circleSize, stroke } = sizes[size];
    const radius = (circleSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg width={circleSize} height={circleSize} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <motion.circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className={cn(
              'font-bold',
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-lg' : 'text-2xl'
            )}>
              {Math.round(percentage)}%
            </span>
          )}
          {label && size !== 'sm' && (
            <span className="text-xs text-muted-foreground">{label}</span>
          )}
        </div>
      </div>
    );
  }

  // Linear variant
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-medium">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', heights[size])}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Multi-segment progress bar
interface MultiProgressProps {
  segments: { value: number; color: string; label?: string }[];
  max?: number;
  height?: number;
  showLabels?: boolean;
  className?: string;
}

export const MultiProgress: FC<MultiProgressProps> = ({
  segments,
  max,
  height = 8,
  showLabels = true,
  className
}) => {
  const total = max || segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div 
        className="w-full bg-muted rounded-full overflow-hidden flex"
        style={{ height }}
      >
        {segments.map((segment, index) => {
          const width = (segment.value / total) * 100;
          return (
            <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: segment.color }}
            />
          );
        })}
      </div>

      {showLabels && (
        <div className="flex flex-wrap gap-4">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-muted-foreground">
                {segment.label || `Segmento ${index + 1}`}
              </span>
              <span className="font-medium">
                {((segment.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
