import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max?: number;
  min?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  thresholds?: {
    warning: number;
    danger: number;
  };
  className?: string;
}

export const GaugeChart: FC<GaugeChartProps> = ({
  value,
  max = 100,
  min = 0,
  label,
  size = 'md',
  showValue = true,
  thresholds = { warning: 60, danger: 80 },
  className,
}) => {
  const percentage = useMemo(() => {
    const clampedValue = Math.min(Math.max(value, min), max);
    return ((clampedValue - min) / (max - min)) * 100;
  }, [value, min, max]);

  const sizeConfig = {
    sm: { width: 100, strokeWidth: 8, fontSize: 'text-lg' },
    md: { width: 140, strokeWidth: 10, fontSize: 'text-2xl' },
    lg: { width: 180, strokeWidth: 12, fontSize: 'text-3xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semicircle

  const getColor = () => {
    if (percentage >= thresholds.danger) return 'hsl(var(--destructive))';
    if (percentage >= thresholds.warning) return 'hsl(var(--warning, 45 93% 47%))';
    return 'hsl(var(--primary))';
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <svg
        width={config.width}
        height={config.width / 2 + 10}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.width / 2} 
              A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Animated progress arc */}
        <motion.path
          d={`M ${config.strokeWidth / 2} ${config.width / 2} 
              A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * percentage) / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = (tick / 100) * 180;
          const radian = (angle * Math.PI) / 180;
          const x1 = config.width / 2 - (radius - 4) * Math.cos(radian);
          const y1 = config.width / 2 - (radius - 4) * Math.sin(radian);
          const x2 = config.width / 2 - (radius + 4) * Math.cos(radian);
          const y2 = config.width / 2 - (radius + 4) * Math.sin(radian);
          
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}
      </svg>

      {showValue && (
        <motion.div
          className={cn('font-bold', config.fontSize)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: getColor() }}
        >
          {Math.round(value)}%
        </motion.div>
      )}

      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
};
