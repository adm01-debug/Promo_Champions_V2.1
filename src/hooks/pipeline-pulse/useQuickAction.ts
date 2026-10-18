import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type QuickActionId =
  | 'recompute-health'
  | 'route-pending-leads'
  | 'refresh-forecast'
  | 'analyze-recent-calls';

const ACTION_META: Record<
  QuickActionId,
  { fn: string; body?: Record<string, unknown>; label: string }
> = {
  'recompute-health': {
    fn: 'calculate-deal-health',
    body: { batch: true },
    label: 'Health Scores recomputados',
  },
  'route-pending-leads': {
    fn: 'dialer-queue-builder',
    label: 'Leads pendentes roteados',
  },
  'refresh-forecast': {
    // Escritor canônico do forecast persistido (revenue_forecasts) —
    // revenue-forecast-ai é somente leitura e não "atualiza" nada.
    fn: 'generate-revenue-forecast',
    body: { period_type: 'month' },
    label: 'Forecast atualizado',
  },
  'analyze-recent-calls': {
    fn: 'analyze-conversation',
    body: { batch_recent: true },
    label: 'Calls recentes analisadas',
  },
};

export function useQuickAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: QuickActionId) => {
      const meta = ACTION_META[id];
      let body = meta.body;
      if (id === 'route-pending-leads') {
        // Distribui os leads na fila de discagem mais recente.
        const { data: queues } = await supabase
          .from('dialer_queues')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);
        const queueId = queues?.[0]?.id;
        if (!queueId)
          throw new Error(
            'Nenhuma fila de discagem cadastrada — crie uma no Power Dialer.'
          );
        body = { queue_id: queueId };
      }
      const { data, error } = await supabase.functions.invoke(meta.fn, {
        body,
      });
      if (error) throw error;
      return { id, data, label: meta.label };
    },
    onSuccess: res => {
      toast.success(res.label);
      qc.invalidateQueries({ queryKey: ['pipeline-pulse'] });
      if (res.id === 'refresh-forecast') {
        qc.invalidateQueries({ queryKey: ['revenue-forecast'] });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
