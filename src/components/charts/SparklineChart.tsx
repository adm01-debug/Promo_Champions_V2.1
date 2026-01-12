import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  showArea?: boolean;
  showPoints?: boolean;
  showMinMax?: boolean;
  animate?: boolean;
  className?: string;
}

export const SparklineChart: FC<SparklineChartProps> = ({
  data,
  width = 120,
  height = 40,
  strokeWidth = 2,
  color = 'hsl(var(--primary))',
  showArea = true,
  showPoints = false,
  showMinMax = false,
  animate = true,
  className,
}) => {
  const { path, areaPath, points, minPoint, maxPoint } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', points: [], minPoint: null, maxPoint: null };

    const padding = 4;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const normalizedPoints = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * effectiveWidth,
      y: padding + (1 - (value - min) / range) * effectiveHeight,
      value,
    }));

    // Create smooth curve using quadratic bezier
    let linePath = `M ${normalizedPoints[0].x} ${normalizedPoints[0].y}`;
    for (let i = 1; i < normalizedPoints.length; i++) {
      const prev = normalizedPoints[i - 1];
      const curr = normalizedPoints[i];
      const midX = (prev.x + curr.x) / 2;
      linePath += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
    }
    const lastPoint = normalizedPoints[normalizedPoints.length - 1];
    linePath += ` L ${lastPoint.x} ${lastPoint.y}`;

    // Area path
    const area = `${linePath} L ${lastPoint.x} ${height - padding} L ${normalizedPoints[0].x} ${height - padding} Z`;

    // Find min/max points
    const minIdx = data.indexOf(min);
    const maxIdx = data.indexOf(max);

    return {
      path: linePath,
      areaPath: area,
      points: normalizedPoints,
      minPoint: normalizedPoints[minIdx],
      maxPoint: normalizedPoints[maxIdx],
    };
  }, [data, width, height]);

  const isPositiveTrend = data.length >= 2 && data[data.length - 1] > data[0];

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn('overflow-visible', className)}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${data.join('-').slice(0, 20)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && areaPath && (
        <motion.path
          d={areaPath}
          fill={`url(#sparkline-gradient-${data.join('-').slice(0, 20)})`}
          initial={animate ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Line */}
      {path && (
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}

      {/* Data points */}
      {showPoints && points.map((point, index) => (
        <motion.circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={3}
          fill={color}
          initial={animate ? { scale: 0 } : undefined}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + index * 0.05 }}
        />
      ))}

      {/* Min/Max indicators */}
      {showMinMax && minPoint && maxPoint && (
        <>
          <motion.circle
            cx={minPoint.x}
            cy={minPoint.y}
            r={4}
            fill="hsl(var(--destructive))"
            initial={animate ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
          />
          <motion.circle
            cx={maxPoint.x}
            cy={maxPoint.y}
            r={4}
            fill="hsl(var(--primary))"
            initial={animate ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
          />
        </>
      )}

      {/* Trend indicator */}
      <motion.circle
        cx={points[points.length - 1]?.x || 0}
        cy={points[points.length - 1]?.y || 0}
        r={4}
        fill={isPositiveTrend ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
        initial={animate ? { scale: 0 } : undefined}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ delay: 1, duration: 0.5 }}
      />
    </svg>
  );
};
