import { FC, useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ButtonRippleProps {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

export const ButtonRipple: FC<ButtonRippleProps> = ({
  children,
  className,
  rippleColor = 'rgba(255, 255, 255, 0.4)',
  onClick,
  disabled
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              borderRadius: '50%',
              backgroundColor: rippleColor,
              pointerEvents: 'none'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
