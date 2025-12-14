import { AlertTriangle, Clock, UserX, Target, Bell, X, Mail, Loader2 } from "lucide-react";
import { useAlerts, Alert, AlertType } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const alertIcons: Record<AlertType, typeof AlertTriangle> = {
  stagnant_deal: Clock,
  inactive_client: UserX,
  at_risk_goal: Target,
};

const alertLabels: Record<AlertType, string> = {
  stagnant_deal: "Deal Parado",
  inactive_client: "Cliente Inativo",
  at_risk_goal: "Meta em Risco",
};

interface AlertItemProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

const AlertItem = ({ alert, onDismiss }: AlertItemProps) => {
  const Icon = alertIcons[alert.type];
  const isCritical = alert.severity === "critical";

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all duration-300 hover-lift cursor-pointer group animate-fade-in",
        isCritical
          ? "bg-destructive/10 border-destructive/30 hover:border-destructive/50 hover:shadow-md hover:shadow-destructive/10"
          : "bg-warning/10 border-warning/30 hover:border-warning/50 hover:shadow-md hover:shadow-warning/10"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2 rounded-lg transition-all duration-200 group-hover:scale-110 group-hover:shadow-md",
            isCritical ? "bg-destructive/20" : "bg-warning/20"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 transition-transform",
              isCritical ? "text-destructive group-hover:animate-pulse" : "text-warning"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full shadow-sm transition-all duration-200",
                isCritical
                  ? "bg-destructive/20 text-destructive border border-destructive/30"
                  : "bg-warning/20 text-warning border border-warning/30"
              )}
            >
              {alertLabels[alert.type]}
            </span>
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-muted-foreground hover:text-foreground transition-all duration-200 p-1.5 rounded-md hover:bg-muted/50 hover:scale-110"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-sm font-medium mt-1.5 font-display group-hover:text-foreground transition-colors">{alert.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {alert.description}
          </p>
          {alert.daysStagnant && (
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 bg-muted/30 rounded-md px-2 py-1 w-fit border border-border/20">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-medium">{alert.daysStagnant} dias</span>
              </span>
              {alert.amount && (
                <span className="font-display font-bold gradient-text">
                  R$ {alert.amount.toLocaleString("pt-BR")}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const AlertsPanel = () => {
  const { data: alerts, isLoading } = useAlerts();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleSendNotifications = async () => {
    const email = prompt("Digite o email para receber os alertas críticos:");
    if (!email) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-alert-notifications", {
        body: { recipientEmail: email },
      });

      if (error) throw error;

      if (data.alertsSent === 0) {
        toast.info("Nenhum alerta crítico para enviar");
      } else {
        toast.success(`${data.alertsSent} alerta(s) crítico(s) enviado(s) para ${email}`);
      }
    } catch (error: any) {
      console.error("Error sending notifications:", error);
      toast.error("Erro ao enviar notificações: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const visibleAlerts = alerts?.filter((a) => !dismissedIds.has(a.id)) || [];
  const criticalCount = visibleAlerts.filter(
    (a) => a.severity === "critical"
  ).length;
  const warningCount = visibleAlerts.filter(
    (a) => a.severity === "warning"
  ).length;

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-10 w-10 rounded-lg animate-shimmer" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-24 animate-shimmer" style={{ animationDelay: '50ms' }} />
            <Skeleton className="h-3 w-16 animate-shimmer" style={{ animationDelay: '100ms' }} />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-20 rounded-lg animate-shimmer" 
              style={{ animationDelay: `${150 + i * 75}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-warning/30 to-warning/10 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg">
            <Bell className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display gradient-text">Alertas</h3>
            <p className="text-xs text-muted-foreground">
              {visibleAlerts.length} pendentes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendNotifications}
            disabled={isSending || criticalCount === 0}
            className="h-8 text-xs hover:border-primary/50 hover:bg-primary/10 hover:scale-105 transition-all duration-200"
          >
            {isSending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <Mail className="h-3 w-3 mr-1.5" />
            )}
            Notificar
          </Button>
          {criticalCount > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/20 text-destructive border border-destructive/30 shadow-sm animate-heartbeat">
              {criticalCount} críticos
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/20 text-warning border border-warning/30 shadow-sm">
              {warningCount} atenção
            </span>
          )}
        </div>
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground glass rounded-lg border border-dashed border-border/50">
          <div className="p-4 rounded-full bg-gradient-to-br from-status-success/20 to-status-success/5 w-fit mx-auto mb-3 shadow-inner">
            <Bell className="h-8 w-8 opacity-50 text-status-success" />
          </div>
          <p className="text-sm font-display font-medium gradient-text">Nenhum alerta no momento</p>
          <p className="text-xs mt-1">Tudo está sob controle! 🎉</p>
        </div>
      ) : (
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-3">
            {visibleAlerts.slice(0, 10).map((alert, index) => (
              <div key={alert.id} style={{ animationDelay: `${index * 75}ms` }}>
                <AlertItem alert={alert} onDismiss={handleDismiss} />
              </div>
            ))}
          </div>
          {visibleAlerts.length > 10 && (
            <p className="text-xs text-muted-foreground text-center mt-3 py-2 bg-muted/30 rounded-lg border border-border/30 shadow-inner">
              +{visibleAlerts.length - 10} alertas adicionais
            </p>
          )}
        </ScrollArea>
      )}
    </div>
  );
};
