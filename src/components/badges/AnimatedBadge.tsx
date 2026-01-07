import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Zap, 
  Award, 
  Crown,
  Flame,
  Sparkles,
  LucideIcon 
} from 'lucide-react';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  pulse?: boolean;
  glow?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  premium: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  pulse = false,
  glow = false,
  className,
}) => {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        glow && 'shadow-lg shadow-current/20',
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </motion.span>
  );
};

// Preset badges
export const TrendBadge: React.FC<{
  value: number;
  suffix?: string;
}> = ({ value, suffix = '%' }) => {
  const isPositive = value >= 0;
  
  return (
    <AnimatedBadge
      variant={isPositive ? 'success' : 'error'}
      icon={isPositive ? TrendingUp : TrendingDown}
      size="sm"
    >
      {isPositive ? '+' : ''}{value}{suffix}
    </AnimatedBadge>
  );
};

export const NewBadge: React.FC = () => (
  <AnimatedBadge variant="info" pulse size="sm" icon={Sparkles}>
    Novo
  </AnimatedBadge>
);

export const HotBadge: React.FC = () => (
  <AnimatedBadge variant="error" glow size="sm" icon={Flame}>
    Hot
  </AnimatedBadge>
);

export const PremiumBadge: React.FC = () => (
  <AnimatedBadge variant="premium" glow size="sm" icon={Crown}>
    Premium
  </AnimatedBadge>
);

export const TopBadge: React.FC<{ rank?: number }> = ({ rank = 1 }) => (
  <AnimatedBadge variant="warning" glow size="sm" icon={Award}>
    Top {rank}
  </AnimatedBadge>
);

export const LiveBadge: React.FC = () => (
  <AnimatedBadge variant="error" pulse size="sm" icon={Zap}>
    Ao Vivo
  </AnimatedBadge>
);

export const RatingBadge: React.FC<{ rating: number }> = ({ rating }) => (
  <AnimatedBadge variant="warning" size="sm" icon={Star}>
    {rating.toFixed(1)}
  </AnimatedBadge>
);

// Notification counter badge
export const CounterBadge: React.FC<{
  count: number;
  max?: number;
  className?: string;
}> = ({ count, max = 99, className }) => {
  if (count <= 0) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className={cn(
          'absolute -top-1 -right-1 flex items-center justify-center',
          'min-w-[18px] h-[18px] px-1 text-xs font-bold',
          'bg-red-500 text-white rounded-full',
          className
        )}
      >
        {count > max ? `${max}+` : count}
      </motion.span>
    </AnimatePresence>
  );
};
