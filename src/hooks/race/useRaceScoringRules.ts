import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MetricCode =
  | 'sales_value'
  | 'markup_pct'
  | 'new_clients_activated'
  | 'routine_compliance'
  | 'stakeholders_captured'
  | 'conversations_initiated'
  | 'sales_value_originated';

export interface ScoringRule {
  id?: string;
  season_id: string;
  metric_code: MetricCode;
  weight: number;
  points_per_unit: number;
  label?: string | null;
}

export const METRIC_LABELS: Record<MetricCode, { label: string; unit: string; icon: string }> = {
  sales_value: { label: 'Valor de Vendas', unit: 'R$', icon: '💰' },
  markup_pct: { label: 'Markup', unit: '%', icon: '📈' },
  new_clients_activated: { label: 'Novos Clientes Ativados', unit: 'cliente', icon: '🎯' },
  routine_compliance: { label: 'Cumprimento de Rotina', unit: 'atividade', icon: '✅' },
  stakeholders_captured: { label: 'Stakeholders Captados', unit: 'contato', icon: '🤝' },
  conversations_initiated: { label: 'Conversas Iniciadas', unit: 'conversa', icon: '💬' },
  sales_value_originated: { label: 'Vendas Originadas', unit: 'R$', icon: '🚀' },
};

export const ROLE_METRICS: Record<'closer' | 'sdr', MetricCode[]> = {
  closer: ['sales_value', 'markup_pct', 'new_clients_activated', 'routine_compliance'],
  sdr: ['stakeholders_captured', 'new_clients_activated', 'conversations_initiated', 'sales_value_originated', 'routine_compliance'],
};

export function useRaceScoringRules(seasonId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['race-scoring-rules', seasonId],
    queryFn: async (): Promise<ScoringRule[]> => {
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('race_scoring_rules')
        .select('*')
        .eq('season_id', seasonId);
      if (error) throw error;
      return (data ?? []) as ScoringRule[];
    },
    enabled: !!seasonId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!seasonId) return;
    const ch = supabase
      .channel(`race-rules-${seasonId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'race_scoring_rules', filter: `season_id=eq.${seasonId}` }, () => {
        qc.invalidateQueries({ queryKey: ['race-scoring-rules', seasonId] });
        qc.invalidateQueries({ queryKey: ['race-leaderboard'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [seasonId, qc]);

  return query;
}

export function useUpsertScoringRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rule: ScoringRule) => {
      const { data, error } = await supabase
        .from('race_scoring_rules')
        .upsert({
          season_id: rule.season_id,
          metric_code: rule.metric_code,
          weight: rule.weight,
          points_per_unit: rule.points_per_unit,
          label: rule.label ?? null,
        }, { onConflict: 'season_id,metric_code' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['race-scoring-rules', vars.season_id] });
      qc.invalidateQueries({ queryKey: ['race-leaderboard'] });
    },
  });
}
