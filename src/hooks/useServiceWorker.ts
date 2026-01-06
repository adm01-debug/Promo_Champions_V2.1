import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    registration: null,
  });

  const register = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        setState(prev => ({ ...prev, isUpdating: true }));
        
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('[SW] New version available');
            }
          });
        }
      });

      console.log('[SW] Registered successfully');
    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  }, [state.isSupported]);

  const unregister = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.unregister();
      setState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
      }));
      console.log('[SW] Unregistered successfully');
    } catch (error) {
      console.error('[SW] Unregistration failed:', error);
    }
  }, [state.registration]);

  const update = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.update();
      console.log('[SW] Update check complete');
    } catch (error) {
      console.error('[SW] Update check failed:', error);
    }
  }, [state.registration]);

  const skipWaiting = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [state.registration]);

  useEffect(() => {
    // Auto-register in production
    if (import.meta.env.PROD && state.isSupported) {
      register();
    }
  }, [register, state.isSupported]);

  return {
    ...state,
    register,
    unregister,
    update,
    skipWaiting,
  };
}
