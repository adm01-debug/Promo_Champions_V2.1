import { AlertTriangle, Clock, UserX, Target, Bell, X } from "lucide-react";
import { useAlerts, Alert, AlertType } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        "p-3 rounded-lg border transition-all hover:scale-[1.01]",
        isCritical
          ? "bg-destructive/10 border-destructive/30"
          : "bg-warning/10 border-warning/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-1.5 rounded-md",
            isCritical ? "bg-destructive/20" : "bg-warning/20"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              isCritical ? "text-destructive" : "text-warning"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                isCritical
                  ? "bg-destructive/20 text-destructive"
                  : "bg-warning/20 text-warning"
              )}
            >
              {alertLabels[alert.type]}
            </span>
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-sm font-medium mt-1">{alert.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {alert.description}
          </p>
          {alert.daysStagnant && (
            <p className="text-xs text-muted-foreground mt-1">
              ⏱ {alert.daysStagnant} dias
              {alert.amount && (
                <span className="ml-2">
                  • R$ {alert.amount.toLocaleString("pt-BR")}
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

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
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
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-warning/20">
            <Bell className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Alertas</h3>
            <p className="text-xs text-muted-foreground">
              {visibleAlerts.length} pendentes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-destructive/20 text-destructive">
              {criticalCount} críticos
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/20 text-warning">
              {warningCount} atenção
            </span>
          )}
        </div>
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum alerta no momento</p>
          <p className="text-xs">Tudo está sob controle! 🎉</p>
        </div>
      ) : (
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-3">
            {visibleAlerts.slice(0, 10).map((alert) => (
              <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
            ))}
          </div>
          {visibleAlerts.length > 10 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              +{visibleAlerts.length - 10} alertas adicionais
            </p>
          )}
        </ScrollArea>
      )}
    </div>
  );
};
