import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  delay?: number;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  format = (v) => v.toLocaleString('pt-BR'),
  className,
  delay = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();
    const totalDuration = duration * 1000;

    const delayTimeout = setTimeout(() => {
      hasAnimated.current = true;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);

        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeProgress;

        setDisplayValue(Math.round(currentValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          prevValueRef.current = endValue;
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(delayTimeout);
  }, [value, duration, delay]);

  return (
    <motion.span
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {format(displayValue)}
    </motion.span>
  );
}

interface AnimatedProgressProps {
  value: number;
  max?: number;
  duration?: number;
  showLabel?: boolean;
  labelFormat?: (value: number, max: number) => string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function AnimatedProgress({
  value,
  max = 100,
  duration = 1,
  showLabel = false,
  labelFormat = (v, m) => `${Math.round((v / m) * 100)}%`,
  size = 'md',
  variant = 'default',
  className,
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const springValue = useSpring(0, { stiffness: 50, damping: 15 });

  useEffect(() => {
    springValue.set(percentage);
  }, [percentage, springValue]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-destructive',
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn('w-full rounded-full bg-muted overflow-hidden', sizeClasses[size])}>
        <motion.div
          className={cn('h-full rounded-full', variantClasses[variant])}
          style={{ width: useTransform(springValue, (v) => `${v}%`) }}
        />
      </div>
      {showLabel && (
        <motion.span
          className="absolute right-0 -top-6 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {labelFormat(value, max)}
        </motion.span>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  labelFormat?: (value: number, max: number) => string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  labelFormat = (v, m) => `${Math.round((v / m) * 100)}%`,
  variant = 'default',
  className,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const springValue = useSpring(0, { stiffness: 50, damping: 15 });

  useEffect(() => {
    springValue.set(percentage);
  }, [percentage, springValue]);

  const strokeDashoffset = useTransform(
    springValue,
    (v) => circumference - (v / 100) * circumference
  );

  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-destructive',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={variantColors[variant]}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedCounter
            value={value}
            format={(v) => labelFormat(v, max)}
            className="text-sm font-medium"
          />
        </div>
      )}
    </div>
  );
}
