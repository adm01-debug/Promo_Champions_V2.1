import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface RankNotification {
  id: string;
  salesperson_id: string;
  overtaken_by_id: string;
  old_rank: number;
  new_rank: number;
  is_read: boolean;
  created_at: string;
  overtaker_name?: string;
}

export function useRankNotifications(salespersonId?: string) {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['rank-notifications', salespersonId],
    queryFn: async (): Promise<RankNotification[]> => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from('rank_change_notifications')
        .select('*, overtaker:overtaken_by_id(name)')
        .eq('salesperson_id', salespersonId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((n: any) => ({
        ...n,
        overtaker_name: n.overtaker?.name || 'Alguém',
      }));
    },
    enabled: !!salespersonId,
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Realtime
  useEffect(() => {
    if (!salespersonId) return;
    const channel = supabase
      .channel('rank-changes-rt')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'rank_change_notifications',
        filter: `salesperson_id=eq.${salespersonId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['rank-notifications'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [salespersonId, queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('rank_change_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rank-notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!salespersonId) return;
      const { error } = await supabase
        .from('rank_change_notifications')
        .update({ is_read: true })
        .eq('salesperson_id', salespersonId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rank-notifications'] }),
  });

  return { notifications, unreadCount, isLoading, markAsRead, markAllRead };
}
