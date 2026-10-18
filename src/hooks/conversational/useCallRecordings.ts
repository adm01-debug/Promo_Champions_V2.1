import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CallRecording {
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

const CALL_RECORDINGS_PAGE_SIZE = 50;

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
    [query.data]
  );

  return { ...query, data };
}
