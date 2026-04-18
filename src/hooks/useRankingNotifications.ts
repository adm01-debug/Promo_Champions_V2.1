import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RankingNotification {
  id: string;
  salesperson_id: string;
  rank: number;
  total_sales: number;
  gap_to_first: number;
  gap_to_next: number;
  next_competitor_name: string | null;
  period_start: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export function useMyRankingNotification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`ranking-notif:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ranking_notifications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["my-ranking-notification"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ["my-ranking-notification", user?.id],
    queryFn: async (): Promise<RankingNotification | null> => {
      if (!user?.id) return null;
      const { data: sp } = await supabase
        .from("salespeople")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (!sp?.id) return null;
      const { data, error } = await supabase
        .from("ranking_notifications")
        .select("*")
        .eq("salesperson_id", sp.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as RankingNotification) ?? null;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

export function useMarkRankingNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ranking_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-ranking-notification"] }),
  });
}

export function useSendRankingNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<{ sent: number }> => {
      const { data, error } = await supabase.functions.invoke("notify-ranking-position", { body: {} });
      if (error) throw error;
      return data as { sent: number };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-ranking-notification"] }),
  });
}
