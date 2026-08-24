import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Channel = ReturnType<typeof supabase.channel>;

// Module-level cache: stores the channel for each (userId) so that
// Strict-Mode double-mount reuses the same channel instead of creating a new
// one. Cleared on Vite HMR via import.meta.hot.
const channelCache = new Map<string, Channel>();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    channelCache.forEach((ch) => supabase.removeChannel(ch));
    channelCache.clear();
  });
}

export function useUnreadNotificationsCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const topic = `notifications-count:${user.id}`;
    let channel = channelCache.get(topic);

    if (!channel) {
      channel = supabase
        .channel(topic)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
          }
        )
        .subscribe();
      channelCache.set(topic, channel);
    }
    channelRef.current = channel;

    return () => {
      channelRef.current = null;
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
