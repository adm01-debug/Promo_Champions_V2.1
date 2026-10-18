import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { toast } from 'sonner';

export interface StageBaseline {
  id: string;
  stage: string;
  segment: string;
  p50_hours: number;
  p75_hours: number;
  p90_hours: number;
  sample_size: number;
  computed_at: string;
}

export const useStuckDeals = (limit = 20) =>
  useQuery({
    queryKey: ['stuck-deals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_velocity_alerts')
        .select('*, sales!inner(id, client_name, product_name, amount, salesperson_id)')
        .in('severity', ['stuck', 'critical'])
        .order('hours_in_stage', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

export const useStageBottlenecks = () =>
  useQuery({
    queryKey: ['stage-bottlenecks'],
    queryFn: async () => {
      const [baselinesRes, alertsRes] = await Promise.all([
        supabase
          .from('stage_velocity_baselines')
          .select('stage, p50_hours, p75_hours, p90_hours, sample_size')
          .eq('segment', 'all'),
        supabase.from('deal_velocity_alerts').select('current_stage, severity'),
      ]);
      if (baselinesRes.error) throw baselinesRes.error;
      if (alertsRes.error) throw alertsRes.error;

      const stuckByStage = new Map<string, number>();
      for (const a of (alertsRes.data || []) as Array<{
        current_stage: string;
        severity: string;
      }>) {
        if (a.severity === 'stuck' || a.severity === 'critical') {
          stuckByStage.set(a.current_stage, (stuckByStage.get(a.current_stage) || 0) + 1);
        }
      }
      return (
        (baselinesRes.data || []) as Array<{
          stage: string;
          p50_hours: number;
          p75_hours: number;
          p90_hours: number;
          sample_size: number;
        }>
      ).map(b => ({
        stage: b.stage,
        p50: Number(b.p50_hours),
        p75: Number(b.p75_hours),
        p90: Number(b.p90_hours),
        sample: b.sample_size,
        stuck: stuckByStage.get(b.stage) || 0,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
  });

export const useRecomputeBaselines = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        'recompute-stage-baselines',
        { body: {} }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Baselines recalculadas');
      qc.invalidateQueries({ queryKey: ['stage-baselines'] });
      qc.invalidateQueries({ queryKey: ['stage-bottlenecks'] });
    },
    onError: () => toast.error('Erro ao recalcular baselines'),
  });
};

export const useDetectStuckDeals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('detect-stuck-deals', {
        body: {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Deals presos atualizados');
      qc.invalidateQueries({ queryKey: ['stuck-deals'] });
      qc.invalidateQueries({ queryKey: ['deal-stage-velocity'] });
      qc.invalidateQueries({ queryKey: ['stage-bottlenecks'] });
    },
    onError: () => toast.error('Erro ao detectar deals presos'),
  });
};
