import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useSecurityAlertSoundSettings } from "@/hooks/useSecurityAlertSoundSettings";

interface SDRDetail {
  id: string;
  name: string;
  consecutiveDays: number;
}

interface SDRAlertPayload {
  sdrs_notified: number;
  threshold_used: number;
  sdr_details: SDRDetail[];
  triggered_by: string;
}

export function useSDRAlertNotifications() {
  const { toast } = useToast();
  const { isAdmin, isManager } = useUserRoles();
  const { playSound } = useSecurityAlertSoundSettings();

  useEffect(() => {
    // Only subscribe if user is admin or manager
    if (!isAdmin && !isManager) return;

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('sdr-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sdr_alert_history'
        },
        (payload) => {
          const newAlert = payload.new as SDRAlertPayload;
          
          const sdrNames = Array.isArray(newAlert.sdr_details) 
            ? newAlert.sdr_details.map(s => s.name).slice(0, 3).join(", ")
            : "";
          
          const extraCount = Array.isArray(newAlert.sdr_details) && newAlert.sdr_details.length > 3 
            ? ` +${newAlert.sdr_details.length - 3}` 
            : "";

          // Show toast notification
          toast({
            title: "⚠️ Alerta SDR",
            description: `${newAlert.sdrs_notified} SDR(s) abaixo da meta por ${newAlert.threshold_used}+ dias${sdrNames ? `: ${sdrNames}${extraCount}` : ""}`,
            variant: "destructive",
            duration: 10000,
          });

          // Play alert sound
          playSound();

          // Show browser push notification if permitted
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Alerta SDR - Performance Abaixo da Meta", {
              body: `${newAlert.sdrs_notified} SDR(s) estão abaixo da meta por ${newAlert.threshold_used}+ dias consecutivos${sdrNames ? `: ${sdrNames}${extraCount}` : ""}`,
              icon: "/favicon.ico",
              tag: "sdr-alert", // Prevents duplicate notifications
              requireInteraction: true, // Keep notification visible until user interacts
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
