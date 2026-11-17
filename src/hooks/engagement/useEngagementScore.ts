import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getLocalISODate } from '@/utils/dateHelpers';

export type EngagementTier = 'cold' | 'warm' | 'hot' | 'on_fire';
export type ContactType = 'lead' | 'client';

interface EngagementScore {
  id: string;
  contact_id: string;
  contact_type: ContactType;
  score: number;
  tier: EngagementTier;
  total_opens: number;
  total_clicks: number;
  total_replies: number;
  last_signal_at: string | null;
  updated_at: string;
}

export interface EngagementHistoryPoint {
  captured_at: string;
  score: number;
  tier: EngagementTier;
}

export interface EngagementLeaderboardEntry {
  id: string;
  contact_id: string;
  contact_type: ContactType;
  contact_name: string | null;
  score: number;
  tier: EngagementTier;
  total_opens: number;
  total_clicks: number;
  total_replies: number;
  last_signal_at: string | null;
  owner_salesperson_id: string | null;
}

export function useEngagementScore(contactId?: string, contactType?: ContactType) {
  return useQuery({
    queryKey: ['engagement-score', contactId, contactType],
    queryFn: async () => {
      if (!contactId || !contactType) return null;

      const [scoreRes, historyRes] = await Promise.all([
        supabase
          .from('contact_engagement_score')
          .select('*')
          .eq('contact_id', contactId)
          .eq('contact_type', contactType)
          .maybeSingle(),
        supabase
          .from('engagement_score_history')
          .select('captured_at, score, tier')
          .eq('contact_id', contactId)
          .eq('contact_type', contactType)
          .gte('captured_at', getLocalISODate(new Date(Date.now() - 30 * 86400000)))
          .order('captured_at', { ascending: true }),
      ]);

      return {
        score: (scoreRes.data as EngagementScore | null) ?? null,
        history: (historyRes.data as EngagementHistoryPoint[] | null) ?? [],
      };
    },
    enabled: Boolean(contactId && contactType),
    staleTime: 60_000,
  });
}

export function useEngagementLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ['engagement-leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engagement_score_leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as EngagementLeaderboardEntry[];
    },
    staleTime: 120_000,
  });
}

/**
 * Recálculo em lote do engajamento de contato (abre/clica/responde).
 *
 * O caminho normal é automático: `record_engagement_signal` grava o sinal em
 * `contact_send_time_profile` e o trigger `trg_recompute_engagement_on_signal`
 * recalcula o score. Esta mutation existe para o caso em que o automático não
 * cobre — backfill depois de mudança na fórmula, ou contato cujo sinal entrou
 * antes do trigger. Era a única ponta sem chamador: a edge function
 * `engagement-score-recompute` estava deployada e inalcançável pela UI.
 *
 * A própria function exige admin/gestor (`is_admin_or_manager`) e usa
 * service_role para varrer todos os owners, então o botão também é restrito.
 */
export function useRecomputeContactEngagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params?: { ownerId?: string }) => {
      const { data, error } = await supabase.functions.invoke(
        'engagement-score-recompute',
        { body: params?.ownerId ? { ownerId: params.ownerId } : {} }
      );
      if (error) throw error;
      return data as { ok: boolean; updated: number; ownerId: string | null };
    },
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: ['engagement-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['engagement-score'] });
      if ((res?.updated ?? 0) > 0) {
        toast.success(`Engajamento recalculado: ${res.updated} contato(s)`);
      } else {
        toast.info('Nenhum contato com sinal de engajamento para recalcular');
      }
    },
    onError: (error: Error) =>
      toast.error(`Falha ao recalcular engajamento: ${error.message}`),
  });
}
