import React, { memo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/lib/haptics';

interface OfflineIndicatorProps {
  className?: string;
  showOnlineMessage?: boolean;
}

export const OfflineIndicator = memo(({ 
  className,
  showOnlineMessage = true 
}: OfflineIndicatorProps) => {
  const { isOnline } = usePWA();
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && showOnlineMessage) {
      setShowOnlineNotification(true);
      const timer = setTimeout(() => {
        setShowOnlineNotification(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, showOnlineMessage]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[100]",
            "bg-rank-gold text-rank-gold-foreground",
            "px-4 py-2 text-center",
            className
          )}
        >
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
          </div>
        </motion.div>
      )}

      {showOnlineNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[100]",
            "bg-success text-primary-foreground",
            "px-4 py-2 text-center",
            className
          )}
        >
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Wifi className="h-4 w-4" />
            <span>Conexão restaurada!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

OfflineIndicator.displayName = "OfflineIndicator";
