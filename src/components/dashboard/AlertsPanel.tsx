import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, Info, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  message: string;
}

const initialAlerts: Alert[] = [
  { id: "1", type: "warning", message: "3 deals sem atividade há 5+ dias" },
  { id: "2", type: "info", message: "Meta 85% atingida" },
];

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10 border-warning/20",
    iconColor: "text-warning",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10 border-primary/20",
    iconColor: "text-primary",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-success/10 border-success/20",
    iconColor: "text-success",
  },
};

export const AlertsPanel = React.memo(function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Alertas
          </CardTitle>
          {alerts.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
              {alerts.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence mode="popLayout">
          {alerts.length > 0 ? (
            alerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, x: 50, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex items-start gap-2 p-2.5 rounded-lg border group",
                    config.bg
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)}
                  />
                  <p className="text-xs flex-1">{alert.message}</p>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-foreground/10"
                    aria-label="Dispensar alerta"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <CheckCircle2 className="h-8 w-8 text-success/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                Tudo em dia! Nenhum alerta.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});
