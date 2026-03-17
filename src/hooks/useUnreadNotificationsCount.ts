import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadNotificationsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const [alertsResult, resetResult] = await Promise.all([
        supabase
          .from("login_alerts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("acknowledged", false),
        supabase
          .from("password_reset_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      return (alertsResult.count || 0) + (resetResult.count || 0);
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
