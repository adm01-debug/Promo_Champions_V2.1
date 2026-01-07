import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'border' | 'scale' | 'tilt';
  delay?: number;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = 'lift',
  delay = 0,
  onClick,
}: AnimatedCardProps) {
  const hoverStyles = {
    lift: {
      y: -4,
      boxShadow: '0 10px 40px -15px hsl(var(--primary) / 0.2)',
    },
    glow: {
      boxShadow: '0 0 30px -5px hsl(var(--primary) / 0.3)',
    },
    border: {
      borderColor: 'hsl(var(--primary))',
    },
    scale: {
      scale: 1.02,
    },
    tilt: {
      rotateX: -2,
      rotateY: 2,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hoverStyles[hoverEffect]}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-card transition-colors duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({ 
  children, 
  className,
  staggerDelay = 0.05 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

interface PulseIndicatorProps {
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseIndicator({
  color = 'primary',
  size = 'md',
  className,
}: PulseIndicatorProps) {
  const colorStyles = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-destructive',
  };

  const sizeStyles = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <span className={cn('relative flex', sizeStyles[size], className)}>
      <span
        className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          colorStyles[color]
        )}
      />
      <span
        className={cn(
          'relative inline-flex rounded-full',
          colorStyles[color],
          sizeStyles[size]
        )}
      />
    </span>
  );
}

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ShimmerButton({ children, className, onClick }: ShimmerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium',
        'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'hover:before:animate-shimmer',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {end.toLocaleString('pt-BR')}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: duration }}
      >
        {suffix}
      </motion.span>
    </motion.span>
  );
}
