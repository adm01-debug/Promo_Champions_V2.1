import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessPulseProps {
  show: boolean;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'check' | 'sparkle' | 'burst';
  className?: string;
}

export const SuccessPulse: FC<SuccessPulseProps> = ({
  show,
  onComplete,
  size = 'md',
  variant = 'check',
  className
}) => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (show && variant === 'burst') {
      setParticles(Array.from({ length: 8 }, (_, i) => i));
      const timer = setTimeout(() => setParticles([]), 600);
      return () => clearTimeout(timer);
    }
  }, [show, variant]);

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28
  };

  return (
    <AnimatePresence>
      {show && (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
          {/* Main circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={cn(
              "rounded-full bg-green-500 flex items-center justify-center",
              sizeClasses[size]
            )}
          >
            {variant === 'check' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
              >
                <Check className="text-white" size={iconSizes[size]} strokeWidth={3} />
              </motion.div>
            )}
            {variant === 'sparkle' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="text-white" size={iconSizes[size]} />
              </motion.div>
            )}
          </motion.div>

          {/* Pulse rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(
              "absolute rounded-full border-2 border-green-500",
              sizeClasses[size]
            )}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={cn(
              "absolute rounded-full border border-green-400",
              sizeClasses[size]
            )}
          />

          {/* Burst particles */}
          {particles.map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              animate={{
                scale: 0,
                opacity: 0,
                x: Math.cos((i * Math.PI * 2) / 8) * 40,
                y: Math.sin((i * Math.PI * 2) / 8) * 40
              }}
              transition={{ duration: 0.5 }}
              className="absolute w-2 h-2 rounded-full bg-green-400"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
