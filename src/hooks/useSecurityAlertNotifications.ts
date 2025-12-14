import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useSecurityAlertSoundSettings } from "@/hooks/useSecurityAlertSoundSettings";

export function useSecurityAlertNotifications() {
  const { toast } = useToast();
  const { isAdmin, isManager } = useUserRoles();
  const { playSound } = useSecurityAlertSoundSettings();

  useEffect(() => {
    // Only subscribe if user is admin or manager
    if (!isAdmin && !isManager) return;

    const channel = supabase
      .channel('security-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alert_history'
        },
        (payload) => {
          
          const newAlert = payload.new as {
            access_count: number;
            threshold_used: number;
            time_window_hours: number;
          };

          toast({
            title: "🛡️ Alerta de Segurança",
            description: `Detectado pico de ${newAlert.access_count} acessos negados (threshold: ${newAlert.threshold_used}) nas últimas ${newAlert.time_window_hours}h`,
            variant: "destructive",
            duration: 10000,
          });

          // Play customizable alert sound
          playSound();

          // Also show browser notification if permitted
          if (Notification.permission === "granted") {
            new Notification("Alerta de Segurança", {
              body: `Pico de ${newAlert.access_count} acessos negados detectado`,
              icon: "/favicon.ico",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, isManager, toast, playSound]);
}