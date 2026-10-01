import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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


export function useOptimizeSendTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { sale_ids?: string[]; recompute_all?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('send-time-optimizer', {
        body: input,
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error)
        throw new Error((data as { error: string }).error);
      return data as { updated: number; fallbacks: number; total: number };
    },
    onSuccess: data => {
      qc.invalidateQueries({ queryKey: ['send-time-profile'] });
      qc.invalidateQueries({ queryKey: ['send-time-top'] });
      toast({
        title: 'Perfis atualizados',
        description: `${data.updated} de ${data.total} (${data.fallbacks} usaram fallback global).`,
      });
    },
    onError: (e: Error) =>
      toast({
        title: 'Erro ao otimizar',
        description: e.message,
        variant: 'destructive',
      }),
  });
}


export function useGlobalSendTimeStats() {
  return useQuery({
    queryKey: ['global-send-time-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_global_send_time_stats');
      if (error) throw error;
      const row =
        Array.isArray(data) && data[0]
          ? data[0]
          : { best_hour: 10, best_dow: 2, sample_size: 0 };
      return row as { best_hour: number; best_dow: number; sample_size: number };
    },
  });
}

export function useTopSendTimeProfiles(limit = 10) {
  return useQuery({
    queryKey: ['send-time-top', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('send_time_profiles')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(limit);
      if (error) throw error;
      // eslint-disable-next-line no-restricted-syntax
      return (data ?? []) as unknown as SendTimeProfile[];
    },
  });
}
