import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingDots: FC<LoadingDotsProps> = ({
  size = 'md',
  color,
  className
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  return (
    <div className={cn("flex items-center", gapClasses[size], className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "rounded-full bg-current",
            sizeClasses[size]
          )}
          style={color ? { backgroundColor: color } : undefined}
          animate={{
            y: ["0%", "-50%", "0%"],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};
