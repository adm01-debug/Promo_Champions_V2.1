import { FC, ReactNode, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check, Trash2, Archive, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeComplete?: (direction: 'left' | 'right') => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeComplete,
  threshold = 100,
  className,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform for left actions visibility
  const leftOpacity = useTransform(x, [0, threshold], [0, 1]);
  const leftScale = useTransform(x, [0, threshold], [0.8, 1]);
  
  // Transform for right actions visibility
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const rightScale = useTransform(x, [-threshold, 0], [1, 0.8]);

  // Background color based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-threshold, 0, threshold],
    [
      rightActions[0]?.bgColor || 'hsl(var(--destructive))',
      'transparent',
      leftActions[0]?.bgColor || 'hsl(var(--success))'
    ]
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    const xOffset = info.offset.x;

    if (Math.abs(xOffset) > threshold) {
      const direction = xOffset > 0 ? 'left' : 'right';
      const actions = direction === 'left' ? leftActions : rightActions;
      
      if (actions.length > 0) {
        // Trigger haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        actions[0].onAction();
        onSwipeComplete?.(direction);
      }
    }
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-xl", className)}
    >
      {/* Left actions background */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center justify-start px-4 rounded-l-xl"
          style={{ 
            opacity: leftOpacity,
            backgroundColor: leftActions[0]?.bgColor || 'hsl(var(--success))'
          }}
        >
          <motion.div 
            className="flex items-center gap-2 text-white"
            style={{ scale: leftScale }}
          >
            {leftActions[0]?.icon}
            <span className="text-sm font-medium">{leftActions[0]?.label}</span>
          </motion.div>
        </motion.div>
      )}

      {/* Right actions background */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end px-4 rounded-r-xl"
          style={{ 
            opacity: rightOpacity,
            backgroundColor: rightActions[0]?.bgColor || 'hsl(var(--destructive))'
          }}
        >
          <motion.div 
            className="flex items-center gap-2 text-white"
            style={{ scale: rightScale }}
          >
            <span className="text-sm font-medium">{rightActions[0]?.label}</span>
            {rightActions[0]?.icon}
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "relative bg-card rounded-xl cursor-grab active:cursor-grabbing touch-pan-y",
          isDragging && "z-10"
        )}
        whileTap={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Pre-configured actions
export const SwipeActions = {
  complete: (onAction: () => void): SwipeAction => ({
    icon: <Check className="h-5 w-5" />,
    label: 'Concluir',
    color: 'text-white',
    bgColor: 'hsl(var(--success))',
    onAction
  }),
  delete: (onAction: () => void): SwipeAction => ({
    icon: <Trash2 className="h-5 w-5" />,
    label: 'Excluir',
    color: 'text-white',
    bgColor: 'hsl(var(--destructive))',
    onAction
  }),
  archive: (onAction: () => void): SwipeAction => ({
    icon: <Archive className="h-5 w-5" />,
    label: 'Arquivar',
    color: 'text-white',
    bgColor: 'hsl(var(--warning))',
    onAction
  }),
  more: (onAction: () => void): SwipeAction => ({
    icon: <MoreHorizontal className="h-5 w-5" />,
    label: 'Mais',
    color: 'text-white',
    bgColor: 'hsl(var(--muted))',
    onAction
  })
};
