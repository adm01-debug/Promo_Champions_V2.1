import { useSecurityAlertNotifications } from "@/hooks/useSecurityAlertNotifications";
import { useSDRAlertNotifications } from "@/hooks/useSDRAlertNotifications";

export function LayoutRealtimeEffects(): null {
  useSecurityAlertNotifications();
  useSDRAlertNotifications();

  return null;
}