import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export function useSorting<T extends string>(defaultColumn?: T, defaultDirection: SortDirection = 'desc') {
  const [column, setColumn] = useState<T | undefined>(defaultColumn);
  const [direction, setDirection] = useState<SortDirection>(defaultDirection);

  const toggleSort = (col: T) => {
    if (column === col) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setColumn(col);
      setDirection('asc');
    }
  };

  return { column, direction, toggleSort };
}
