import { FC, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  formatNumber?: boolean;
}

export const CountUp: FC<CountUpProps> = ({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  formatNumber = true
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      const formatted = formatNumber 
        ? latest.toLocaleString('pt-BR', { 
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals 
          })
        : latest.toFixed(decimals);
      setDisplayValue(formatted);
    });
    
    return () => unsubscribe();
  }, [spring, decimals, formatNumber]);

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
};
