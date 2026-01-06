import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartNotification } from './SmartNotification';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'milestone';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxVisible?: number;
  className?: string;
}

export const NotificationCenter: FC<NotificationCenterProps> = ({
  notifications,
  onDismiss,
  position = 'top-right',
  maxVisible = 5,
  className
}) => {
  const visibleNotifications = notifications.slice(0, maxVisible);
  const hiddenCount = Math.max(0, notifications.length - maxVisible);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2'
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 w-full max-w-md pointer-events-none",
        positionClasses[position],
        className
      )}
    >
      <AnimatePresence mode="sync">
        {visibleNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
            animate={{ 
              opacity: 1 - (index * 0.1), 
              x: 0, 
              scale: 1 - (index * 0.02),
              y: index * 4
            }}
            exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
            className="pointer-events-auto"
            style={{ zIndex: maxVisible - index }}
          >
            <SmartNotification
              {...notification}
              show={true}
              onClose={() => onDismiss(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hidden count badge */}
      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-auto self-end bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full"
        >
          +{hiddenCount} mais
        </motion.div>
      )}
    </div>
  );
};

// Hook para gerenciar notificações
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll
  };
};
