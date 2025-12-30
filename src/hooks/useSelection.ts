import { useState, useCallback } from 'react';

interface UseSelectionOptions<T> {
  keyField?: keyof T;
  onSelectionChange?: (selectedItems: T[]) => void;
}

interface UseSelectionResult<T> {
  selectedIds: Set<string>;
  selectedItems: T[];
  isSelected: (item: T) => boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  select: (item: T) => void;
  deselect: (item: T) => void;
  toggle: (item: T) => void;
  selectAll: (items: T[]) => void;
  deselectAll: () => void;
  toggleAll: (items: T[]) => void;
  selectRange: (items: T[], from: T, to: T) => void;
}

export function useSelection<T extends Record<string, unknown>>(
  data: T[],
  options: UseSelectionOptions<T> = {}
): UseSelectionResult<T> {
  const { keyField = 'id' as keyof T, onSelectionChange } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const getKey = useCallback(
    (item: T): string => String(item[keyField]),
    [keyField]
  );

  const isSelected = useCallback(
    (item: T): boolean => selectedIds.has(getKey(item)),
    [selectedIds, getKey]
  );

  const selectedItems = data.filter(item => selectedIds.has(getKey(item)));

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < data.length;

  const updateSelection = useCallback(
    (newIds: Set<string>) => {
      setSelectedIds(newIds);
      const items = data.filter(item => newIds.has(getKey(item)));
      onSelectionChange?.(items);
    },
    [data, getKey, onSelectionChange]
  );

  const select = useCallback(
    (item: T) => {
      const newIds = new Set(selectedIds);
      newIds.add(getKey(item));
      updateSelection(newIds);
    },
    [selectedIds, getKey, updateSelection]
  );

  const deselect = useCallback(
    (item: T) => {
      const newIds = new Set(selectedIds);
      newIds.delete(getKey(item));
      updateSelection(newIds);
    },
    [selectedIds, getKey, updateSelection]
  );

  const toggle = useCallback(
    (item: T) => {
      if (isSelected(item)) {
        deselect(item);
      } else {
        select(item);
      }
    },
    [isSelected, select, deselect]
  );

  const selectAll = useCallback(
    (items: T[]) => {
      const newIds = new Set(items.map(getKey));
      updateSelection(newIds);
    },
    [getKey, updateSelection]
  );

  const deselectAll = useCallback(() => {
    updateSelection(new Set());
  }, [updateSelection]);

  const toggleAll = useCallback(
    (items: T[]) => {
      if (isAllSelected) {
        deselectAll();
      } else {
        selectAll(items);
      }
    },
    [isAllSelected, selectAll, deselectAll]
  );

  const selectRange = useCallback(
    (items: T[], from: T, to: T) => {
      const fromIndex = items.findIndex(item => getKey(item) === getKey(from));
      const toIndex = items.findIndex(item => getKey(item) === getKey(to));

      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);

      const newIds = new Set(selectedIds);
      for (let i = start; i <= end; i++) {
        newIds.add(getKey(items[i]));
      }
      updateSelection(newIds);
    },
    [selectedIds, getKey, updateSelection]
  );

  return {
    selectedIds,
    selectedItems,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    selectRange,
  };
}
