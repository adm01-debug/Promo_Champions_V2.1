import { useState, useCallback } from 'react';

interface UseBulkSelectionOptions<T> {
  items: T[];
  getItemId: (item: T) => string;
}

interface UseBulkSelectionReturn {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectRange: (startId: string, endId: string) => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}

export function useBulkSelection<T>({
  items,
  getItemId,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allIds = items.map(getItemId);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(allIds);
  }, [allIds]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectRange = useCallback((startId: string, endId: string) => {
    const startIndex = allIds.indexOf(startId);
    const endIndex = allIds.indexOf(endId);
    
    if (startIndex === -1 || endIndex === -1) return;

    const [from, to] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];

    const rangeIds = allIds.slice(from, to + 1);
    
    setSelectedIds((prev) => {
      const newSelection = new Set(prev);
      rangeIds.forEach(id => newSelection.add(id));
      return Array.from(newSelection);
    });
  }, [allIds]);

  const isAllSelected = selectedIds.length === items.length && items.length > 0;
  const isPartiallySelected = selectedIds.length > 0 && !isAllSelected;

  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    selectRange,
    isAllSelected,
    isPartiallySelected,
  };
}
