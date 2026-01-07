import { useState, useCallback, useMemo } from 'react';

interface UseTableDataOptions<T> {
  data: T[];
  initialSortKey?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
  searchKeys?: (keyof T)[];
}

export const useTableData = <T extends Record<string, unknown>>({
  data,
  initialSortKey,
  initialSortDirection = 'asc',
  searchKeys = []
}: UseTableDataOptions<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey ?? null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSort = useCallback((key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        return String(value).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = sortedData.map(item => String((item as Record<string, unknown>).id));
    setSelectedIds(new Set(allIds));
  }, [sortedData]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    data: sortedData,
    sortKey,
    sortDirection,
    handleSort,
    searchTerm,
    setSearchTerm,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    hasSelection: selectedIds.size > 0,
    selectionCount: selectedIds.size
  };
};

interface UsePaginatedTableOptions<T> extends UseTableDataOptions<T> {
  pageSize?: number;
}

export const usePaginatedTable = <T extends Record<string, unknown>>({
  pageSize = 10,
  ...options
}: UsePaginatedTableOptions<T>) => {
  const tableData = useTableData(options);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tableData.data.length / pageSize);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tableData.data.slice(start, start + pageSize);
  }, [tableData.data, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    ...tableData,
    data: paginatedData,
    allData: tableData.data,
    currentPage,
    totalPages,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
