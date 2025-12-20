import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Check,
  CheckCheck,
  Trophy,
  Zap,
  Target,
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Flame,
  Star,
  ArrowRight,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNotifications, NotificationType, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  achievement: <Trophy className="h-4 w-4 text-rank-gold" />,
  xp_gain: <Zap className="h-4 w-4 text-xp" />,
  level_up: <Star className="h-4 w-4 text-primary" />,
  streak: <Flame className="h-4 w-4 text-streak" />,
  goal_complete: <Target className="h-4 w-4 text-success" />,
  goal_warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  task_reminder: <Calendar className="h-4 w-4 text-info" />,
  team_update: <Users className="h-4 w-4 text-secondary-foreground" />,
  performance: <TrendingUp className="h-4 w-4 text-primary" />,
  system: <Bell className="h-4 w-4 text-muted-foreground" />,
};

function formatTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Ontem";
  }
  return format(date, "dd/MM", { locale: ptBR });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        "hover:bg-muted/50",
        !notification.read && "bg-primary/5"
      )}
      onClick={() => {
        onMarkAsRead(notification.id);
      }}
    >
      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0 border">
        {NOTIFICATION_ICONS[notification.type]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-sm truncate",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {formatTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {notification.message}
        </p>
      </div>

      {!notification.read && (
        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </motion.div>
  );
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Show only the most recent 5 notifications
  const recentNotifications = notifications.slice(0, 5);

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notificacoes");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notificações</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar lidas
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-80">
          {recentNotifications.length > 0 ? (
            <div className="p-2 space-y-1">
              <AnimatePresence mode="popLayout">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm"
              onClick={handleViewAll}
            >
              Ver todas as notificações
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
