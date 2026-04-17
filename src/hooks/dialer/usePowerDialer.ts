import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type DialerQueue = {
  id: string;
  owner_id: string;
  name: string;
  filter: Record<string, unknown>;
  priority_strategy: 'score' | 'recency' | 'send_time' | 'hybrid';
  is_active: boolean;
  last_built_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DialerQueueItem = {
  id: string;
  queue_id: string;
  sale_id: string;
  score: number;
  queue_position: number;
  status: 'pending' | 'calling' | 'done' | 'skipped' | 'snoozed';
  snooze_until: string | null;
  added_at: string;
  completed_at: string | null;
};

export type CallLog = {
  id: string;
  owner_id: string;
  sale_id: string | null;
  queue_item_id: string | null;
  disposition: string;
  outcome: string | null;
  duration_seconds: number;
  notes: string | null;
  next_action_at: string | null;
  created_at: string;
};

export const useDialerQueues = () => {
  return useQuery<DialerQueue[]>({
    queryKey: ['dialer-queues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dialer_queues')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DialerQueue[];
    },
  });
};

export const useQueueItems = (queueId: string | null) => {
  return useQuery<DialerQueueItem[]>({
    queryKey: ['dialer-queue-items', queueId],
    enabled: !!queueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dialer_queue_items')
        .select('*')
        .eq('queue_id', queueId!)
        .order('queue_position', { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as DialerQueueItem[];
    },
  });
};

export const useQueueStats = (queueId: string | null) => {
  return useQuery({
    queryKey: ['dialer-queue-stats', queueId],
    enabled: !!queueId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dialer_queue_stats', { _queue_id: queueId! });
      if (error) throw error;
      return (data?.[0] ?? { pending_count: 0, calling_count: 0, done_count: 0, skipped_count: 0, snoozed_count: 0 });
    },
  });
};

export const useCreateQueue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; priority_strategy: DialerQueue['priority_strategy']; filter?: Record<string, unknown> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('dialer_queues').insert({
        owner_id: user.id,
        name: payload.name,
        priority_strategy: payload.priority_strategy,
        filter: payload.filter ?? {},
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dialer-queues'] });
      toast({ title: 'Fila criada' });
    },
  });
};

export const useRebuildQueue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (queueId: string) => {
      const { data, error } = await supabase.functions.invoke('dialer-queue-builder', {
        body: { queue_id: queueId },
      });
      if (error) throw error;
      return data as { ok: boolean; items_built: number };
    },
    onSuccess: (data, queueId) => {
      qc.invalidateQueries({ queryKey: ['dialer-queue-items', queueId] });
      qc.invalidateQueries({ queryKey: ['dialer-queue-stats', queueId] });
      qc.invalidateQueries({ queryKey: ['dialer-queues'] });
      toast({ title: 'Fila reconstruída', description: `${data.items_built} itens enfileirados` });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });
};

export const useNextItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (queueId: string) => {
      const { data, error } = await supabase.rpc('next_dialer_item', { _queue_id: queueId });
      if (error) throw error;
      return (data?.[0] ?? null) as { item_id: string; sale_id: string; score: number; queue_position: number } | null;
    },
    onSuccess: (_d, queueId) => {
      qc.invalidateQueries({ queryKey: ['dialer-queue-items', queueId] });
      qc.invalidateQueries({ queryKey: ['dialer-queue-stats', queueId] });
    },
  });
};

export const useLogCall = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      sale_id: string;
      queue_item_id?: string | null;
      disposition: string;
      outcome?: string | null;
      duration_seconds?: number;
      notes?: string | null;
      next_action_at?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('call_logs').insert({
        owner_id: user.id,
        ...payload,
      }).select().single();
      if (error) throw error;

      if (payload.queue_item_id) {
        await supabase.from('dialer_queue_items').update({
          status: 'done',
          completed_at: new Date().toISOString(),
        }).eq('id', payload.queue_item_id);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dialer-queue-items'] });
      qc.invalidateQueries({ queryKey: ['dialer-queue-stats'] });
      qc.invalidateQueries({ queryKey: ['call-logs'] });
      toast({ title: 'Chamada registrada' });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });
};

export const useSnoozeItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { item_id: string; snooze_minutes: number }) => {
      const until = new Date(Date.now() + payload.snooze_minutes * 60_000).toISOString();
      const { error } = await supabase.from('dialer_queue_items').update({
        status: 'snoozed', snooze_until: until,
      }).eq('id', payload.item_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dialer-queue-items'] });
      qc.invalidateQueries({ queryKey: ['dialer-queue-stats'] });
      toast({ title: 'Adiado' });
    },
  });
};

export const useCallLogsForSale = (saleId: string | null) => {
  return useQuery<CallLog[]>({
    queryKey: ['call-logs', 'sale', saleId],
    enabled: !!saleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('sale_id', saleId!)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as unknown as CallLog[];
    },
  });
};
