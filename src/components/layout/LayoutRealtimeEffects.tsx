import { useSecurityAlertNotifications } from "@/hooks/useSecurityAlertNotifications";
import { useSDRAlertNotifications } from "@/hooks/useSDRAlertNotifications";

export function LayoutRealtimeEffects() {
  useSecurityAlertNotifications();
  useSDRAlertNotifications();

  return null;
}