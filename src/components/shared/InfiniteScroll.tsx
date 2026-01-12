import { FC, ReactNode, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps {
  children: ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
}

export const InfiniteScroll: FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  isLoading = false,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  loadingComponent,
  endMessage,
  emptyMessage,
  isEmpty = false,
}) => {
  const [sentinelRef, isIntersecting] = useIntersection<HTMLDivElement>({
    threshold,
    rootMargin,
  });

  const loadMoreCallback = useCallback(() => {
    if (isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    loadMoreCallback();
  }, [loadMoreCallback]);

  if (isEmpty) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        {emptyMessage || (
          <p className="text-muted-foreground text-center">
            Nenhum item encontrado
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {children}
      
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-1" />
      
      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            {loadingComponent || (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Carregando...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* End message */}
      {!hasMore && !isLoading && (
        <div className="py-8 text-center">
          {endMessage || (
            <p className="text-sm text-muted-foreground">
              ✓ Todos os itens carregados
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Hook for paginated infinite scroll
export const usePaginatedInfiniteScroll = <T,>(
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  initialData: T[] = []
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn(page);
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, isLoading, hasMore]);

  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [initialData]);

  return {
    data,
    hasMore,
    isLoading,
    error,
    loadMore,
    reset,
    isEmpty: data.length === 0 && !isLoading,
  };
};


