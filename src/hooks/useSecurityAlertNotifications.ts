import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";

export function useSecurityAlertNotifications() {
  const { toast } = useToast();
  const { isAdmin, isManager } = useUserRoles();

  const playAlertSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Alert sound: descending warning tone
    const playNote = (freq: number, startTime: number, duration: number, gain = 0.4) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(gain, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Urgent descending pattern (alarm-like)
    playNote(880, now, 0.15);
    playNote(660, now + 0.15, 0.15);
    playNote(880, now + 0.3, 0.15);
    playNote(660, now + 0.45, 0.2);
  }, []);

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
          console.log('New security alert:', payload);
          
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

          // Play alert sound
          playAlertSound();

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
  }, [isAdmin, isManager, toast, playAlertSound]);
}