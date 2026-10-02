/**
 * CRUD administrativo de feature flags (telas /admin/feature-flags e Configurações).
 * Leitura de runtime para usuários continua em useFeatureFlags.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminFeatureFlag {
  id: string;
  key: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  allowed_roles: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagInput {
  key: string;
  description?: string | null;
  is_enabled?: boolean;
  rollout_percentage?: number;
  allowed_roles?: string[] | null;
}

const FLAG_QUERY_KEYS = [['admin-feature-flags'], ['feature-flags']] as const;

const invalidateFlagQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  FLAG_QUERY_KEYS.forEach(queryKey =>
    queryClient.invalidateQueries({ queryKey: [...queryKey] })
  );
};

export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('key');
      if (error) throw error;
      return (data ?? []) as AdminFeatureFlag[];
    },
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeatureFlagInput) => {
      const { error } = await supabase.from('feature_flags').insert(input);
      if (error) throw error;
    },
    onSuccess: () => invalidateFlagQueries(queryClient),
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<FeatureFlagInput>;
    }) => {
      const { error } = await supabase
        .from('feature_flags')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateFlagQueries(queryClient),
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feature_flags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateFlagQueries(queryClient),
  });
}
