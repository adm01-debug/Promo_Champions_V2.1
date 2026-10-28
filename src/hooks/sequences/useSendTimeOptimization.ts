import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { uniqueChannelTopic } from '@/lib/supabase/realtime';
import { toast } from 'sonner';

export function useToggleSendTimeOptimization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('sequences')
        .update({ send_time_optimization: enabled })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: data => {
      qc.invalidateQueries({ queryKey: ['sequences'] });
      qc.invalidateQueries({ queryKey: ['sequence', data.id] });
      toast.success(data.send_time_optimization ? 'STO ativado' : 'STO desativado');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== Send Time Profiles & Scheduled Sends =====
import { useEffect } from 'react';

export interface SendTimeProfile {
  id: string;
  sale_id: string;
  best_hour: number;
  best_dow: number;
  confidence: number;
  sample_size: number;
  tz: string;
  hour_distribution: number[];
  dow_distribution: number[];
  last_calculated_at: string;
}

export interface ScheduledSend {
  id: string;
  owner_id: string;
  sale_id: string;
  channel: string;
  payload: Record<string, unknown>;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  optimization_source: 'profile' | 'global' | 'manual';
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export function useScheduleOptimalSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sale_id: string;
      channel: string;
      payload: Record<string, unknown>;
      force_now?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('schedule-optimal-send', {
        body: input,
      });
      if (error) throw new Error(error.message);
      return data as {
        id: string;
        scheduled_for: string;
        source: string;
        confidence: number;
      };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduled-sends'] }),
    onError: (e: Error) => toast.error(`Erro ao agendar: ${e.message}`),
  });
}

export function useScheduledSends(status: ScheduledSend['status'] | 'all' = 'pending') {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['scheduled-sends', status],
    queryFn: async () => {
      const base = supabase.from('scheduled_sends').select('*');
      const filtered = status !== 'all' ? base.eq('status', status) : base;
      const { data, error } = await filtered
        .order('scheduled_for', { ascending: true })
        .limit(200);
      if (error) throw error;
      // eslint-disable-next-line no-restricted-syntax
      return (data ?? []) as unknown as ScheduledSend[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(uniqueChannelTopic('scheduled-sends-realtime'))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scheduled_sends' },
        () => qc.invalidateQueries({ queryKey: ['scheduled-sends'] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return q;
}

export function useCancelScheduledSend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_sends')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scheduled-sends'] });
      toast.success('Envio cancelado');
    },
    onError: (e: Error) => toast.error(`Erro ao cancelar: ${e.message}`),
  });
}
