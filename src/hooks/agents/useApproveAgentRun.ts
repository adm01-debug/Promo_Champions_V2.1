import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useApproveAgentRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase.rpc('approve_agent_run', { _run_id: runId });
      if (error) throw error;
      // A aprovação só marca a run como 'running' — a retomada real acontece no
      // orchestrator, que executa os passos pending_approval e conclui a run.
      const { data, error: resumeError } = await supabase.functions.invoke<{
        run_id: string;
        status: string;
        result: Record<string, unknown>;
      }>('ai-agent-orchestrator', { body: { run_id: runId } });
      if (resumeError) throw resumeError;
      return data ?? { run_id: runId, status: 'running' };
    },
    onSuccess: data => {
      toast.success('Plano aprovado', {
        description: `Execução retomada • ${data.status}`,
      });
      qc.invalidateQueries({ queryKey: ['agent-runs'] });
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
