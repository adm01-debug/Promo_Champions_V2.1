import { FC, ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== Pull to Refresh ====================
interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh: FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const haptic = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  const refreshIconRotate = useTransform(y, [0, threshold], [0, 360]);
  const refreshIconScale = useTransform(y, [0, threshold / 2, threshold], [0.5, 1, 1.2]);
  const refreshIconOpacity = useTransform(y, [0, threshold / 2], [0, 1]);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    const progress = Math.min(info.offset.y / threshold, 1);
    setPullProgress(progress);
    
    if (progress >= 1 && pullProgress < 1) {
      haptic.medium();
    }
  }, [disabled, isRefreshing, threshold, pullProgress, haptic]);

  const handleDragEnd = useCallback(async (_: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;

    if (info.offset.y >= threshold) {
      setIsRefreshing(true);
      haptic.success();
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
      }
    } else {
      setPullProgress(0);
    }
  }, [disabled, isRefreshing, threshold, onRefresh, haptic]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{
          top: useTransform(y, [0, threshold], [-40, 20]),
          opacity: refreshIconOpacity,
        }}
      >
        {isRefreshing ? (
          <div className="p-2 rounded-full bg-primary/10 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : (
          <motion.div 
            className="p-2 rounded-full bg-primary/10 backdrop-blur-sm"
            style={{ 
              rotate: refreshIconRotate,
              scale: refreshIconScale,
            }}
          >
            <RefreshCw className="h-6 w-6 text-primary" />
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        drag={!isRefreshing ? "y" : false}
        dragConstraints={{ top: 0, bottom: threshold }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-pan-x"
      >
        {children}
      </motion.div>
    </div>
  );
};

// ==================== Swipe to Dismiss ====================
interface SwipeToDismissProps {
  children: ReactNode;
  onDismiss: () => void;
  direction?: 'left' | 'right' | 'both';
  threshold?: number;
  className?: string;
}

export const SwipeToDismiss: FC<SwipeToDismissProps> = ({
  children,
  onDismiss,
  direction = 'right',
  threshold = 100,
  className,
}) => {
  const haptic = useHapticFeedback();
  const x = useMotionValue(0);

  const opacity = useTransform(
    x,
    [-threshold, 0, threshold],
    [0.5, 1, 0.5]
  );

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const shouldDismiss = 
      (direction === 'right' && info.offset.x > threshold) ||
      (direction === 'left' && info.offset.x < -threshold) ||
      (direction === 'both' && Math.abs(info.offset.x) > threshold);

    if (shouldDismiss) {
      haptic.medium();
      onDismiss();
    }
  }, [direction, threshold, onDismiss, haptic]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ 
        left: direction === 'right' ? 0 : -150, 
        right: direction === 'left' ? 0 : 150 
      }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      className={cn("touch-pan-y", className)}
    >
      {children}
    </motion.div>
  );
};

// ==================== Long Press ====================
interface LongPressProps {
  children: ReactNode;
  onLongPress: () => void;
  duration?: number;
  className?: string;
}

export const LongPress: FC<LongPressProps> = ({
  children,
  onLongPress,
  duration = 500,
  className,
}) => {
  const haptic = useHapticFeedback();
  const timerRef = useRef<NodeJS.Timeout>();
  const [isPressed, setIsPressed] = useState(false);

  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      haptic.heavy();
      onLongPress();
    }, duration);
  }, [duration, onLongPress, haptic]);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={cn("touch-none select-none", className)}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
};

// ==================== Swipeable List Item ====================
interface SwipeableListItemProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export const SwipeableListItem: FC<SwipeableListItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = "Concluir",
  rightLabel = "Excluir",
  leftColor = "hsl(var(--success))",
  rightColor = "hsl(var(--destructive))",
  leftIcon,
  rightIcon,
  className,
}) => {
  const haptic = useHapticFeedback();
  const x = useMotionValue(0);
  const threshold = 100;

  const leftOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.x > threshold && onSwipeRight) {
      haptic.success();
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      haptic.warning();
      onSwipeLeft();
    }
  }, [threshold, onSwipeLeft, onSwipeRight, haptic]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Left action background */}
      {onSwipeRight && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center px-4"
          style={{ opacity: leftOpacity, backgroundColor: leftColor }}
        >
          <div className="flex items-center gap-2 text-white">
            {leftIcon}
            <span className="text-sm font-medium">{leftLabel}</span>
          </div>
        </motion.div>
      )}

      {/* Right action background */}
      {onSwipeLeft && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end px-4"
          style={{ opacity: rightOpacity, backgroundColor: rightColor }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">{rightLabel}</span>
            {rightIcon}
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-card rounded-lg cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
};
