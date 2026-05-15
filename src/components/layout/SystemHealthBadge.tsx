import { useState, useEffect } from "react";
import { Activity, ShieldCheck, AlertCircle, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function SystemHealthBadge() {
  const [status, setStatus] = useState<"healthy" | "warning" | "error" | "offline">("healthy");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    checkSystemHealth();

    // Periodic check
    const interval = setInterval(checkSystemHealth, 60000); // Every minute

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkSystemHealth = async () => {
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }

    try {
      // Check Supabase connectivity
      const { error } = await supabase.from("error_logs").select("id").limit(1);
      if (error) {
        setStatus("error");
        return;
      }

      // Check if there are critical errors in the last hour
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { data: recentErrors } = await supabase
        .from("error_logs")
        .select("id")
        .eq("severity", "critical")
        .gt("created_at", oneHourAgo)
        .limit(1);

      if (recentErrors && recentErrors.length > 0) {
        setStatus("warning");
      } else {
        setStatus("healthy");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  const statusConfig = {
    healthy: {
      icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
      text: "Sistema Operacional",
      color: "bg-emerald-500/10 border-emerald-500/20",
      tooltip: "Todos os sistemas operando normalmente."
    },
    warning: {
      icon: <Activity className="h-4 w-4 text-amber-500" />,
      text: "Atenção",
      color: "bg-amber-500/10 border-amber-500/20",
      tooltip: "Instabilidades detectadas recentemente. Monitorando..."
    },
    error: {
      icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
      text: "Erro Crítico",
      color: "bg-rose-500/10 border-rose-500/20",
      tooltip: "Falha na conexão com o banco de dados."
    },
    offline: {
      icon: <WifiOff className="h-4 w-4 text-muted-foreground" />,
      text: "Offline",
      color: "bg-muted/10 border-border",
      tooltip: "Você está sem conexão com a internet."
    }
  };

  const current = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-300",
            current.color
          )}>
            <div className="relative flex items-center justify-center">
              {current.icon}
              {status === "healthy" && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
              {current.text}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{current.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
