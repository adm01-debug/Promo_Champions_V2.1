import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useState } from 'react';

interface OfflineBannerProps {
  onRetry?: () => Promise<void>;
  showRetryButton?: boolean;
}

export const OfflineBanner: FC<OfflineBannerProps> = ({
  onRetry,
  showRetryButton = true,
}) => {
  const { isOnline, isSlowConnection, effectiveType, checkConnection } = useNetworkStatus({ showToasts: false });
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const isConnected = await checkConnection();
      if (isConnected && onRetry) {
        await onRetry();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-destructive text-destructive-foreground"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                Você está offline. Algumas funcionalidades podem não funcionar.
              </span>
            </div>
            
            {showRetryButton && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-1.5">Reconectar</span>
              </Button>
            )}
          </div>
        </motion.div>
      )}
      
      {isOnline && isSlowConnection && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-warning text-warning-foreground"
        >
          <div className="container mx-auto px-4 py-2 flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">
              Conexão lenta detectada ({effectiveType}). Carregamentos podem demorar mais.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const NetworkStatusIndicator: FC = () => {
  const { isOnline, effectiveType } = useNetworkStatus({ showToasts: false });

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-online' : 'bg-offline'
        }`}
      />
      <span className="text-xs text-muted-foreground">
        {isOnline ? (effectiveType || 'Online') : 'Offline'}
      </span>
    </div>
  );
};
