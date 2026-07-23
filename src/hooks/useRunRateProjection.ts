import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WON_SALE_STATUSES } from '@/constants';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export type ProjectionConfidence = 'low' | 'medium' | 'high';

export interface RunRateProjection {
  mtdRevenue: number;
  goal: number;
  daysElapsed: number;
  daysRemaining: number;
  daysInMonth: number;
  paceDaily: number;
  projectedEOM: number;
  attainmentProjected: number;
  attainmentCurrent: number;
  gap: number;
  dailyPaceRequired: number;
  confidence: ProjectionConfidence;
  monthEnd: string;
  hasGoal: boolean;
}

/**
 * Cálculo puro — extraído para permitir testes determinísticos sem clock real.
 * Modelo linear (mesmo padrão de useRacePredictions):
 *   paceDaily = mtdRevenue / max(daysElapsed, 1)
 *   projectedEOM = mtdRevenue + paceDaily * daysRemaining
 */
export function computeRunRateProjection(params: {
  mtdRevenue: number;
  goal: number;
  now?: Date;
}): RunRateProjection {
  const now = params.now ?? new Date();
  const mtdRevenue = Math.max(0, params.mtdRevenue || 0);
  const goal = Math.max(0, params.goal || 0);

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const msPerDay = 24 * 60 * 60 * 1000;

  // Dias corridos: dia 1 do mês => daysElapsed = 1 (não 0), para paceDaily fazer sentido.
  const daysElapsed = Math.max(
    1,
    Math.floor((now.getTime() - monthStart.getTime()) / msPerDay) + 1,
  );
  const daysInMonth =
    Math.floor((monthEnd.getTime() - monthStart.getTime()) / msPerDay) + 1;
  const daysRemaining = Math.max(0, daysInMonth - daysElapsed);

  const paceDaily = mtdRevenue / daysElapsed;
  const projectedEOM = mtdRevenue + paceDaily * daysRemaining;

  const hasGoal = goal > 0;
  const attainmentProjected = hasGoal ? projectedEOM / goal : 0;
  const attainmentCurrent = hasGoal ? mtdRevenue / goal : 0;
  const gap = hasGoal ? goal - projectedEOM : 0;
  const dailyPaceRequired =
    hasGoal && daysRemaining > 0 ? Math.max(0, gap) / daysRemaining : 0;

  let confidence: ProjectionConfidence = 'high';
  if (daysElapsed < 5) confidence = 'low';
  else if (daysElapsed < 15) confidence = 'medium';

  return {
    mtdRevenue,
    goal,
    daysElapsed,
    daysRemaining,
    daysInMonth,
    paceDaily,
    projectedEOM,
    attainmentProjected,
    attainmentCurrent,
    gap,
    dailyPaceRequired,
    confidence,
    monthEnd: format(monthEnd, 'yyyy-MM-dd'),
    hasGoal,
  };
}

interface UseRunRateProjectionOptions {
  now?: Date;
}

/**
 * "No seu ritmo atual, você vai fechar R$ X até o fim do mês".
 * Projeção linear pessoal de faturamento vs meta mensal.
 * Modelo intencionalmente simples — Monte Carlo/P10-P90 estão em QuotaPredictorAdvancedPanel.
 */
export function useRunRateProjection(
  salespersonId: string | null | undefined,
  options: UseRunRateProjectionOptions = {},
) {
  const now = options.now ?? new Date();
  const monthKey = format(now, 'yyyy-MM');

  return useQuery({
    queryKey: ['run-rate-projection', salespersonId, monthKey],
    enabled: !!salespersonId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<RunRateProjection> => {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const currentMonth = format(monthStart, 'yyyy-MM-01');

      const [salesRes, goalRes] = await Promise.all([
        supabase
          .from('sales')
          .select('amount, status')
          .or(
            `salesperson_id.eq.${salespersonId},sdr_id.eq.${salespersonId},closer_id.eq.${salespersonId}`,
          )
          .in('status', [...WON_SALE_STATUSES])
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString()),
        supabase
          .from('sales_goals')
          .select('goal_amount')
          .eq('salesperson_id', salespersonId!)
          .eq('month', currentMonth)
          .maybeSingle(),
      ]);

      if (salesRes.error) throw salesRes.error;
      if (goalRes.error && goalRes.error.code !== 'PGRST116') throw goalRes.error;

      const mtdRevenue = (salesRes.data ?? []).reduce(
        (sum, s) => sum + Number(s.amount ?? 0),
        0,
      );
      const goal = Number(goalRes.data?.goal_amount ?? 0);

      return computeRunRateProjection({ mtdRevenue, goal, now });
    },
  });
}
