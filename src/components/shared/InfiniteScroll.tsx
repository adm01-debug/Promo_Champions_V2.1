import { useEffect, useRef } from 'react';

export function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  loading,
}: {
  children: React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}) {
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, loadMore]);

  return (
    <div>
      {children}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {loading && <span>Carregando...</span>}
        </div>
      )}
    </div>
  );
}
