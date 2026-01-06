import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface SavedFilter<T = Record<string, unknown>> {
  id: string;
  name: string;
  filters: T;
  is_default: boolean;
  created_at: string;
}

interface SaveFilterInput<T> {
  name: string;
  filters: T;
  is_default?: boolean;
}

export function useSavedFilters<T = Record<string, unknown>>(entityType: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = ['saved-filters', entityType, user?.id];

  const { data: filters = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_filters')
        .select('id, name, filters, is_default, created_at')
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as SavedFilter<T>[];
    },
    enabled: !!user?.id,
  });

  const defaultFilter = filters.find(f => f.is_default);

  const saveMutation = useMutation({
    mutationFn: async (input: SaveFilterInput<T>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: user.id,
          entity_type: entityType,
          name: input.name,
          filters: input.filters as any,
          is_default: input.is_default || false,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro salvo com sucesso');
    },
    onError: () => {
      toast.error('Erro ao salvar filtro');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: SaveFilterInput<T> & { id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('saved_filters')
        .update({
          name: input.name,
          filters: input.filters as any,
          is_default: input.is_default,
        })
        .eq('id', input.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro atualizado');
    },
    onError: () => {
      toast.error('Erro ao atualizar filtro');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro excluído');
    },
    onError: () => {
      toast.error('Erro ao excluir filtro');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('saved_filters')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro definido como padrão');
    },
    onError: () => {
      toast.error('Erro ao definir filtro padrão');
    },
  });

  return {
    filters,
    isLoading,
    defaultFilter,
    saveFilter: saveMutation.mutateAsync,
    updateFilter: updateMutation.mutateAsync,
    deleteFilter: deleteMutation.mutateAsync,
    setDefaultFilter: setDefaultMutation.mutateAsync,
    isSaving: saveMutation.isPending || updateMutation.isPending,
  };
}

export default useSavedFilters;
