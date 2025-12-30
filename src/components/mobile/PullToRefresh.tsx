import { FC, ReactNode, useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

type RefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing';

export const PullToRefresh: FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false
}) => {
  const [state, setState] = useState<RefreshState>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  // Transforms
  const indicatorOpacity = useTransform(y, [0, threshold / 2], [0, 1]);
  const indicatorScale = useTransform(y, [0, threshold], [0.5, 1]);
  const indicatorRotation = useTransform(y, [0, threshold], [0, 180]);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only allow pull when at top of scroll
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    if (info.offset.y > threshold) {
      setState('ready');
    } else if (info.offset.y > 0) {
      setState('pulling');
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (state === 'ready') {
      setState('refreshing');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }

      try {
        await onRefresh();
      } finally {
        setState('idle');
      }
    } else {
      setState('idle');
    }
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
        style={{ opacity: indicatorOpacity }}
      >
        <motion.div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            state === 'refreshing' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}
          style={{ scale: indicatorScale }}
        >
          {state === 'refreshing' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Atualizando...</span>
            </>
          ) : (
            <>
              <motion.div style={{ rotate: indicatorRotation }}>
                <RefreshCw className="h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium">
                {state === 'ready' ? 'Solte para atualizar' : 'Puxe para atualizar'}
              </span>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: state === 'refreshing' ? threshold : y }}
        className="min-h-full"
        animate={state === 'refreshing' ? { y: threshold } : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Hook for programmatic refresh
export const usePullToRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async (refreshFn: () => Promise<void>) => {
    setIsRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, refresh };
};
