import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadNotificationsCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Realtime: invalidate on changes
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications-count:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const [notifResult, alertsResult, resetResult] = await Promise.all([
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null)
          .is("archived_at", null),
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

      return (
        (notifResult.count || 0) +
        (alertsResult.count || 0) +
        (resetResult.count || 0)
      );
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
