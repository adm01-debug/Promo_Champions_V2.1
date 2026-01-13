import { useMemo } from 'react';
import Fuse, { IFuseOptions } from 'fuse.js';

export interface UseFuzzySearchOptions<T> extends IFuseOptions<T> {
  limit?: number;
}

export function useFuzzySearch<T>(
  items: T[],
  keys: string[],
  options?: UseFuzzySearchOptions<T>
) {
  const { limit = 20, ...fuseOptions } = options || {};

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys,
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 1,
      ...fuseOptions,
    });
  }, [items, keys, fuseOptions]);

  const search = (query: string): T[] => {
    if (!query.trim()) {
      return items.slice(0, limit);
    }

    const results = fuse.search(query, { limit });
    return results.map((result) => result.item);
  };

  return { search, fuse };
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  keys: string[],
  options?: UseFuzzySearchOptions<T>
): T[] {
  const { limit = 20, ...fuseOptions } = options || {};

  if (!query.trim()) {
    return items.slice(0, limit);
  }

  const fuse = new Fuse(items, {
    keys,
    threshold: 0.3,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
    ...fuseOptions,
  });

  const results = fuse.search(query, { limit });
  return results.map((result) => result.item);
}
