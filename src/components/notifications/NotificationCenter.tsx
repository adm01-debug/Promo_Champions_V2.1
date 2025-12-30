import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Filter,
  Search,
  Trash2,
  Trophy,
  Zap,
  Target,
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  X,
  Flame,
  Star,
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNotifications, NotificationType, Notification } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

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

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  achievement: "from-rank-gold/20 to-rank-gold/5 border-rank-gold/30",
  xp_gain: "from-xp/20 to-xp/5 border-xp/30",
  level_up: "from-primary/20 to-primary/5 border-primary/30",
  streak: "from-streak/20 to-streak/5 border-streak/30",
  goal_complete: "from-success/20 to-success/5 border-success/30",
  goal_warning: "from-warning/20 to-warning/5 border-warning/30",
  task_reminder: "from-info/20 to-info/5 border-info/30",
  team_update: "from-secondary/30 to-secondary/10 border-secondary/30",
  performance: "from-primary/20 to-primary/5 border-primary/30",
  system: "from-muted/50 to-muted/20 border-muted/50",
};

const TYPE_LABELS: Record<NotificationType, string> = {
  achievement: "Conquistas",
  xp_gain: "XP",
  level_up: "Nível",
  streak: "Streak",
  goal_complete: "Metas",
  goal_warning: "Alertas",
  task_reminder: "Tarefas",
  team_update: "Equipe",
  performance: "Performance",
  system: "Sistema",
};

function formatNotificationDate(date: Date): string {
  if (isToday(date)) {
    return `Hoje às ${format(date, "HH:mm")}`;
  }
  if (isYesterday(date)) {
    return `Ontem às ${format(date, "HH:mm")}`;
  }
  return format(date, "dd 'de' MMM 'às' HH:mm", { locale: ptBR });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-200",
        "bg-gradient-to-br",
        NOTIFICATION_COLORS[notification.type],
        !notification.read && "ring-1 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
          "bg-background/50"
        )}>
          {NOTIFICATION_ICONS[notification.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={cn(
                "text-sm font-medium",
                !notification.read && "font-semibold"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {notification.message}
              </p>
            </div>

            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatNotificationDate(notification.createdAt)}
            </span>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1"
                >
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(notification.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationCenter() {
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Tab filter
    if (activeTab === "unread") {
      filtered = filtered.filter((n) => !n.read);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate: Date;
      switch (dateFilter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = subDays(now, 7);
          break;
        case "month":
          startDate = subDays(now, 30);
          break;
        default:
          startDate = new Date(0);
      }
      filtered = filtered.filter((n) => n.createdAt >= startDate);
    }

    return filtered;
  }, [notifications, activeTab, typeFilter, searchQuery, dateFilter]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { label: string; notifications: Notification[] }[] = [];
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const thisWeek: Notification[] = [];
    const older: Notification[] = [];

    filteredNotifications.forEach((n) => {
      if (isToday(n.createdAt)) {
        today.push(n);
      } else if (isYesterday(n.createdAt)) {
        yesterday.push(n);
      } else if (n.createdAt >= subDays(new Date(), 7)) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    if (today.length > 0) groups.push({ label: "Hoje", notifications: today });
    if (yesterday.length > 0) groups.push({ label: "Ontem", notifications: yesterday });
    if (thisWeek.length > 0) groups.push({ label: "Esta Semana", notifications: thisWeek });
    if (older.length > 0) groups.push({ label: "Anteriores", notifications: older });

    return groups;
  }, [filteredNotifications]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Central de Notificações</CardTitle>
              <p className="text-sm text-muted-foreground">
                {notifications.length} notificações • {unreadCount} não lidas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notificações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as NotificationType | "all")}>
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {NOTIFICATION_ICONS[key as NotificationType]}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={(v: "all" | "today" | "week" | "month") => setDateFilter(v)}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="gap-2">
              <Bell className="h-4 w-4" />
              Todas
              <Badge variant="secondary" className="ml-1">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              <BellOff className="h-4 w-4" />
              Não lidas
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[500px] pr-4">
              {groupedNotifications.length > 0 ? (
                <div className="space-y-6">
                  {groupedNotifications.map((group) => (
                    <div key={group.label}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {group.label}
                      </h3>
                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {group.notifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkAsRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma notificação</p>
                  <p className="text-sm">
                    {searchQuery || typeFilter !== "all"
                      ? "Tente ajustar os filtros"
                      : "Você está em dia com tudo!"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
