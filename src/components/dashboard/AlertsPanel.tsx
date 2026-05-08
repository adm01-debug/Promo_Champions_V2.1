import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, Info, CheckCircle2, X, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  message: string;
}

const initialAlerts: Alert[] = [
  { id: "1", type: "warning", message: "3 anomalous deals detected: 5+ days inactive" },
  { id: "2", type: "info", message: "Sector meta reached 85% completion" },
];

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-destructive/10 border-destructive/30",
    iconColor: "text-destructive",
    glow: "rgba(239, 68, 68, 0.4)",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10 border-primary/30",
    iconColor: "text-primary",
    glow: "rgba(14, 165, 233, 0.4)",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-success/10 border-success/30",
    iconColor: "text-success",
    glow: "rgba(34, 197, 94, 0.4)",
  },
};

export const AlertsPanel = React.memo(function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <Card className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Bell className="h-3.5 w-3.5" />
            </div>
            Signal Alerts
          </CardTitle>
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Badge className="bg-destructive text-white border-none h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-black rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {alerts.length}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border group transition-all duration-300",
                    config.bg,
                    "hover:bg-white/5"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg bg-black/40 shrink-0 border border-white/5", config.iconColor)} style={{ filter: `drop-shadow(0 0 5px ${config.glow})` }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-mono font-bold leading-relaxed pr-6 uppercase tracking-tight group-hover:text-foreground transition-colors">{alert.message}</p>
                  
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity p-1 rounded-md hover:bg-black/60 text-muted-foreground hover:text-foreground"
                    aria-label="Acknowledge alert"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Activity pulse for the specific alert */}
                  <div className="absolute right-0 top-0 h-full w-[2px] overflow-hidden rounded-r-xl">
                     <motion.div 
                        className={cn("w-full bg-current", config.iconColor)}
                        animate={{ height: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                     />
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-14 text-center space-y-4"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-success blur-xl rounded-full"
                />
                <div className="relative h-14 w-14 rounded-full bg-success/10 flex items-center justify-center border border-success/30 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]">
                  <CheckCircle2 className="h-7 w-7 text-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-foreground">Zero Anomalias</p>
                <div className="flex items-center justify-center gap-2">
                   <Radio className="h-3 w-3 text-success/60 animate-pulse" />
                   <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest italic">All systems nominal</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Decorative vertical scanline */}
      <motion.div 
        className="absolute top-0 right-0 w-[1px] h-full bg-primary/10"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </Card>
  );
});

AlertsPanel.displayName = "AlertsPanel";