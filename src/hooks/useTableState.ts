import { useState } from 'react';

export function useTableState<T>() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const toggleRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = (ids: string[]) => setSelectedRows(ids);
  const clearSelection = () => setSelectedRows([]);

  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return {
    selectedRows,
    toggleRow,
    selectAll,
    clearSelection,
    sortColumn,
    sortDirection,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
  };
}
