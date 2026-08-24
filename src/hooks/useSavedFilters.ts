import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import type { TableUpdate } from '@/lib/supabase/typed-payloads';

export interface SavedFilter {
  id: string;
  name: string;
  entity_type: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useSavedFilters(entityType: string) {
  const queryClient = useQueryClient();

  const { data: filters = [], isLoading } = useQuery({
    queryKey: ['saved-filters', entityType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('entity_type', entityType)
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      return (data || []).map(f => ({
        ...f,
        filters: (f.filters || {}) as Record<string, unknown>,
      })) as SavedFilter[];
    },
  });

  const defaultFilter = filters.find(f => f.is_default) || null;

  const saveFilter = useMutation({
    mutationFn: async ({ name, filterValues, isDefault = false }: { name: string; filterValues: Record<string, unknown>; isDefault?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          name,
          entity_type: entityType,
          filters: filterValues as unknown as Json,
          is_default: isDefault,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', entityType] });
      toast.success('Filtro salvo com sucesso!');
    },
    onError: () => toast.error('Erro ao salvar filtro'),
  });

  const updateFilter = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; filters?: Record<string, unknown>; is_default?: boolean }) => {
      const payload: TableUpdate<'saved_filters'> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.filters !== undefined) payload.filters = updates.filters as unknown as Json;
      if (updates.is_default !== undefined) payload.is_default = updates.is_default;

      const { error } = await supabase
        .from('saved_filters')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', entityType] });
      toast.success('Filtro atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar filtro'),
  });

  const deleteFilter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', entityType] });
      toast.success('Filtro excluído');
    },
    onError: () => toast.error('Erro ao excluir filtro'),
  });

  return {
    filters,
    defaultFilter,
    isLoading,
    saveFilter,
    updateFilter,
    deleteFilter,
  };
}
