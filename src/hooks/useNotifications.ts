import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { useState, useCallback } from 'react';

export type NotificationType = 
  | 'achievement' 
  | 'xp_gain' 
  | 'level_up' 
  | 'streak' 
  | 'goal_complete' 
  | 'goal_warning' 
  | 'task_reminder' 
  | 'team_update' 
  | 'performance' 
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// Mock notifications for now since there's no notifications table in the schema
const mockNotifications: Notification[] = [];

export const useNotifications = (userId?: string) => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      // Return mock data since notifications table doesn't exist
      return notifications;
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  return {
    ...query,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    isLoading: query.isLoading,
  };
};
