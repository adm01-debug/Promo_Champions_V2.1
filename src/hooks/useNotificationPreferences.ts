import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  deal_updates: boolean;
  task_reminders: boolean;
  team_mentions: boolean;
  daily_digest: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export const useNotificationPreferences = (userId: string) => {
  return useQuery({
    queryKey: ['notificationPreferences', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as NotificationPreferences | null;
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(preferences)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['notificationPreferences', data.user_id] 
      });
    },
  });
};
