import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type NotificationCategory =
  | "general" | "sales" | "goals" | "gamification"
  | "security" | "system" | "team" | "ai" | "approval";
export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string | null;
  icon: string | null;
  action_url: string | null;
  action_label: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  archived_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface UseNotificationsOptions {
  category?: NotificationCategory;
  unreadOnly?: boolean;
  limit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { category, unreadOnly, limit = 50 } = options;

  const query = useQuery({
    queryKey: ["notifications", user?.id, category, unreadOnly, limit],
    queryFn: async (): Promise<AppNotification[]> => {
      if (!user?.id) return [];
      let q = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (category) q = q.eq("category", category);
      if (unreadOnly) q = q.is("read_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as AppNotification[];
    },
    enabled: !!user?.id,
    staleTime: 15_000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("mark_all_notifications_read");
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
      if (count && count > 0) toast.success(`${count} notificação(ões) marcadas como lidas`);
    },
    onError: (e: Error) => toast.error("Erro: " + e.message),
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });
}

export interface SendNotificationInput {
  user_id: string;
  type: string;
  title: string;
  message?: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, unknown>;
}

export function useSendNotification() {
  return useMutation({
    mutationFn: async (input: SendNotificationInput) => {
      const { data, error } = await supabase.rpc("send_notification", {
        p_user_id: input.user_id,
        p_type: input.type,
        p_title: input.title,
        p_message: input.message,
        p_category: input.category ?? "general",
        p_priority: input.priority ?? "medium",
        p_action_url: input.action_url,
        p_action_label: input.action_label,
        p_metadata: (input.metadata ?? {}) as never,
      });
      if (error) throw error;
      return data as string;
    },
    onError: (e: Error) => toast.error("Erro ao enviar notificação: " + e.message),
  });
}
