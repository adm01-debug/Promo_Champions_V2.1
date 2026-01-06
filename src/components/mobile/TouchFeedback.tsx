import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  haptic?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
}

export const TouchFeedback: FC<TouchFeedbackProps> = ({
  children,
  className,
  onClick,
  haptic = 'light',
  disabled = false
}) => {
  const handleClick = () => {
    if (disabled) return;
    
    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      const duration = haptic === 'light' ? 10 : haptic === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
    
    onClick?.();
  };

  return (
    <motion.div
      whileTap={disabled ? undefined : { scale: 0.97, opacity: 0.8 }}
      transition={{ duration: 0.1 }}
      onClick={handleClick}
      className={cn(
        "touch-manipulation select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </motion.div>
  );
};

// Larger touch targets for mobile
export const TouchTarget: FC<{
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  minSize?: number;
}> = ({ children, onClick, className, minSize = 44 }) => (
  <TouchFeedback
    onClick={onClick}
    className={cn(
      "flex items-center justify-center",
      className
    )}
    style={{ minWidth: minSize, minHeight: minSize }}
  >
    {children}
  </TouchFeedback>
);

// Floating Action Button
export const FloatingActionButton: FC<{
  icon: React.ElementType;
  onClick?: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
}> = ({ 
  icon: Icon, 
  onClick, 
  label,
  variant = 'primary',
  position = 'bottom-right'
}) => {
  const positionClasses = {
    'bottom-right': 'right-4 bottom-20',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-20',
    'bottom-left': 'left-4 bottom-20'
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "fixed z-40 shadow-lg md:hidden",
        positionClasses[position],
        label ? "px-4 py-3 rounded-full flex items-center gap-2" : "w-14 h-14 rounded-full flex items-center justify-center",
        variant === 'primary' 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
      )}
    >
      <Icon className="w-5 h-5" />
      {label && <span className="font-medium">{label}</span>}
    </motion.button>
  );
};
