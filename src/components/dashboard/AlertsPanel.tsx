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
    <Card className="h-full border-none bg-gradient-to-br from-card/30 to-background shadow-lg shadow-black/5 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            Central de Alertas
          </CardTitle>
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge variant="destructive" className="h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-black rounded-full animate-pulse">
                  {alerts.length}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {alerts.length > 0 ? (
            alerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-border/40 hover:bg-muted/40 transition-all group relative",
                    config.bg
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg bg-background/50 shrink-0", config.iconColor)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-bold leading-relaxed pr-6">{alert.message}</p>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground"
                    aria-label="Dispensar alerta"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center space-y-3"
            >
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                <CheckCircle2 className="h-6 w-6 text-success animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-foreground">Zero Anomalias</p>
                <p className="text-[10px] text-muted-foreground font-medium italic">Sistema operando em 100%</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

AlertsPanel.displayName = "AlertsPanel";
