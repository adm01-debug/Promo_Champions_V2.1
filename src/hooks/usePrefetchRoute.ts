import { useEffect, useRef } from 'react';

/**
 * Prefetch adjacent route chunks to improve navigation speed.
 * Only prefetches once per route, uses requestIdleCallback for non-blocking behavior.
 */
export function usePrefetchRoutes(routes: string[]) {
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prefetch = (href: string) => {
      if (prefetchedRef.current.has(href)) return;
      prefetchedRef.current.add(href);

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'script';
      document.head.appendChild(link);
    };

    const idle = typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 200);

    const handle = idle(() => {
      routes.forEach(prefetch);
    });

    return () => {
      if (typeof cancelIdleCallback === 'function' && typeof handle === 'number') {
        cancelIdleCallback(handle);
      }
    };
  }, [routes]);
}
