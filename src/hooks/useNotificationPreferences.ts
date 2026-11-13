import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreference {
  id: string;
  email: string;
  frequency: string;
  is_active: boolean;
  notify_stagnant_deals: boolean;
  notify_inactive_clients: boolean;
  notify_at_risk_goals: boolean;
  stagnant_threshold_days: number;
  inactive_threshold_days: number;
  consecutive_days_threshold: number;
  preferred_time: string;
  created_at: string;
  updated_at: string;
}

export const useNotificationPreferences = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['notificationpreferences'],
    queryFn: async () => {
      const { data } = await supabase.from('notification_preferences').select('*');
      return (data || []) as NotificationPreference[];
    },
  });

  return { data, isLoading };
};

export const useCreateNotificationPreference = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (
      pref: Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>
    ) => {
      if (!user) throw new Error('Usuário não autenticado');
      // RLS exige user_id = auth.uid() no INSERT
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({ ...pref, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationpreferences'] });
      toast.success('Configuração criada!');
    },
    onError: (err: Error) => toast.error('Erro: ' + err.message),
  });
};

export const useUpdateNotificationPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<NotificationPreference>) => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationpreferences'] });
    },
    onError: (err: Error) => toast.error('Erro: ' + err.message),
  });
};

export const useDeleteNotificationPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationpreferences'] });
      toast.success('Configuração removida!');
    },
    onError: (err: Error) => toast.error('Erro: ' + err.message),
  });
};
