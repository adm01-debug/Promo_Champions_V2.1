import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

interface SaveFilterInput {
  name: string;
  filters: Record<string, unknown>;
  is_default?: boolean;
}

// Stub implementation - table doesn't exist yet
export function useSavedFilters(_entityType: string) {
  const filters: SavedFilter[] = [];
  const isLoading = false;
  const defaultFilter: SavedFilter | undefined = undefined;

  const saveFilter = (_input: SaveFilterInput) => {
    toast.info('Filtros salvos não estão disponíveis ainda');
  };

  const updateFilter = (_input: SaveFilterInput & { id: string }) => {
    toast.info('Filtros salvos não estão disponíveis ainda');
  };

  const deleteFilter = (_id: string) => {
    toast.info('Filtros salvos não estão disponíveis ainda');
  };

  const setDefault = (_id: string) => {
    toast.info('Filtros salvos não estão disponíveis ainda');
  };

  return {
    filters,
    isLoading,
    defaultFilter,
    saveFilter,
    updateFilter,
    deleteFilter,
    setDefault,
    isSaving: false,
  };
}

export default useSavedFilters;
