import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureAnnouncementProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'banner' | 'card' | 'toast';
  showOnce?: boolean;
  className?: string;
}

const STORAGE_KEY = 'salesarena-dismissed-announcements';

function getDismissedAnnouncements(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function dismissAnnouncement(id: string) {
  try {
    const dismissed = getDismissedAnnouncements();
    if (!dismissed.includes(id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, id]));
    }
  } catch {
    // Ignore storage errors
  }
}

export function FeatureAnnouncement({
  id,
  title,
  description,
  icon,
  actionLabel = 'Ver mais',
  onAction,
  variant = 'card',
  showOnce = true,
  className,
}: FeatureAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showOnce) {
      const dismissed = getDismissedAnnouncements();
      if (!dismissed.includes(id)) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, [id, showOnce]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (showOnce) {
      dismissAnnouncement(id);
    }
  };

  const handleAction = () => {
    onAction?.();
    handleDismiss();
  };

  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden',
              className
            )}
          >
            <div className="px-4 py-3 flex items-center justify-between gap-4 max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                {icon || <Sparkles className="h-5 w-5 flex-shrink-0" />}
                <div>
                  <span className="font-medium">{title}</span>
                  <span className="hidden sm:inline text-primary-foreground/80 ml-2">
                    {description}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onAction && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAction}
                    className="h-7 text-xs"
                  >
                    {actionLabel}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-primary-foreground/20 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'toast') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              'fixed bottom-4 right-4 z-50 max-w-sm bg-card border rounded-lg shadow-lg overflow-hidden',
              className
            )}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {icon || <Sparkles className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-muted rounded flex-shrink-0"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {onAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAction}
                  className="w-full mt-3 justify-between"
                >
                  {actionLabel}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Card variant
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'relative p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-transparent',
            className
          )}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {icon || <Sparkles className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
              {onAction && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleAction}
                  className="px-0 mt-2"
                >
                  {actionLabel}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
