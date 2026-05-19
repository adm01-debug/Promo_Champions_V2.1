import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';
import { toast } from 'sonner';

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationRunLog {
  id: string;
  workflow_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  trigger_payload: Record<string, unknown> | null;
  actions_executed: Record<string, unknown> | null;
}

/**
 * Hook for managing automation rules (Trigger → Condition → Action).
 * Backed by automation_workflows and automation_runs tables.
 */
export const useAutomationRules = () => {
  return useQuery<AutomationRule[]>({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AutomationRule[];
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAutomationLogs = (workflowId?: string, limit = 100) => {
  return useQuery<AutomationRunLog[]>({
    queryKey: ['automation-logs', workflowId, limit],
    queryFn: async () => {
      let q = supabase
        .from('automation_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);
      if (workflowId) q = q.eq('workflow_id', workflowId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as AutomationRunLog[];
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useToggleAutomationRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase.rpc('toggle_workflow_active', {
        p_workflow_id: id,
        p_active: active,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, { active }) => {
      toast.success(active ? 'Automação ativada' : 'Automação pausada');
      qc.invalidateQueries({ queryKey: ['automation-rules'] });
    },
    onError: () => toast.error('Erro ao alterar automação'),
  });
};
