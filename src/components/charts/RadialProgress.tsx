import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RadialProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  color?: string;
  trackColor?: string;
  animated?: boolean;
  gradient?: boolean;
  className?: string;
}

export const RadialProgress: FC<RadialProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  strokeWidth,
  label,
  sublabel,
  showValue = true,
  valueFormatter = (v) => `${Math.round(v)}%`,
  color = 'hsl(var(--primary))',
  trackColor = 'hsl(var(--muted))',
  animated = true,
  gradient = false,
  className,
}) => {
  const sizeConfig = {
    sm: { width: 60, stroke: 6, fontSize: 'text-sm', sublabelSize: 'text-xs' },
    md: { width: 100, stroke: 8, fontSize: 'text-xl', sublabelSize: 'text-sm' },
    lg: { width: 140, stroke: 10, fontSize: 'text-2xl', sublabelSize: 'text-sm' },
    xl: { width: 180, stroke: 12, fontSize: 'text-4xl', sublabelSize: 'text-base' },
  };

  const config = sizeConfig[size];
  const actualStrokeWidth = strokeWidth || config.stroke;

  const { radius, circumference, percentage } = useMemo(() => {
    const r = (config.width - actualStrokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const p = Math.min((value / max) * 100, 100);
    return { radius: r, circumference: c, percentage: p };
  }, [config.width, actualStrokeWidth, value, max]);

  const gradientId = `radial-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
      >
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        )}

        {/* Track */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={actualStrokeWidth}
          className="opacity-30"
        />

        {/* Progress */}
        <motion.circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            className={cn('font-bold', config.fontSize)}
            initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {valueFormatter(value)}
          </motion.span>
        )}
        {label && (
          <span className={cn('text-muted-foreground', config.sublabelSize)}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-muted-foreground/70">{sublabel}</span>
        )}
      </div>
    </div>
  );
};
