import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Archive,
  TrendingUp, Target, Trophy, Shield, Settings, Users,
  Sparkles, FileCheck, AlertCircle, History, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
  const isSaleAlert = n.type === 'sale_alert' || n.metadata?.is_competition_alert;

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
        
        {isSaleAlert && n.metadata && (
          <div className="mt-2 grid grid-cols-2 gap-2 p-2 rounded bg-black/20 border border-white/5">
             <div className="text-center">
                <p className="text-[8px] text-muted-foreground uppercase font-bold">Vendedor Rank</p>
                <p className="text-xs font-black text-primary">#{String(n.metadata.seller_rank || '0')}</p>
             </div>
             <div className="text-center border-l border-white/10">
                <p className="text-[8px] text-muted-foreground uppercase font-bold">Seu Rank</p>
                <p className="text-xs font-black text-foreground">#{String(n.metadata.recipient_rank || '0')}</p>
             </div>
          </div>
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
  const [filter, setFilter] = useState<"all" | "unread" | "ranking" | "sales">("all");
  const { data: notifications = [], isLoading } = useNotifications({ limit: 100 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const archive = useArchiveNotification();
  const remove = useDeleteNotification();

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read_at);
    if (filter === "ranking") return notifications.filter((n) => n.category === 'gamification');
    if (filter === "sales") return notifications.filter((n) => n.category === 'sales' || n.type === 'sale_alert');
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleClick = (n: AppNotification) => {
    if (!n.read_at) markRead.mutate(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <Bell className="h-4 w-4 text-primary" />
            Alertas de Performance
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
             {unreadCount > 0 && (
               <Button
                 size="icon" variant="ghost" className="h-8 w-8"
                 onClick={() => markAllRead.mutate()}
                 disabled={markAllRead.isPending}
                 title="Marcar todas como lidas"
               >
                 <CheckCheck className="h-4 w-4" />
               </Button>
             )}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Filter className="h-4 w-4" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass">
                   <DropdownMenuLabel className="text-[10px] uppercase font-bold">Filtrar por</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => setFilter("all")} className={cn(filter === "all" && "bg-primary/10 text-primary")}>
                      Todas
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilter("unread")} className={cn(filter === "unread" && "bg-primary/10 text-primary")}>
                      Não lidas
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilter("sales")} className={cn(filter === "sales" && "bg-primary/10 text-primary")}>
                      <TrendingUp className="h-3.5 w-3.5 mr-2" /> Vendas
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilter("ranking")} className={cn(filter === "ranking" && "bg-primary/10 text-primary")}>
                      <Trophy className="h-3.5 w-3.5 mr-2" /> Ranking
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
              <BellOff className="h-10 w-10 mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">Silêncio no HUD</p>
              <p className="text-[10px] mt-1 uppercase">Novos alertas aparecerão em tempo real</p>
            </div>
          ) : (
            <div className="space-y-3">
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
        {notifications.some((n) => n.priority === "critical" && !n.read_at) && (
          <div className="border-t border-destructive/20 px-4 py-2 bg-destructive/10 flex items-center gap-2 text-[10px] font-black uppercase text-destructive animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            ALERTA CRÍTICO: RESPOSTA IMEDIATA REQUERIDA
          </div>
        )}
      </CardContent>
    </Card>
  );
}
