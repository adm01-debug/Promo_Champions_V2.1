import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'default',
    serviceWorkerRegistration: null
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      if (import.meta.env.DEV) {
        console.info('Service Worker registered:', registration);
      }
      return registration;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Service Worker registration failed:', error);
      }
      return null;
    }
  }, []);

  // Get VAPID public key from backend
  const getVapidKey = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('push-subscribe', {
        body: { action: 'get-vapid-key' }
      });

      if (error) throw error;
      return data.vapidPublicKey;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to get VAPID key:', error);
      }
      return null;
    }
  }, []);

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = useCallback((base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para receber notificações');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission !== 'granted') {
        toast.error('Permissão para notificações negada');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Get or register service worker
      let registration = state.serviceWorkerRegistration;
      if (!registration) {
        registration = await registerServiceWorker();
        if (!registration) {
          throw new Error('Failed to register service worker');
        }
        setState(prev => ({ ...prev, serviceWorkerRegistration: registration }));
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get VAPID key
      const vapidKey = await getVapidKey();
      if (!vapidKey) {
        // If no VAPID key, fall back to browser notifications only
        toast.success('Notificações do navegador ativadas');
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
        return true;
      }

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      // Save subscription to backend
      const { error } = await supabase.functions.invoke('push-subscribe', {
        body: {
          action: 'subscribe',
          user_id: user.id,
          subscription: subscription.toJSON()
        }
      });

      if (error) throw error;

      toast.success('Notificações push ativadas!');
      setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Push subscription failed:', error);
      }
      // Fall back to browser notifications
      if (Notification.permission === 'granted') {
        toast.success('Notificações do navegador ativadas');
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
        return true;
      }
      toast.error('Erro ao ativar notificações');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user?.id, state.serviceWorkerRegistration, registerServiceWorker, getVapidKey, urlBase64ToUint8Array]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (state.serviceWorkerRegistration) {
        const subscription = await state.serviceWorkerRegistration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Remove from backend
      await supabase.functions.invoke('push-subscribe', {
        body: {
          action: 'unsubscribe',
          user_id: user.id
        }
      });

      toast.success('Notificações desativadas');
      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Push unsubscribe failed:', error);
      }
      toast.error('Erro ao desativar notificações');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user?.id, state.serviceWorkerRegistration]);

  // Send test notification
  const sendTestNotification = useCallback(() => {
    if (state.permission !== 'granted') {
      toast.error('Permita as notificações primeiro');
      return;
    }

    // Use browser notification API for test
    new Notification('Teste de Notificação Push 🔔', {
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      icon: '/favicon.ico',
      tag: 'test-push'
    });
    
    toast.success('Notificação de teste enviada!');
  }, [state.permission]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const isSupported = checkSupport();
      
      if (!isSupported) {
        setState(prev => ({ 
          ...prev, 
          isSupported: false, 
          isLoading: false 
        }));
        return;
      }

      const permission = Notification.permission;
      let registration: ServiceWorkerRegistration | null = null;
      let isSubscribed = false;

      // Check for existing service worker
      if ('serviceWorker' in navigator) {
        try {
          registration = (await navigator.serviceWorker.getRegistration('/')) ?? null;
          
          if (registration && permission === 'granted') {
            const subscription = await registration.pushManager.getSubscription();
            isSubscribed = !!subscription;
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error checking subscription:', error);
          }
        }
      }

      setState({
        isSupported: true,
        isSubscribed: isSubscribed || permission === 'granted',
        isLoading: false,
        permission,
        serviceWorkerRegistration: registration
      });
    };

    init();
  }, [checkSupport]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
}
