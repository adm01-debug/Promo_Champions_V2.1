import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getLocalISODate } from '@/utils/dateHelpers';
import type { CadenceMetrics } from './useCadenceMetrics';

export type CadenceReportPeriod = 'weekly' | 'monthly' | 'quarterly';

export const CADENCE_REPORT_PERIOD_DAYS: Record<CadenceReportPeriod, number> = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
};

/** Valores aceitos por cadence_steps.action_type (CHECK no banco). */
export const CADENCE_CHANNELS = [
  'whatsapp',
  'call',
  'email',
  'linkedin',
  'meeting',
  'other',
] as const;
export type CadenceChannel = (typeof CADENCE_CHANNELS)[number];

export interface CadenceReportTotals {
  enrolled: number;
  active: number;
  tasksTotal: number;
  tasksCompleted: number;
  replied: number;
  converted: number;
  completionRate: number;
  replyRate: number;
  conversionRate: number;
}

export interface CadenceChannelExecution {
  channel: CadenceChannel;
  total: number;
  completed: number;
  rate: number;
}

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

/**
 * Consolida as linhas de get_cadence_metrics (uma por cadência) em totais do período.
 * A RPC devolve resposta/conversão só como % por cadência; o número absoluto é
 * reconstruído (taxa × inscritos) para ponderar corretamente entre cadências.
 */
export function aggregateCadenceReport(rows: CadenceMetrics[]): CadenceReportTotals {
  let enrolled = 0;
  let active = 0;
  let tasksTotal = 0;
  let tasksCompleted = 0;
  let replied = 0;
  let converted = 0;

  for (const r of rows) {
    const total = Number(r.total_enrolled) || 0;
    enrolled += total;
    active += Number(r.active_count) || 0;
    tasksTotal += Number(r.total_tasks) || 0;
    tasksCompleted += Number(r.tasks_completed) || 0;
    replied += Math.round(((Number(r.reply_rate) || 0) * total) / 100);
    converted += Math.round(((Number(r.conversion_rate) || 0) * total) / 100);
  }

  return {
    enrolled,
    active,
    tasksTotal,
    tasksCompleted,
    replied,
    converted,
    completionRate: pct(tasksCompleted, tasksTotal),
    replyRate: pct(replied, enrolled),
    conversionRate: pct(converted, enrolled),
  };
}

/**
 * Execução real das tarefas de cadência por canal (cadence_steps.action_type) no período:
 * tarefas com vencimento entre (hoje - dias + 1) e hoje, e quantas foram concluídas.
 * Usa contagem exata (head) para não truncar no limite de linhas do PostgREST.
 * Respeita a RLS de cadence_tasks (vendedor vê as próprias; admin/gestor vê todas).
 */
export function useCadenceChannelExecution(days: number) {
  return useQuery({
    queryKey: ['cadence-channel-execution', days],
    queryFn: async (): Promise<CadenceChannelExecution[]> => {
      const today = getLocalISODate();
      const since = getLocalISODate(subDays(new Date(), days - 1));

      const countTasks = async (channel: CadenceChannel, onlyCompleted: boolean) => {
        let query = supabase
          .from('cadence_tasks')
          .select('id, cadence_step:cadence_steps!inner(action_type)', {
            count: 'exact',
            head: true,
          })
          .eq('cadence_step.action_type', channel)
          .gte('scheduled_date', since)
          .lte('scheduled_date', today);
        if (onlyCompleted) query = query.eq('status', 'completed');
        const { count, error } = await query;
        if (error) throw error;
        return count ?? 0;
      };

      const results = await Promise.all(
        CADENCE_CHANNELS.map(async channel => {
          const [total, completed] = await Promise.all([
            countTasks(channel, false),
            countTasks(channel, true),
          ]);
          return { channel, total, completed, rate: pct(completed, total) };
        })
      );

      return results.filter(r => r.total > 0).sort((a, b) => b.rate - a.rate);
    },
    staleTime: 60_000,
  });
}
