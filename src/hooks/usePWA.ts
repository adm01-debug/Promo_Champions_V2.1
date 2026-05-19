import { useState, useEffect, useCallback } from 'react';

interface BeforeInstEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installApp: () => Promise<boolean>;
  updateApp: () => void;
  checkForUpdates: () => void;
}

/**
 * usePWA - Hook for Progressive Web App functionality
 * Handles install prompts, updates, and online status
 */
export function usePWA(): UsePWAReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check display-mode for standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check iOS standalone
      const isIOSStandalone = 'standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstalled);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstalled);
    };
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInst = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstall' + 'prompt', handleBeforeInst);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstall' + 'prompt', handleBeforeInst);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Register service worker and check for updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((_error) => {
          // Failure handled silently in production to avoid user-facing logs
        });
    }
  }, []);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (_error) {
      return false;
    }
  }, [deferredPrompt]);

  // Update app (skip waiting and reload)
  const updateApp = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  // Check for updates
  const checkForUpdates = useCallback(() => {
    if (registration) {
      registration.update().catch((_error) => {
        // Update check failed silently
      });
    }
  }, [registration]);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installApp,
    updateApp,
    checkForUpdates,
  };
}
