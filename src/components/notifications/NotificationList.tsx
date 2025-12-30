import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Settings, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  User,
  MessageSquare,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

type NotificationType = 'deal' | 'task' | 'message' | 'alert' | 'goal' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

const typeConfig = {
  deal: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  task: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
  message: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
  alert: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  goal: { icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  system: { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted' },
};

interface NotificationItemProps {
  notification: Notification;
  onRead?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
}

export const NotificationItem: FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDismiss,
  onClick,
}) => {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        !notification.isRead && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
        <Icon size={16} className={config.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm',
            !notification.isRead && 'font-medium'
          )}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
        </p>
      </div>

      <div className="flex gap-1 shrink-0">
        {!notification.isRead && onRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onRead(); }}
          >
            <Check size={12} />
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          >
            <X size={12} />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notification: Notification) => void;
  onDismiss?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  maxHeight?: number;
  className?: string;
}

export const NotificationList: FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onDismiss,
  onMarkAllRead,
  maxHeight = 400,
  className,
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bell size={18} />
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Badge variant="default" className="h-5 min-w-[20px] px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <ScrollArea style={{ maxHeight }}>
        <div className="p-2">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick?.(notification)}
                  onRead={() => onMarkAsRead?.(notification)}
                  onDismiss={() => onDismiss?.(notification)}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center text-muted-foreground"
              >
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};
