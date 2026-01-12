import { useState, useCallback, useEffect, useRef } from 'react';

interface Notification {
  id: string;
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  data?: unknown;
  timestamp: number;
}

interface UseNotificationsReturn {
  permission: NotificationPermission | 'unsupported';
  isSupported: boolean;
  notifications: Notification[];
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions & { data?: unknown }) => Notification | null;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const notificationRefs = useRef<Map<string, globalThis.Notification>>(new Map());

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((
    title: string, 
    options?: NotificationOptions & { data?: unknown }
  ): Notification | null => {
    if (!isSupported || permission !== 'granted') return null;

    const id = crypto.randomUUID();
    const notification: Notification = {
      id,
      title,
      body: options?.body,
      icon: options?.icon,
      tag: options?.tag,
      data: options?.data,
      timestamp: Date.now(),
    };

    try {
      const nativeNotification = new window.Notification(title, {
        ...options,
        tag: options?.tag || id,
      });

      notificationRefs.current.set(id, nativeNotification);

      nativeNotification.onclick = () => {
        window.focus();
        nativeNotification.close();
      };

      nativeNotification.onclose = () => {
        notificationRefs.current.delete(id);
      };

      setNotifications(prev => [notification, ...prev].slice(0, 50));
      return notification;
    } catch {
      return null;
    }
  }, [isSupported, permission]);

  const clearNotifications = useCallback(() => {
    notificationRefs.current.forEach(n => n.close());
    notificationRefs.current.clear();
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    const notification = notificationRefs.current.get(id);
    if (notification) {
      notification.close();
      notificationRefs.current.delete(id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notificationRefs.current.forEach(n => n.close());
      notificationRefs.current.clear();
    };
  }, []);

  return {
    permission,
    isSupported,
    notifications,
    requestPermission,
    sendNotification,
    clearNotifications,
    removeNotification,
  };
};
