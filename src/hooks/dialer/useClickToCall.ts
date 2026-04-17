import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TwilioSession {
  id: string;
  call_sid: string | null;
  status: string;
  duration_seconds: number | null;
  to_number: string;
  from_number: string | null;
  recording_url: string | null;
  started_at: string | null;
  ended_at: string | null;
}

export const useTwilioCredentialsCheck = () => {
  return useQuery({
    queryKey: ['twilio-credentials-check'],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { configured: false };
      const { data } = await supabase
        .from('channel_credentials')
        .select('id, from_number')
        .eq('owner_id', auth.user.id)
        .eq('provider', 'twilio')
        .eq('enabled', true)
        .limit(1)
        .maybeSingle();
      return { configured: !!data, from_number: data?.from_number ?? null };
    },
    staleTime: 60_000,
  });
};

export const useInitiateCall = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      to_number: string;
      sale_id?: string;
      queue_item_id?: string;
      from_number?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('twilio-click-to-call', {
        body: input,
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? 'Falha ao iniciar chamada');
      return data as { ok: true; call_sid: string; session_id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['twilio-sessions'] });
      toast.success('Chamada iniciada');
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};

export const useCallSession = (callSid: string | null) => {
  return useQuery({
    queryKey: ['twilio-session', callSid],
    enabled: !!callSid,
    refetchInterval: (q) => {
      const s = (q.state.data as TwilioSession | undefined)?.status;
      if (!s || ['initiated', 'ringing', 'in-progress'].includes(s)) return 2000;
      return false;
    },
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twilio_call_sessions')
        .select('*')
        .eq('call_sid', callSid!)
        .maybeSingle();
      if (error) throw error;
      return data as TwilioSession | null;
    },
  });
};
