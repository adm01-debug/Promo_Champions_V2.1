import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type NotificationType =
  | "achievement"
  | "xp_gain"
  | "level_up"
  | "streak"
  | "goal_complete"
  | "goal_warning"
  | "task_reminder"
  | "team_update"
  | "performance"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Local storage key for notifications
const NOTIFICATIONS_KEY = "salespro_notifications";
const MAX_NOTIFICATIONS = 100;

function getStoredNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    }));
  } catch {
    return [];
  }
}

function storeNotifications(notifications: Notification[]) {
  try {
    // Keep only the most recent notifications
    const toStore = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error("Failed to store notifications:", error);
  }
}

export function useNotifications() {
  const { salesperson } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(() => getStoredNotifications());

  // Sync with database achievements/events
  const { data: dbEvents, isLoading } = useQuery({
    queryKey: ["notification-events", salesperson?.id],
    queryFn: async () => {
      if (!salesperson?.id) return { achievements: [], xpHistory: [] };

      // Fetch recent achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("salesperson_id", salesperson.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch recent XP history
      const { data: xpHistory } = await supabase
        .from("xp_history")
        .select("*")
        .eq("salesperson_id", salesperson.id)
        .order("created_at", { ascending: false })
        .limit(20);

      return {
        achievements: achievements || [],
        xpHistory: xpHistory || [],
      };
    },
    enabled: !!salesperson?.id,
    staleTime: 60000,
  });

  // Merge database events with local notifications
  useEffect(() => {
    if (!dbEvents) return;

    const existingIds = new Set(notifications.map((n) => n.id));
    const newNotifications: Notification[] = [];

    // Convert achievements to notifications
    dbEvents.achievements.forEach((ach) => {
      const id = `ach_${ach.id}`;
      if (existingIds.has(id)) return;

      let title = "Nova Conquista!";
      let message = "Você desbloqueou uma nova conquista";
      let type: NotificationType = "achievement";

      if (ach.achievement_type === "daily_goal") {
        title = "Meta Diária Alcançada!";
        message = "Parabéns por atingir sua meta diária de atividades";
        type = "goal_complete";
      } else if (ach.achievement_type.startsWith("streak_")) {
        const days = ach.achievement_type.replace("streak_", "").replace("_days", "");
        title = `Streak de ${days} Dias!`;
        message = `Incrível! Você manteve uma sequência de ${days} dias`;
        type = "streak";
      } else if (ach.achievement_type === "new_record") {
        title = "Novo Recorde Pessoal!";
        message = "Você bateu seu próprio recorde";
        type = "performance";
      }

      newNotifications.push({
        id,
        type,
        title,
        message,
        read: false,
        createdAt: new Date(ach.created_at),
        metadata: ach.details as Record<string, any>,
      });
    });

    // Convert XP gains to notifications (only significant ones)
    dbEvents.xpHistory.forEach((xp) => {
      const id = `xp_${xp.id}`;
      if (existingIds.has(id)) return;
      if (xp.xp_amount < 50) return; // Only notify for significant XP gains

      newNotifications.push({
        id,
        type: "xp_gain",
        title: `+${xp.xp_amount} XP!`,
        message: xp.description || `Você ganhou ${xp.xp_amount} pontos de experiência`,
        read: false,
        createdAt: new Date(xp.created_at),
        metadata: { amount: xp.xp_amount, source: xp.source_type },
      });
    });

    if (newNotifications.length > 0) {
      const merged = [...newNotifications, ...notifications]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, MAX_NOTIFICATIONS);
      setNotifications(merged);
      storeNotifications(merged);
    }
  }, [dbEvents]);

  // Computed values
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Actions
  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      storeNotifications(updated);
      return updated;
    });

    return newNotification;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      storeNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      storeNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      storeNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATIONS_KEY);
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}

// Hook for notification badge in header/sidebar
export function useNotificationBadge() {
  const { unreadCount } = useNotifications();
  return unreadCount;
}
