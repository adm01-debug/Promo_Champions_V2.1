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
    bg: "bg-warning/5 border-warning/20 shadow-[0_0_20px_rgba(var(--warning-rgb),0.1)]",
    iconColor: "text-warning",
    dot: "bg-warning",
  },
  info: {
    icon: Info,
    bg: "bg-primary/5 border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]",
    iconColor: "text-primary",
    dot: "bg-primary",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-success/5 border-success/20 shadow-[0_0_20px_rgba(var(--success-rgb),0.1)]",
    iconColor: "text-success",
    dot: "bg-success",
  },
};

export const AlertsPanel = React.memo(function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="pb-6 pt-0 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white/30 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            Neural Alerts
          </CardTitle>
          {alerts.length > 0 && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-primary text-primary-foreground animate-pulse">
              {alerts.length} ACTIVE
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <AnimatePresence mode="popLayout">
          {alerts.length > 0 ? (
            alerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-[1.5rem] border backdrop-blur-md group relative overflow-hidden",
                    config.bg
                  )}
                >
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.dot)} />
                  <div className={cn("p-2 rounded-xl bg-white/[0.03] shrink-0", config.iconColor)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-xs font-black text-white/80 group-hover:text-white transition-colors uppercase tracking-tight leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white"
                    aria-label="Dispensar alerta"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center opacity-10"
            >
              <div className="relative mb-4">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <div className="absolute inset-0 bg-success rounded-full blur-2xl opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                System Healthy
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});
