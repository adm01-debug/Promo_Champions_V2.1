import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

/** Valores aceitos pelo CHECK `cadence_steps_action_type_check` no banco. */
export const CADENCE_CHANNEL_TYPES = [
  'email',
  'call',
  'linkedin',
  'whatsapp',
  'meeting',
  'other',
] as const;

export type CadenceChannelType = (typeof CADENCE_CHANNEL_TYPES)[number];

export interface CadenceChannelStat {
  type: CadenceChannelType;
  total: number;
  completed: number;
  rate: number;
}

export interface CadenceChannelStats {
  days: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  channels: CadenceChannelStat[];
  topChannel: CadenceChannelStat | null;
}

/**
 * Conta tarefas de cadência agendadas no período, por canal, direto no banco
 * (HEAD + count exato), sem trazer linhas — evita o corte de 1000 linhas do
 * PostgREST. A RLS de `cadence_tasks` restringe ao vendedor (ou admin/gestor).
 */
async function countTasks(
  channel: CadenceChannelType,
  since: string,
  until: string,
  onlyCompleted: boolean
): Promise<number> {
  let query = supabase
    .from('cadence_tasks')
    .select('id, cadence_steps!inner(action_type)', { count: 'exact', head: true })
    .eq('cadence_steps.action_type', channel)
    .gte('scheduled_date', since)
    .lte('scheduled_date', until);
  if (onlyCompleted) query = query.eq('status', 'completed');
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function fetchCadenceChannelStats(
  days: number,
  today: Date = new Date()
): Promise<CadenceChannelStats> {
  const until = format(today, 'yyyy-MM-dd');
  const since = format(subDays(today, days), 'yyyy-MM-dd');

  const counts = await Promise.all(
    CADENCE_CHANNEL_TYPES.map(async type => {
      const [total, completed] = await Promise.all([
        countTasks(type, since, until, false),
        countTasks(type, since, until, true),
      ]);
      return { type, total, completed };
    })
  );

  const channels = counts
    .filter(c => c.total > 0)
    .map(c => ({ ...c, rate: (c.completed / c.total) * 100 }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total);

  const totalTasks = channels.reduce((sum, c) => sum + c.total, 0);
  const completedTasks = channels.reduce((sum, c) => sum + c.completed, 0);

  return {
    days,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    channels,
    topChannel: channels[0] ?? null,
  };
}

export function useCadenceChannelStats(days: number = 30) {
  return useQuery({
    queryKey: ['cadence-channel-stats', days],
    queryFn: () => fetchCadenceChannelStats(days),
    staleTime: 60_000,
  });
}
