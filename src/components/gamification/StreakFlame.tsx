import { FC } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakFlameProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export const StreakFlame: FC<StreakFlameProps> = ({
  days,
  size = 'md',
  showLabel = true,
  animated = true,
  className
}) => {
  const sizeClasses = {
    sm: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-xs' },
    md: { container: 'h-12 w-12', icon: 'h-6 w-6', text: 'text-sm' },
    lg: { container: 'h-16 w-16', icon: 'h-8 w-8', text: 'text-base' }
  };

  const config = sizeClasses[size];
  const intensity = Math.min(days / 7, 1); // Max intensity at 7 days
  
  // Color intensity based on streak days
  const flameColors = days >= 7 
    ? 'from-orange-400 via-red-500 to-rose-600' 
    : days >= 3 
      ? 'from-orange-400 via-amber-500 to-yellow-500'
      : 'from-amber-400 via-yellow-500 to-orange-400';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          config.container
        )}
        animate={animated ? {
          scale: [1, 1.05, 1],
        } : undefined}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Glow effect */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-t blur-md opacity-60',
            flameColors
          )} 
        />
        
        {/* Background */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-t',
            flameColors
          )} 
        />

        {/* Flame icon with animation */}
        <motion.div
          animate={animated ? {
            y: [0, -2, 0],
            scale: [1, 1.1, 1]
          } : undefined}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative z-10"
        >
          <Flame className={cn(config.icon, 'text-white drop-shadow-lg')} />
        </motion.div>

        {/* Animated flame particles */}
        {animated && days >= 3 && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-1/2 w-1 h-2 rounded-full bg-yellow-200"
                animate={{
                  y: [0, -20],
                  x: [(i - 1) * 4, (i - 1) * 6],
                  opacity: [0.8, 0],
                  scale: [1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )}

        {/* Super streak indicator */}
        {days >= 7 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg"
          >
            <Zap className="h-2.5 w-2.5 text-yellow-900" />
          </motion.div>
        )}
      </motion.div>

      {showLabel && (
        <div className="flex flex-col">
          <motion.span 
            className={cn('font-bold text-foreground', config.text)}
            key={days}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {days} {days === 1 ? 'dia' : 'dias'}
          </motion.span>
          <span className="text-xs text-muted-foreground">
            {days >= 7 ? '🔥 Super Streak!' : days >= 3 ? '⚡ Mantendo!' : 'de streak'}
          </span>
        </div>
      )}
    </div>
  );
};

// Compact streak badge for headers
export const StreakBadge: FC<{ days: number; className?: string }> = ({ days, className }) => {
  if (days < 1) return null;

  const intensity = Math.min(days / 7, 1);
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
        days >= 7 
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
          : days >= 3
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        className
      )}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        🔥
      </motion.span>
      <span>{days}</span>
    </motion.div>
  );
};
