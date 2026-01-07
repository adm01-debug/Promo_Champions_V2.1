import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useOfflineIndicator } from '@/hooks/useNetworkStatus';

export function OfflineIndicator() {
  const { showIndicator, online, slowConnection, message } = useOfflineIndicator();

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
            online
              ? 'bg-green-500 text-white'
              : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {online ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          {message}
        </motion.div>
      )}

      {slowConnection && online && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium bg-yellow-500 text-yellow-900"
        >
          <AlertTriangle className="h-3 w-3" />
          Conexão lenta detectada
        </motion.div>
      )}
    </AnimatePresence>
  );
}
