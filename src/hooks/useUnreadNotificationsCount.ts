import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadNotificationsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Count security alerts not acknowledged for admins
      const { count: alertsCount } = await supabase
        .from("login_alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("acknowledged", false);

      // Count password reset requests pending
      const { count: resetCount } = await supabase
        .from("password_reset_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      return (alertsCount || 0) + (resetCount || 0);
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
