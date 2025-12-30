import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'gradient';
  className?: string;
  animate?: boolean;
  label?: string;
}

export const AnimatedProgressBar: FC<AnimatedProgressBarProps> = ({
  value,
  max = 100,
  showValue = false,
  size = 'md',
  variant = 'default',
  className,
  animate = true,
  label
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    gradient: 'bg-gradient-to-r from-primary via-primary-glow to-success'
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
          {showValue && (
            <AnimatedNumber value={value} suffix={`/${max}`} className="text-sm font-medium" />
          )}
        </div>
      )}
      
      <div className={cn(
        "w-full rounded-full bg-muted overflow-hidden",
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            "h-full rounded-full",
            variantClasses[variant]
          )}
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0, 0.2, 1],
            delay: 0.1
          }}
        />
      </div>
    </div>
  );
};

// Animated number counter
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export const AnimatedNumber: FC<AnimatedNumberProps> = ({
  value,
  duration = 1,
  prefix = '',
  suffix = '',
  className,
  decimals = 0
}) => {
  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={value}
      >
        {prefix}
        <CountUp end={value} duration={duration} decimals={decimals} />
        {suffix}
      </motion.span>
    </motion.span>
  );
};

// Simple count up animation
interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
}

const CountUp: FC<CountUpProps> = ({ end, duration = 1, decimals = 0 }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ filter: 'blur(4px)' }}
        animate={{ filter: 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      >
        {end.toLocaleString('pt-BR', { 
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals 
        })}
      </motion.span>
    </motion.span>
  );
};

// Circular progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning';
  className?: string;
  children?: ReactNode;
}

export const CircularProgress: FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showValue = true,
  variant = 'default',
  className,
  children
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning'
  };

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={variantColors[variant]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-sm font-semibold">
            {Math.round(percentage)}%
          </span>
        ))}
      </div>
    </div>
  );
};
