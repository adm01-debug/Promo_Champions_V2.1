import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
}

interface NetworkConnection {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
  }
}

const getConnection = (): NetworkConnection | null => {
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

const getNetworkInfo = (): Partial<NetworkStatus> => {
  const connection = getConnection();
  
  if (!connection) {
    return {
      connectionType: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
      saveData: false,
    };
  }

  return {
    connectionType: connection.type || null,
    effectiveType: connection.effectiveType || null,
    downlink: connection.downlink || null,
    rtt: connection.rtt || null,
    saveData: connection.saveData || false,
  };
};

const isSlowNetwork = (effectiveType: string | null): boolean => {
  return effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
};

export function useNetworkStatus(options: {
  showToasts?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
} = {}) {
  const { showToasts = true, onOnline, onOffline } = options;
  
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const networkInfo = getNetworkInfo();
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSlowConnection: isSlowNetwork(networkInfo.effectiveType || null),
      connectionType: networkInfo.connectionType || null,
      effectiveType: networkInfo.effectiveType || null,
      downlink: networkInfo.downlink || null,
      rtt: networkInfo.rtt || null,
      saveData: networkInfo.saveData || false,
      lastOnlineAt: null,
      lastOfflineAt: null,
    };
  });

  const updateNetworkStatus = useCallback(() => {
    const networkInfo = getNetworkInfo();
    const isOnline = navigator.onLine;
    
    setStatus(prev => ({
      ...prev,
      isOnline,
      isSlowConnection: isSlowNetwork(networkInfo.effectiveType || null),
      connectionType: networkInfo.connectionType || null,
      effectiveType: networkInfo.effectiveType || null,
      downlink: networkInfo.downlink || null,
      rtt: networkInfo.rtt || null,
      saveData: networkInfo.saveData || false,
    }));
  }, []);

  const handleOnline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: true,
      lastOnlineAt: new Date(),
    }));
    
    if (showToasts) {
      toast.success('Conexão restaurada', {
        description: 'Você está online novamente.',
        duration: 3000,
      });
    }
    
    onOnline?.();
    updateNetworkStatus();
  }, [showToasts, onOnline, updateNetworkStatus]);

  const handleOffline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: false,
      lastOfflineAt: new Date(),
    }));
    
    if (showToasts) {
      toast.error('Sem conexão', {
        description: 'Você está offline. Algumas funcionalidades podem não funcionar.',
        duration: 5000,
      });
    }
    
    onOffline?.();
  }, [showToasts, onOffline]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connection = getConnection();
    if (connection?.addEventListener) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection?.removeEventListener) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [handleOnline, handleOffline, updateNetworkStatus]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    ...status,
    checkConnection,
    refresh: updateNetworkStatus,
  };
}

// Provider component for global network status
export { useNetworkStatus as default };
