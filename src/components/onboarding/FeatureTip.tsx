import { FC, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureTipProps {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top' | 'bottom' | 'inline';
  dismissable?: boolean;
  showOnce?: boolean;
  delay?: number;
  className?: string;
}

export const FeatureTip: FC<FeatureTipProps> = ({
  id,
  title,
  description,
  icon: Icon = Lightbulb,
  action,
  position = 'inline',
  dismissable = true,
  showOnce = true,
  delay = 0,
  className
}) => {
  const storageKey = `feature-tip-${id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showOnce) {
        const dismissed = localStorage.getItem(storageKey);
        if (!dismissed) {
          setVisible(true);
        }
      } else {
        setVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, showOnce, storageKey]);

  const handleDismiss = () => {
    setVisible(false);
    if (showOnce) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  const positionClasses = {
    top: 'fixed top-20 left-1/2 -translate-x-1/2 z-50',
    bottom: 'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
    inline: ''
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20, scale: 0.95 }}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border bg-card shadow-lg max-w-md',
            'border-primary/20 bg-primary/5',
            positionClasses[position],
            className
          )}
        >
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>

            {action && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 mt-2 text-primary"
                onClick={() => {
                  action.onClick();
                  handleDismiss();
                }}
              >
                {action.label}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {dismissable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for programmatic feature tips
interface FeatureTipConfig {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useFeatureTips = () => {
  const [tips, setTips] = useState<FeatureTipConfig[]>([]);

  const showTip = (config: FeatureTipConfig) => {
    const storageKey = `feature-tip-${config.id}`;
    const dismissed = localStorage.getItem(storageKey);
    
    if (!dismissed) {
      setTips(prev => [...prev, config]);
    }
  };

  const dismissTip = (id: string) => {
    localStorage.setItem(`feature-tip-${id}`, 'true');
    setTips(prev => prev.filter(t => t.id !== id));
  };

  const dismissAll = () => {
    tips.forEach(tip => {
      localStorage.setItem(`feature-tip-${tip.id}`, 'true');
    });
    setTips([]);
  };

  const resetTip = (id: string) => {
    localStorage.removeItem(`feature-tip-${id}`);
  };

  const resetAllTips = () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('feature-tip-'))
      .forEach(key => localStorage.removeItem(key));
  };

  return {
    tips,
    showTip,
    dismissTip,
    dismissAll,
    resetTip,
    resetAllTips
  };
};
