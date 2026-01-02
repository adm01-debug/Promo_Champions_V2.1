import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notif, id }]);

    if (notif.duration !== 0) {
      setTimeout(() => removeNotification(id), notif.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={cn(
            'p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]',
            notif.type === 'success' && 'bg-green-500 text-white',
            notif.type === 'error' && 'bg-red-500 text-white',
            notif.type === 'warning' && 'bg-yellow-500 text-white',
            notif.type === 'info' && 'bg-blue-500 text-white'
          )}
        >
          <span className="flex-1">{notif.message}</span>
          <button onClick={() => removeNotification(notif.id)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
