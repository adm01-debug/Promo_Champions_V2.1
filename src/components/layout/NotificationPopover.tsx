import { forwardRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const NotificationPopover = forwardRef<HTMLDivElement>(function NotificationPopover(_props, _ref) {
  const { salesperson } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const { data: recentAlerts } = useQuery({
    queryKey: ["recent-notifications", salesperson?.id],
    queryFn: async () => {
      // Fetch recent login alerts
      const { data: loginAlerts } = await supabase
        .from("login_alerts")
        .select("id, alert_type, created_at, browser, location, acknowledged")
        .order("created_at", { ascending: false })
        .limit(5);

      return (loginAlerts || []).map(a => ({
        id: a.id,
        title: a.alert_type === "new_device" ? "Novo dispositivo detectado" : "Alerta de login",
        description: [a.browser, a.location].filter(Boolean).join(" · ") || "Detalhes indisponíveis",
        time: a.created_at,
        read: a.acknowledged ?? false,
      }));
    },
    enabled: !!salesperson?.id,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative glass h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="h-4 w-4" />
          <NotificationBadge count={unreadCount} size="sm" pulse className="absolute -top-1 -right-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-primary font-medium">{unreadCount} não lida{unreadCount > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {!recentAlerts || recentAlerts.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            recentAlerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "px-4 py-3 border-b border-border/30 last:border-0 transition-colors",
                  !alert.read && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  {!alert.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                  <div className={cn("flex-1 min-w-0", alert.read && "ml-5")}>
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(alert.time), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border/50">
          <Link
            to="/notificacoes"
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Ver todas
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
