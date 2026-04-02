import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UI } from "@/config/constants";

interface UseCursorPaginationOptions<T> {
  table: string;
  select?: string;
  orderColumn?: string;
  orderAscending?: boolean;
  pageSize?: number;
  filters?: Record<string, unknown>;
}

interface CursorPage<T> {
  data: T[];
  hasMore: boolean;
  cursor: string | null;
}

export function useCursorPagination<T extends Record<string, any>>({
  table,
  select = "*",
  orderColumn = "created_at",
  orderAscending = false,
  pageSize = UI.PAGE_SIZE_DEFAULT,
  filters = {},
}: UseCursorPaginationOptions<T>) {
  const [pages, setPages] = useState<CursorPage<T>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allItems = pages.flatMap((p) => p.data);
  const hasMore = pages.length === 0 || pages[pages.length - 1].hasMore;

  const fetchPage = useCallback(
    async (cursor?: string | null) => {
      setIsLoading(true);
      setError(null);

      try {
        let query = (supabase as any)
          .from(table)
          .select(select)
          .order(orderColumn, { ascending: orderAscending })
          .limit(pageSize + 1); // fetch one extra to check hasMore

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        // Cursor: fetch items after the last seen value
        if (cursor) {
          query = orderAscending
            ? query.gt(orderColumn, cursor)
            : query.lt(orderColumn, cursor);
        }

        const { data, error: dbError } = await query;

        if (dbError) throw dbError;

        const items = (data || []) as T[];
        const hasMoreItems = items.length > pageSize;
        const pageItems = hasMoreItems ? items.slice(0, pageSize) : items;
        const nextCursor = pageItems.length > 0
          ? String((pageItems[pageItems.length - 1] as any)[orderColumn])
          : null;

        const newPage: CursorPage<T> = {
          data: pageItems,
          hasMore: hasMoreItems,
          cursor: nextCursor,
        };

        setPages((prev) => (cursor ? [...prev, newPage] : [newPage]));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    },
    [table, select, orderColumn, orderAscending, pageSize, JSON.stringify(filters)]
  );

  const loadFirst = useCallback(() => {
    setPages([]);
    return fetchPage(null);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    const lastCursor = pages[pages.length - 1]?.cursor;
    return fetchPage(lastCursor);
  }, [hasMore, isLoading, pages, fetchPage]);

  const reset = useCallback(() => {
    setPages([]);
    setError(null);
  }, []);

  return {
    items: allItems,
    isLoading,
    error,
    hasMore,
    loadFirst,
    loadMore,
    reset,
    pageCount: pages.length,
  };
}
