import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Archive,
  TrendingUp, Target, Trophy, Shield, Settings, Users,
  Sparkles, FileCheck, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useArchiveNotification,
  useDeleteNotification,
  type AppNotification,
  type NotificationCategory,
  type NotificationPriority,
} from "@/hooks/useNotifications";

const CATEGORY_ICONS: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  general: Bell,
  sales: TrendingUp,
  goals: Target,
  gamification: Trophy,
  security: Shield,
  system: Settings,
  team: Users,
  ai: Sparkles,
  approval: FileCheck,
};

const PRIORITY_STYLES: Record<NotificationPriority, string> = {
  low: "border-l-muted",
  medium: "border-l-info",
  high: "border-l-warning",
  critical: "border-l-destructive",
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  general: "Geral",
  sales: "Vendas",
  goals: "Metas",
  gamification: "Gamificação",
  security: "Segurança",
  system: "Sistema",
  team: "Time",
  ai: "IA",
  approval: "Aprovação",
};

interface NotificationItemProps {
  notification: AppNotification;
  onClick: (n: AppNotification) => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification: n, onClick, onMarkRead, onArchive, onDelete }: NotificationItemProps) {
  const Icon = CATEGORY_ICONS[n.category] ?? Bell;
  const isUnread = !n.read_at;

  return (
    <div
      className={cn(
        "group relative flex gap-3 p-3 rounded-lg border-l-2 transition-colors cursor-pointer",
        PRIORITY_STYLES[n.priority],
        isUnread ? "bg-accent/40 hover:bg-accent/60" : "bg-card hover:bg-accent/30"
      )}
      onClick={() => onClick(n)}
    >
      <div className={cn(
        "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center",
        isUnread ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-tight", isUnread ? "font-semibold" : "font-medium")}>
            {n.title}
          </p>
          {isUnread && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />}
        </div>
        {n.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
            {CATEGORY_LABELS[n.category]}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <Button
            size="icon" variant="ghost" className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
            title="Marcar como lida"
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="icon" variant="ghost" className="h-6 w-6"
          onClick={(e) => { e.stopPropagation(); onArchive(n.id); }}
          title="Arquivar"
        >
          <Archive className="h-3 w-3" />
        </Button>
        <Button
          size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
          title="Excluir"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread" | NotificationCategory>("all");
  const { data: notifications = [], isLoading } = useNotifications({ limit: 100 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const archive = useArchiveNotification();
  const remove = useDeleteNotification();

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read_at);
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleClick = (n: AppNotification) => {
    if (!n.read_at) markRead.mutate(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Central de Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              size="sm" variant="ghost"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <div className="px-4 pb-3">
            <TabsList className="grid grid-cols-5 h-auto">
              <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Não lidas
                {unreadCount > 0 && <span className="ml-1 text-[10px]">({unreadCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="sales" className="text-xs">Vendas</TabsTrigger>
              <TabsTrigger value="goals" className="text-xs">Metas</TabsTrigger>
              <TabsTrigger value="security" className="text-xs">Segurança</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={filter} className="m-0">
            <ScrollArea className="h-[400px] px-4 pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  Carregando...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {filter === "unread" ? (
                    <>
                      <CheckCheck className="h-10 w-10 text-success mb-3" />
                      <p className="text-sm font-medium">Tudo em dia!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Nenhuma notificação não lida.
                      </p>
                    </>
                  ) : (
                    <>
                      <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">Nenhuma notificação</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você verá novidades aqui quando elas chegarem.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClick={handleClick}
                      onMarkRead={(id) => markRead.mutate(id)}
                      onArchive={(id) => archive.mutate(id)}
                      onDelete={(id) => remove.mutate(id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        {notifications.some((n) => n.priority === "critical" && !n.read_at) && (
          <div className="border-t px-4 py-2 bg-destructive/5 flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            Você tem notificações críticas pendentes
          </div>
        )}
      </CardContent>
    </Card>
  );
}
