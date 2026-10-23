import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useApproveAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase.rpc('approve_agent_run', { _run_id: runId });
      if (error) throw error;
      // approve_agent_run só marca status='running' — a retomada real é feita
      // pelo orchestrator com run_id, que executa os passos pending_approval.
      const { data, error: execError } = await supabase.functions.invoke<{
        run_id: string;
        status: string;
        result: Record<string, unknown>;
      }>('ai-agent-orchestrator', { body: { run_id: runId } });
      if (execError) throw execError;
      return data;
    },
    onSuccess: data => {
      toast.success('Plano aprovado', {
        description: 'As ações aprovadas foram executadas.',
      });
      qc.invalidateQueries({ queryKey: ['agent-runs'] });
      if (data?.run_id)
        qc.invalidateQueries({ queryKey: ['agent-run-details', data.run_id] });
    },
    onError: (e: Error) => toast.error('Falha ao aprovar', { description: e.message }),
  });
}

export function useCancelAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('ai_agent_runs')
        .update({ status: 'cancelled' })
        .eq('id', runId);
      if (error) throw error;
      return runId;
    },
    onSuccess: () => {
      toast.success('Agente cancelado');
      qc.invalidateQueries({ queryKey: ['agent-runs'] });
    },
    onError: (e: Error) => toast.error('Falha ao cancelar', { description: e.message }),
  });
}
