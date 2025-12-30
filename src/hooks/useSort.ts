import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

interface UseSortOptions<T> {
  initialSort?: SortConfig<T>;
  onSort?: (config: SortConfig<T>) => void;
}

interface UseSortResult<T> {
  sortConfig: SortConfig<T>;
  sortedData: T[];
  requestSort: (key: keyof T) => void;
  resetSort: () => void;
  getSortDirection: (key: keyof T) => SortDirection;
}

export function useSort<T extends Record<string, unknown>>(
  data: T[],
  options: UseSortOptions<T> = {}
): UseSortResult<T> {
  const { initialSort = { key: null, direction: null }, onSort } = options;

  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);

  const requestSort = useCallback(
    (key: keyof T) => {
      let direction: SortDirection = 'asc';

      if (sortConfig.key === key) {
        if (sortConfig.direction === 'asc') {
          direction = 'desc';
        } else if (sortConfig.direction === 'desc') {
          direction = null;
        }
      }

      const newConfig = { key: direction ? key : null, direction };
      setSortConfig(newConfig);
      onSort?.(newConfig);
    },
    [sortConfig, onSort]
  );

  const resetSort = useCallback(() => {
    const newConfig = { key: null, direction: null } as SortConfig<T>;
    setSortConfig(newConfig);
    onSort?.(newConfig);
  }, [onSort]);

  const getSortDirection = useCallback(
    (key: keyof T): SortDirection => {
      if (sortConfig.key === key) {
        return sortConfig.direction;
      }
      return null;
    },
    [sortConfig]
  );

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sortConfig]);

  return {
    sortConfig,
    sortedData,
    requestSort,
    resetSort,
    getSortDirection,
  };
}
