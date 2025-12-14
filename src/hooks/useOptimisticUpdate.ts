import { QueryClient, useQueryClient } from "@tanstack/react-query";

type QueryKey = readonly unknown[];

interface OptimisticContext<T> {
  previousData: T | undefined;
  queryKey: QueryKey;
}

/**
 * Creates optimistic update handlers for React Query mutations
 */
export function createOptimisticHandlers<TData, TVariables>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData | undefined
) {
  return {
    onMutate: async (variables: TVariables): Promise<OptimisticContext<TData>> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update
      queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old, variables));

      return { previousData, queryKey };
    },
    onError: (_error: unknown, _variables: TVariables, context?: OptimisticContext<TData>) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Hook version for components
 */
export function useOptimisticUpdate<TData, TVariables>(
  queryKey: QueryKey,
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData | undefined
) {
  const queryClient = useQueryClient();
  return createOptimisticHandlers<TData, TVariables>(queryClient, queryKey, updateFn);
}

/**
 * Helper to update an item in an array by ID
 */
export function updateItemInArray<T extends { id: string }>(
  items: T[] | undefined,
  id: string,
  updates: Partial<T>
): T[] | undefined {
  if (!items) return undefined;
  return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

/**
 * Helper to remove an item from an array by ID
 */
export function removeItemFromArray<T extends { id: string }>(
  items: T[] | undefined,
  id: string
): T[] | undefined {
  if (!items) return undefined;
  return items.filter((item) => item.id !== id);
}

/**
 * Helper to add an item to the start of an array
 */
export function addItemToArray<T>(
  items: T[] | undefined,
  newItem: T
): T[] | undefined {
  if (!items) return [newItem];
  return [newItem, ...items];
}
