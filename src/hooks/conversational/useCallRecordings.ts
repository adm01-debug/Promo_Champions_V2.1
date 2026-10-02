import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CallRecording {
  id: string;
  salesperson_id: string;
  sale_id: string | null;
  client_id: string | null;
  title: string;
  audio_url: string | null;
  duration_seconds: number;
  recorded_at: string;
  status: 'pending' | 'transcribing' | 'transcribed' | 'analyzing' | 'ready' | 'failed';
  participants: unknown;
  metadata: unknown;
  created_at: string;
  transcript?: string | null;
  transcript_language?: string | null;
  transcribed_at?: string | null;
  transcription_error?: string | null;
  talk_ratio_seller?: number | null;
  talk_ratio_client?: number | null;
  longest_monologue_sec?: number | null;
  interruptions_count?: number | null;
  turns_count?: number | null;
  diarization?: unknown;
  diarized_at?: string | null;
  summary?: string | null;
  action_items?: unknown;
  decisions?: unknown;
  objections_summary?: unknown;
  next_steps?: unknown;
  key_topics?: string[] | null;
  sentiment?: string | null;
  summarized_at?: string | null;
}

export interface CallInsight {
  id: string;
  recording_id: string;
  sentiment_score: number | null;
  sentiment_label: string | null;
  talk_ratio_salesperson: number | null;
  talk_ratio_client: number | null;
  topics: string[];
  objections: string[];
  next_steps: string[];
  key_moments: Array<{ timestamp_sec: number; label: string }>;
  coaching_tips: string[];
  summary: string | null;
  questions_asked: number;
}

/**
 * Colunas usadas pela lista + painel de detalhe (sem `*` — evita puxar
 * `participants`/`metadata`, que nenhum consumidor lê).
 */
const CALL_RECORDING_COLUMNS = `
  id,
  salesperson_id,
  sale_id,
  client_id,
  title,
  audio_url,
  duration_seconds,
  recorded_at,
  status,
  created_at,
  transcript,
  transcript_language,
  transcribed_at,
  transcription_error,
  talk_ratio_seller,
  talk_ratio_client,
  longest_monologue_sec,
  interruptions_count,
  turns_count,
  diarization,
  diarized_at,
  summary,
  action_items,
  decisions,
  objections_summary,
  next_steps,
  key_topics,
  sentiment,
  summarized_at
`;

export const CALL_RECORDINGS_PAGE_SIZE = 50;

/**
 * Lista de gravações paginada por `.range()` (50 por página).
 * `data` retorna o array achatado das páginas — compatível com o uso anterior;
 * `hasNextPage`/`fetchNextPage` alimentam o botão "Carregar mais".
 */
export function useCallRecordings(saleId?: string) {
  const query = useInfiniteQuery({
    queryKey: ['call-recordings', saleId ?? 'all'],
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from('call_recordings')
        .select(CALL_RECORDING_COLUMNS)
        .order('recorded_at', { ascending: false })
        .order('id', { ascending: true })
        .range(pageParam, pageParam + CALL_RECORDINGS_PAGE_SIZE - 1);
      if (saleId) q = q.eq('sale_id', saleId);
      const { data, error } = await q;
      if (error) throw error;
      // eslint-disable-next-line no-restricted-syntax
      return (data as unknown as CallRecording[]) ?? [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < CALL_RECORDINGS_PAGE_SIZE
        ? undefined
        : allPages.length * CALL_RECORDINGS_PAGE_SIZE,
  });

  const data = useMemo(
    () => (query.data ? query.data.pages.flat() : undefined),
    [query.data],
  );

  return { ...query, data };
}

export function useCallInsight(recordingId?: string) {
  return useQuery({
    queryKey: ['call-insight', recordingId],
    queryFn: async () => {
      if (!recordingId) return null;
      const { data, error } = await supabase
        .from('call_insights')
        .select('*')
        .eq('recording_id', recordingId)
        .maybeSingle();
      if (error) throw error;
      // eslint-disable-next-line no-restricted-syntax
      return data as unknown as CallInsight | null;
    },
    enabled: !!recordingId,
  });
}

export function useCallTranscript(recordingId?: string) {
  return useQuery({
    queryKey: ['call-transcript', recordingId],
    queryFn: async () => {
      if (!recordingId) return null;
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('recording_id', recordingId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!recordingId,
  });
}

export function useCreateRecordingWithAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      transcript_text: string;
      sale_id?: string;
      client_id?: string;
      duration_seconds?: number;
    }) => {
      const { data: sp } = await supabase.rpc('get_current_salesperson_id');
      if (!sp) throw new Error('Salesperson não encontrado');

      const { data: rec, error } = await supabase
        .from('call_recordings')
        .insert({
          salesperson_id: sp as string,
          sale_id: input.sale_id ?? null,
          client_id: input.client_id ?? null,
          title: input.title,
          duration_seconds: input.duration_seconds ?? 0,
          status: 'transcribing',
        })
        .select()
        .single();
      if (error) throw error;

      const { error: fnErr } = await supabase.functions.invoke('analyze-call', {
        body: { recording_id: rec.id, transcript_text: input.transcript_text },
      });
      if (fnErr) throw fnErr;
      return rec;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['call-recordings'] });
      toast.success('Call analisada com sucesso! 🎯');
    },
    onError: e => toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`),
  });
}

export function useDeleteRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('call_recordings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['call-recordings'] });
      toast.success('Gravação removida');
    },
  });
}
