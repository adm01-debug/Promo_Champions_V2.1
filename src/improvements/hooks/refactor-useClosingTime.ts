// src/hooks/useClosingTime.ts
// Refatorado: 5 any removidos
// Data: 2024-12-28

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DealStageHistory {
  stageId: string;
  stageName: string;
  enteredAt: Date;
  exitedAt: Date | null;
  durationDays: number;
}

export interface ClosingTimeData {
  dealId: string;
  dealTitle: string;
  dealValue: number;
  createdAt: Date;
  wonAt: Date | null;
  totalDays: number;
  stageHistory: DealStageHistory[];
  averageDaysPerStage: number;
  slowestStage: string;
  fastestStage: string;
}

export interface ClosingTimeMetrics {
  averageClosingTime: number;
  medianClosingTime: number;
  minClosingTime: number;
  maxClosingTime: number;
  standardDeviation: number;
  byStage: Record<string, number>;
  byValue: {
    small: number; // < 10k
    medium: number; // 10k-50k
    large: number; // > 50k
  };
}

export interface ClosingTimePrediction {
  dealId: string;
  currentStage: string;
  daysInCurrentStage: number;
  expectedDaysRemaining: number;
  expectedCloseDate: Date;
  confidence: number;
  comparisonToAverage: number; // +/- percentage
}

// ============================================================================
// HOOK: useClosingTime
// ============================================================================

export const useClosingTime = (dealId?: string) => {
  return useQuery({
    queryKey: ['closing-time', dealId],
    queryFn: async (): Promise<ClosingTimeData | null> => {
      if (!dealId) return null;

      const { data, error } = await supabase
        .rpc('get_deal_closing_time', { p_deal_id: dealId });

      if (error) throw error;
      if (!data) return null;

      return transformClosingTimeData(data);
    },
    enabled: !!dealId,
  });
};

// ============================================================================
// HOOK: useClosingTimeMetrics
// ============================================================================

export const useClosingTimeMetrics = (
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    stageId?: string;
    salesRepId?: string;
  }
) => {
  return useQuery({
    queryKey: ['closing-time-metrics', filters],
    queryFn: async (): Promise<ClosingTimeMetrics> => {
      const { data, error } = await supabase
        .rpc('get_closing_time_metrics', filters || {});

      if (error) throw error;

      return {
        averageClosingTime: data.avg_days || 0,
        medianClosingTime: data.median_days || 0,
        minClosingTime: data.min_days || 0,
        maxClosingTime: data.max_days || 0,
        standardDeviation: data.std_dev || 0,
        byStage: data.by_stage || {},
        byValue: {
          small: data.by_value?.small || 0,
          medium: data.by_value?.medium || 0,
          large: data.by_value?.large || 0,
        },
      };
    },
  });
};

// ============================================================================
// HOOK: useClosingTimePrediction
// ============================================================================

export const useClosingTimePrediction = (dealId: string) => {
  return useQuery({
    queryKey: ['closing-time-prediction', dealId],
    queryFn: async (): Promise<ClosingTimePrediction | null> => {
      const { data, error } = await supabase
        .rpc('predict_closing_time', { p_deal_id: dealId });

      if (error) throw error;
      if (!data) return null;

      return {
        dealId: data.deal_id,
        currentStage: data.current_stage,
        daysInCurrentStage: data.days_in_stage,
        expectedDaysRemaining: data.expected_days,
        expectedCloseDate: new Date(data.expected_close_date),
        confidence: data.confidence,
        comparisonToAverage: data.vs_average,
      };
    },
    enabled: !!dealId,
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transforma dados brutos em ClosingTimeData
 */
function transformClosingTimeData(rawData: any): ClosingTimeData {
  const stageHistory: DealStageHistory[] = (rawData.stage_history || []).map(
    (stage: any) => ({
      stageId: stage.stage_id,
      stageName: stage.stage_name,
      enteredAt: new Date(stage.entered_at),
      exitedAt: stage.exited_at ? new Date(stage.exited_at) : null,
      durationDays: stage.duration_days || 0,
    })
  );

  // Calcular estágio mais lento e mais rápido
  const sortedByDuration = [...stageHistory].sort(
    (a, b) => b.durationDays - a.durationDays
  );
  const slowestStage = sortedByDuration[0]?.stageName || 'N/A';
  const fastestStage = sortedByDuration[sortedByDuration.length - 1]?.stageName || 'N/A';

  return {
    dealId: rawData.deal_id,
    dealTitle: rawData.deal_title,
    dealValue: rawData.deal_value,
    createdAt: new Date(rawData.created_at),
    wonAt: rawData.won_at ? new Date(rawData.won_at) : null,
    totalDays: rawData.total_days || 0,
    stageHistory,
    averageDaysPerStage: rawData.avg_days_per_stage || 0,
    slowestStage,
    fastestStage,
  };
}

/**
 * Calcula tempo médio por estágio
 */
export function calculateAverageTimeByStage(
  deals: ClosingTimeData[]
): Record<string, number> {
  const stageAccumulator: Record<
    string,
    { total: number; count: number }
  > = {};

  for (const deal of deals) {
    for (const stage of deal.stageHistory) {
      if (!stageAccumulator[stage.stageName]) {
        stageAccumulator[stage.stageName] = { total: 0, count: 0 };
      }
      stageAccumulator[stage.stageName].total += stage.durationDays;
      stageAccumulator[stage.stageName].count += 1;
    }
  }

  const averages: Record<string, number> = {};
  for (const [stageName, { total, count }] of Object.entries(stageAccumulator)) {
    averages[stageName] = count > 0 ? total / count : 0;
  }

  return averages;
}

/**
 * Identifica gargalos no processo de vendas
 */
export function identifyBottlenecks(
  metrics: ClosingTimeMetrics
): Array<{ stage: string; averageDays: number; severity: 'high' | 'medium' | 'low' }> {
  const stages = Object.entries(metrics.byStage).map(([stage, days]) => ({
    stage,
    averageDays: days,
    severity: (days > 14 ? 'high' : days > 7 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
  }));

  return stages.sort((a, b) => b.averageDays - a.averageDays);
}

/**
 * Formata duração em dias para texto legível
 */
export function formatDuration(days: number): string {
  if (days < 1) return '< 1 dia';
  if (days === 1) return '1 dia';
  if (days < 7) return `${Math.round(days)} dias`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'mês' : 'meses'}`;
}

/**
 * Calcula variação percentual em relação à média
 */
export function calculateVarianceFromAverage(
  actualDays: number,
  averageDays: number
): { percentage: number; status: 'faster' | 'slower' | 'on-track' } {
  const percentage = ((actualDays - averageDays) / averageDays) * 100;

  let status: 'faster' | 'slower' | 'on-track';
  if (percentage < -10) status = 'faster';
  else if (percentage > 10) status = 'slower';
  else status = 'on-track';

  return { percentage, status };
}

// ============================================================================
// EXPORT
// ============================================================================

export default useClosingTime;
