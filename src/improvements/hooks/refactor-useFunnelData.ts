// src/hooks/useFunnelData.ts
// Refatorado: 7 any removidos
// Data: 2024-12-28

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FunnelStage {
  id: string;
  name: string;
  order: number;
  count: number;
  value: number;
  conversionRate: number;
  averageTime: number;
  color: string;
}

export interface FunnelMetrics {
  stages: FunnelStage[];
  totalLeads: number;
  totalValue: number;
  overallConversionRate: number;
  averageDealSize: number;
  leakagePoints: string[];
}

export interface FunnelComparison {
  current: FunnelMetrics;
  previous: FunnelMetrics;
  changes: Record<string, { count: number; percentage: number }>;
}

export interface FunnelFilters {
  dateFrom?: string;
  dateTo?: string;
  salesRepId?: string;
  teamId?: string;
  source?: string;
}

// ============================================================================
// HOOK: useFunnelData
// ============================================================================

export const useFunnelData = (filters?: FunnelFilters) => {
  return useQuery({
    queryKey: ['funnel-data', filters],
    queryFn: async (): Promise<FunnelMetrics> => {
      const { data, error } = await supabase
        .rpc('get_funnel_metrics', filters || {});

      if (error) throw error;

      return transformFunnelData(data);
    },
  });
};

// ============================================================================
// HOOK: useFunnelComparison
// ============================================================================

export const useFunnelComparison = (
  currentPeriod: { from: string; to: string },
  previousPeriod: { from: string; to: string }
) => {
  return useQuery({
    queryKey: ['funnel-comparison', currentPeriod, previousPeriod],
    queryFn: async (): Promise<FunnelComparison> => {
      const [currentData, previousData] = await Promise.all([
        supabase.rpc('get_funnel_metrics', {
          dateFrom: currentPeriod.from,
          dateTo: currentPeriod.to,
        }),
        supabase.rpc('get_funnel_metrics', {
          dateFrom: previousPeriod.from,
          dateTo: previousPeriod.to,
        }),
      ]);

      if (currentData.error) throw currentData.error;
      if (previousData.error) throw previousData.error;

      const current = transformFunnelData(currentData.data);
      const previous = transformFunnelData(previousData.data);
      const changes = calculateChanges(current, previous);

      return { current, previous, changes };
    },
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transforma dados brutos em FunnelMetrics
 */
function transformFunnelData(rawData: any): FunnelMetrics {
  const stages: FunnelStage[] = (rawData.stages || []).map(
    (stage: any, index: number, array: any[]) => {
      const conversionRate =
        index > 0 && array[index - 1].count > 0
          ? (stage.count / array[index - 1].count) * 100
          : 100;

      return {
        id: stage.id,
        name: stage.name,
        order: stage.order,
        count: stage.count || 0,
        value: stage.value || 0,
        conversionRate,
        averageTime: stage.avg_time || 0,
        color: stage.color || getDefaultStageColor(index),
      };
    }
  );

  const totalLeads = stages[0]?.count || 0;
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);
  const wonDeals = stages[stages.length - 1]?.count || 0;
  const overallConversionRate =
    totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;
  const averageDealSize = wonDeals > 0 ? totalValue / wonDeals : 0;

  // Identificar pontos de vazamento (leakage)
  const leakagePoints = identifyLeakagePoints(stages);

  return {
    stages,
    totalLeads,
    totalValue,
    overallConversionRate,
    averageDealSize,
    leakagePoints,
  };
}

/**
 * Calcula mudanças entre períodos
 */
function calculateChanges(
  current: FunnelMetrics,
  previous: FunnelMetrics
): Record<string, { count: number; percentage: number }> {
  const changes: Record<string, { count: number; percentage: number }> = {};

  current.stages.forEach((stage, index) => {
    const prevStage = previous.stages[index];
    if (prevStage) {
      const countChange = stage.count - prevStage.count;
      const percentageChange =
        prevStage.count > 0
          ? ((stage.count - prevStage.count) / prevStage.count) * 100
          : 0;

      changes[stage.name] = {
        count: countChange,
        percentage: percentageChange,
      };
    }
  });

  return changes;
}

/**
 * Identifica pontos de maior vazamento (drop-off)
 */
function identifyLeakagePoints(stages: FunnelStage[]): string[] {
  const leakagePoints: string[] = [];
  const LEAKAGE_THRESHOLD = 40; // 40% de drop considerado crítico

  for (let i = 1; i < stages.length; i++) {
    const dropRate = 100 - stages[i].conversionRate;
    if (dropRate > LEAKAGE_THRESHOLD) {
      leakagePoints.push(
        `${stages[i - 1].name} → ${stages[i].name} (${dropRate.toFixed(1)}% drop)`
      );
    }
  }

  return leakagePoints;
}

/**
 * Retorna cor padrão para estágio baseado no índice
 */
function getDefaultStageColor(index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // green
  ];
  return colors[index % colors.length];
}

/**
 * Calcula taxa de conversão entre dois estágios específicos
 */
export function calculateStageConversion(
  fromStage: FunnelStage,
  toStage: FunnelStage
): number {
  if (fromStage.count === 0) return 0;
  return (toStage.count / fromStage.count) * 100;
}

/**
 * Formata dados do funil para visualização em gráfico
 */
export function formatFunnelForChart(
  metrics: FunnelMetrics
): Array<{
  name: string;
  value: number;
  conversionRate: string;
  color: string;
}> {
  return metrics.stages.map(stage => ({
    name: stage.name,
    value: stage.count,
    conversionRate: `${stage.conversionRate.toFixed(1)}%`,
    color: stage.color,
  }));
}

/**
 * Calcula velocidade do funil (leads por dia)
 */
export function calculateFunnelVelocity(
  metrics: FunnelMetrics,
  days: number
): {
  leadsPerDay: number;
  dealsPerDay: number;
  averageTimeToClose: number;
} {
  const totalLeads = metrics.stages[0]?.count || 0;
  const wonDeals = metrics.stages[metrics.stages.length - 1]?.count || 0;
  const averageTimeToClose =
    metrics.stages.reduce((sum, stage) => sum + stage.averageTime, 0) /
    metrics.stages.length;

  return {
    leadsPerDay: days > 0 ? totalLeads / days : 0,
    dealsPerDay: days > 0 ? wonDeals / days : 0,
    averageTimeToClose,
  };
}

/**
 * Identifica estágio mais lento (gargalo)
 */
export function findBottleneckStage(
  metrics: FunnelMetrics
): FunnelStage | null {
  if (metrics.stages.length === 0) return null;

  return metrics.stages.reduce((slowest, current) =>
    current.averageTime > slowest.averageTime ? current : slowest
  );
}

/**
 * Calcula oportunidade perdida em valor
 */
export function calculateLostOpportunity(
  metrics: FunnelMetrics
): {
  totalLost: number;
  byStage: Record<string, number>;
} {
  const firstStageValue = metrics.stages[0]?.value || 0;
  const lastStageValue =
    metrics.stages[metrics.stages.length - 1]?.value || 0;
  const totalLost = firstStageValue - lastStageValue;

  const byStage: Record<string, number> = {};
  for (let i = 1; i < metrics.stages.length; i++) {
    const lost = metrics.stages[i - 1].value - metrics.stages[i].value;
    if (lost > 0) {
      byStage[metrics.stages[i].name] = lost;
    }
  }

  return { totalLost, byStage };
}

// ============================================================================
// EXPORT
// ============================================================================

export default useFunnelData;
