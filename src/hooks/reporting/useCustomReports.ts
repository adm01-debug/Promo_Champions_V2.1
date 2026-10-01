import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import { updatePayload, insertPayload } from '@/lib/supabase/typed-payloads';
import { parseRow, parseRows, toJson } from '@/lib/supabase/parseRows';
import type { ReportEntity, ReportConfig } from './reportBuilderHelpers';

// Linha gerada com colunas estreitadas: `entity`/`config` vêm como string/Json
// no banco, mas o app só grava valores válidos de ReportEntity/ReportConfig.
export interface CustomReport
  extends Omit<Tables<'custom_reports'>, 'entity' | 'config'> {
  entity: ReportEntity;
  config: ReportConfig;
}

export function useCustomReports() {
  return useQuery<CustomReport[]>({
    queryKey: ['custom-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return parseRows<CustomReport>(data);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomReport(id: string | undefined) {
  return useQuery<CustomReport | null>({
    queryKey: ['custom-report', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return parseRow<CustomReport>(data);
    },
    enabled: !!id,
  });
}

export function useCreateCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      entity: ReportEntity;
      config: ReportConfig;
      is_shared?: boolean;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('custom_reports')
        .insert(
          insertPayload('custom_reports', {
            owner_id: userData.user.id,
            name: input.name,
            description: input.description,
            entity: input.entity,
            config: toJson(input.config),
            is_shared: input.is_shared ?? false,
          })
        )
        .select()
        .single();
      if (error) throw error;
      const row = parseRow<CustomReport>(data);
      if (!row) throw new Error('custom_reports: criação não retornou a linha');
      return row;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-reports'] });
      toast.success('Relatório criado');
    },
    onError: e => toast.error(e instanceof Error ? e.message : 'Erro ao criar'),
  });
}

export function useUpdateCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<CustomReport> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_reports')
        .update(
          updatePayload('custom_reports', {
            name: patch.name,
            description: patch.description,
            entity: patch.entity,
            config: patch.config === undefined ? undefined : toJson(patch.config),
            is_shared: patch.is_shared,
          })
        )
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const row = parseRow<CustomReport>(data);
      if (!row) throw new Error('custom_reports: atualização não retornou a linha');
      return row;
    },
    onSuccess: r => {
      qc.invalidateQueries({ queryKey: ['custom-reports'] });
      qc.invalidateQueries({ queryKey: ['custom-report', r.id] });
      toast.success('Salvo');
    },
    onError: e => toast.error(e instanceof Error ? e.message : 'Erro ao salvar'),
  });
}

export function useDeleteCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-reports'] });
      toast.success('Relatório removido');
    },
    onError: e => toast.error(e instanceof Error ? e.message : 'Erro ao remover'),
  });
}
