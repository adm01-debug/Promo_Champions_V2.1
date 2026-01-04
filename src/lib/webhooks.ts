// Webhooks Management System
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Webhook {
  id: string;
  user_id: string;
  url: string;
  events: string[];
  secret?: string;
  is_active: boolean;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  last_attempt_at?: string;
  created_at: string;
}

export const useWebhooks = (userId: string) => {
  return useQuery({
    queryKey: ['webhooks', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as Webhook[];
    },
  });
};

export const useCreateWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (webhook: Omit<Webhook, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('webhooks')
        .insert(webhook)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
};

export const useTestWebhook = () => {
  return useMutation({
    mutationFn: async (webhookId: string) => {
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', webhookId)
        .single();
      
      if (error) throw error;
      
      // Test webhook by sending a ping event
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': webhook.secret || '',
        },
        body: JSON.stringify({
          event: 'ping',
          webhook_id: webhookId,
          timestamp: new Date().toISOString(),
        }),
      });
      
      return { success: response.ok, status: response.status };
    },
  });
};
