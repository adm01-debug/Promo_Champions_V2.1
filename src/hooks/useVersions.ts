import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Version {
  id: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  data: Record<string, unknown>;
  changed_by: string | null;
  changed_at: string;
  change_summary: string | null;
}

// Stub implementation - table doesn't exist yet
export function useVersions(_entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['versions', _entityType, entityId];

  const { data: versions = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<Version[]> => {
      // Table doesn't exist yet, return empty array
      return [];
    },
    enabled: !!entityId,
  });

  const restoreMutation = useMutation({
    mutationFn: async (_versionId: string) => {
      toast.info('Versionamento não está disponível ainda');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { versions, isLoading, restoreVersion: restoreMutation.mutate, currentVersion: versions[0] };
}
