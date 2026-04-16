import { useCallback, useRef } from 'react';
import { useQueryClient, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

interface OptimisticOptions<TData, TVariables> {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Transform current cache data optimistically before the mutation completes */
  optimisticUpdate: (current: TData[], variables: TVariables) => TData[];
  /** Message on success */
  successMessage?: string;
  /** Message on error + rollback */
  errorMessage?: string;
  /** Additional query keys to invalidate on success */
  invalidateKeys?: QueryKey[];
}

/**
 * useOptimisticMutation — wraps a mutation with instant UI feedback
 * and automatic rollback on failure.
 */
export function useOptimisticMutation<TData, TVariables>({
  queryKey,
  mutationFn,
  optimisticUpdate,
  successMessage = 'Salvo com sucesso!',
  errorMessage = 'Erro ao salvar. Alteração revertida.',
  invalidateKeys = [],
}: OptimisticOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const rollbackRef = useRef<TData[] | null>(null);

  const execute = useCallback(async (variables: TVariables) => {
    // Snapshot current data for rollback
    const previousData = queryClient.getQueryData<TData[]>(queryKey);
    rollbackRef.current = previousData ?? null;

    // Optimistically update the cache
    if (previousData) {
      queryClient.setQueryData<TData[]>(queryKey, optimisticUpdate(previousData, variables));
    }

    try {
      const result = await mutationFn(variables);

      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey });
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

      if (successMessage) toast.success(successMessage);
      return result;
    } catch (error) {
      // Rollback on failure
      if (rollbackRef.current !== null) {
        queryClient.setQueryData<TData[]>(queryKey, rollbackRef.current);
      }

      if (errorMessage) toast.error(errorMessage);
      throw error;
    } finally {
      rollbackRef.current = null;
    }
  }, [queryClient, queryKey, mutationFn, optimisticUpdate, successMessage, errorMessage, invalidateKeys]);

  return { execute };
}
