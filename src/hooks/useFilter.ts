import { useState, useCallback, useMemo } from 'react';

export interface FilterConfig {
  [key: string]: unknown;
}

interface UseFilterOptions<T> {
  initialFilters?: FilterConfig;
  filterFn?: (item: T, filters: FilterConfig) => boolean;
}

interface UseFilterResult<T> {
  filters: FilterConfig;
  filteredData: T[];
  setFilter: (key: string, value: unknown) => void;
  setFilters: (filters: FilterConfig) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useFilter<T extends Record<string, unknown>>(
  data: T[],
  options: UseFilterOptions<T> = {}
): UseFilterResult<T> {
  const { initialFilters = {}, filterFn } = options;

  const [filters, setFiltersState] = useState<FilterConfig>(initialFilters);

  const setFilter = useCallback((key: string, value: unknown) => {
    setFiltersState(prev => {
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const setFilters = useCallback((newFilters: FilterConfig) => {
    setFiltersState(newFilters);
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFiltersState(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const defaultFilterFn = useCallback((item: T, filters: FilterConfig): boolean => {
    return Object.entries(filters).every(([key, filterValue]) => {
      const itemValue = item[key];

      if (filterValue === null || filterValue === undefined) return true;

      // Array filter (e.g., multiple select)
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return true;
        return filterValue.includes(itemValue);
      }

      // String filter (partial match)
      if (typeof filterValue === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
      }

      // Range filter
      if (typeof filterValue === 'object' && filterValue !== null) {
        const { min, max } = filterValue as { min?: number; max?: number };
        const numValue = typeof itemValue === 'number' ? itemValue : Number(itemValue);
        if (isNaN(numValue)) return true;
        if (min !== undefined && numValue < min) return false;
        if (max !== undefined && numValue > max) return false;
        return true;
      }

      // Exact match
      return itemValue === filterValue;
    });
  }, []);

  const filteredData = useMemo(() => {
    const fn = filterFn || defaultFilterFn;
    return data.filter(item => fn(item, filters));
  }, [data, filters, filterFn, defaultFilterFn]);

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeFilterCount = Object.keys(filters).length;

  return {
    filters,
    filteredData,
    setFilter,
    setFilters,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
