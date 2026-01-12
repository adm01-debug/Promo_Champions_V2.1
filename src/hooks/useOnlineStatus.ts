import { useState, useEffect, useCallback } from 'react';

interface UseOnlineStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  pingUrl?: string;
  pingInterval?: number;
}

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
  checkConnection: () => Promise<boolean>;
}

export function useOnlineStatus(
  options: UseOnlineStatusOptions = {}
): UseOnlineStatusReturn {
  const { 
    onOnline, 
    onOffline, 
    pingUrl = '/api/health',
    pingInterval = 30000 
  } = options;

  const [isOnline, setIsOnline] = useState<boolean>(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(
    isOnline ? new Date() : null
  );

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Try to fetch a small resource to verify actual connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      // If fetch fails, fall back to navigator.onLine
      return navigator.onLine;
    }
  }, [pingUrl]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      onOnline?.();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      onOffline?.();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);

  // Periodic connectivity check
  useEffect(() => {
    if (pingInterval <= 0) return;

    const intervalId = setInterval(async () => {
      const online = await checkConnection();
      if (online !== isOnline) {
        setIsOnline(online);
        if (online) {
          setLastOnline(new Date());
          onOnline?.();
        } else {
          setWasOffline(true);
          onOffline?.();
        }
      }
    }, pingInterval);

    return () => clearInterval(intervalId);
  }, [checkConnection, isOnline, pingInterval, onOnline, onOffline]);

  return { isOnline, wasOffline, lastOnline, checkConnection };
}
