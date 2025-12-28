import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  deal_updates: boolean;
  task_reminders: boolean;
  achievement_alerts: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}

interface UpdatePreferencesInput {
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  deal_updates?: boolean;
  task_reminders?: boolean;
  achievement_alerts?: boolean;
  weekly_summary?: boolean;
}

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  const { data: preferences, isLoading, error } = useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences'],
    queryFn: async (): Promise<NotificationPreferences> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Se não existir, criar com defaults
      if (!data) {
        const defaultPrefs = {
          user_id: user.id,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          deal_updates: true,
          task_reminders: true,
          achievement_alerts: true,
          weekly_summary: true
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('notification_preferences')
          .insert(defaultPrefs)
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData as NotificationPreferences;
      }
      
      return data as NotificationPreferences;
    }
  });
  
  const updatePreferences = useMutation({
    mutationFn: async (updates: UpdatePreferencesInput): Promise<NotificationPreferences> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as NotificationPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    }
  });
  
  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending
  };
};
