import { FC, ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ContextualTooltipProps {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  delayMs?: number;
  actionLabel?: string;
  onAction?: () => void;
  highlight?: boolean;
  className?: string;
}

export const ContextualTooltip: FC<ContextualTooltipProps> = ({
  id,
  title,
  description,
  icon: Icon = Lightbulb,
  children,
  side = 'bottom',
  showOnce = true,
  delayMs = 500,
  actionLabel,
  onAction,
  highlight = false,
  className
}) => {
  const storageKey = `contextual-tip-${id}`;
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (showOnce) {
      const wasDismissed = localStorage.getItem(storageKey) === 'true';
      if (wasDismissed) {
        setDismissed(true);
        return;
      }
    }

    const timer = setTimeout(() => {
      setOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [showOnce, storageKey, delayMs]);

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
    if (showOnce) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  const handleAction = () => {
    onAction?.();
    handleDismiss();
  };

  if (dismissed) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <div className={cn('relative inline-block', className)}>
            {children}
            
            {/* Highlight pulse */}
            {highlight && open && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.5, 0.2, 0.5],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2" />
              </motion.div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent
          side={side}
          sideOffset={8}
          className="p-0 bg-transparent border-0 shadow-none max-w-xs"
        >
          <motion.div
            initial={{ opacity: 0, y: side === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === 'top' ? 10 : -10, scale: 0.95 }}
            className="relative bg-card border rounded-lg shadow-xl p-4"
          >
            {/* Arrow */}
            <div className={cn(
              'absolute w-3 h-3 bg-card border rotate-45',
              side === 'top' && 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-0 border-l-0',
              side === 'bottom' && 'top-[-6px] left-1/2 -translate-x-1/2 border-b-0 border-r-0',
              side === 'left' && 'right-[-6px] top-1/2 -translate-y-1/2 border-t-0 border-r-0',
              side === 'right' && 'left-[-6px] top-1/2 -translate-y-1/2 border-b-0 border-l-0'
            )} />

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 -mt-1 -mr-1"
                    onClick={handleDismiss}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>

                {actionLabel && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-2 text-primary text-xs"
                    onClick={handleAction}
                  >
                    {actionLabel}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Feature Spotlight - More prominent version
interface FeatureSpotlightProps {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  delay?: number;
}

export const FeatureSpotlight: FC<FeatureSpotlightProps> = ({
  id,
  title,
  description,
  icon: Icon = Lightbulb,
  children,
  position = 'bottom',
  showOnce = true,
  delay = 1000
}) => {
  const storageKey = `feature-spotlight-${id}`;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (showOnce) {
      const wasDismissed = localStorage.getItem(storageKey) === 'true';
      if (wasDismissed) return;
    }

    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [showOnce, storageKey, delay]);

  const handleDismiss = () => {
    setShow(false);
    if (showOnce) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3'
  };

  return (
    <div className="relative inline-block">
      {children}

      <AnimatePresence>
        {show && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
              onClick={handleDismiss}
            />

            {/* Highlight ring */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-0 z-50 rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background pointer-events-none"
            />

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                'absolute z-50 w-64 bg-card border rounded-xl shadow-2xl p-4',
                positionStyles[position]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {description}
                  </p>
                  <Button size="sm" onClick={handleDismiss}>
                    Entendi!
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
